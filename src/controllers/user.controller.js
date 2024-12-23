import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessandRefreshTokens = async (userId) => {
    try{
        const user = await User.findOne(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken,refreshToken};

    }
    catch(error){
        throw new ApiError(400, "Something went wrong while generating tokens");
    }
}

const registerUser = asyncHandler(async(req,res) => {
    const {
        fullName,
        email,
        username,
        password
    } = req.body;


    if ([fullName,email,username,password].some((field) => {
        field?.trim() === ""
    })) {
        throw new ApiError(400,"All fields are required");
    }

    if(email.indexOf("@") === -1){
        throw new ApiError(400,"Enter a valid email address")
    }

    const userExists = await User.findOne({
        $or: [{username}, {email}]
    });

    if(userExists){
        throw new ApiError(409, "User with same email or username already exists")
    };

    
    const avatarLocalPath = await req.files?.avatar[0]?.path;
    
    const coverImageLocalPath = await req.files?.coverImage ? req.files?.coverImage[0]?.path : "";

    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar required")
    };

    
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if(!avatar){
        throw new ApiError(400, "Avatar required")
    };

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user?._id);


    await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user.")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )

});


const loginUser = asyncHandler(async(req,res) => {
    const {email,username,password} = req.body;

    if(!(email || username)){
        throw new ApiError(400,"Username or email is required");
    };

    const user = await User.findOne({
        $or:[{email},{username}],
    });

    if(!user){
        throw new ApiError(404, "User does not exist")
    };

    const isPasswordValid = await user.isPasswordCorrect(password);
    
    if(!isPasswordValid){
        throw new ApiError(401, "Password is invalid")
    };


    const {accessToken,refreshToken} = await generateAccessandRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser,
                refreshToken,
                accessToken,
            },
            "User logged in successfully"
        )
    )

});

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(req.user._id, 
        {
            $set: {
                refreshToken: undefined,
            } 
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out succesffully"))
});

const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(400,"Invalid token")
    }

    const options = {
        httpOnly: true,
        secure: true,
    }

    const {accessToken, newRefreshToken} = await generateAccessandRefreshTokens(user._id);

    res.status(200).cookie("accesToken", accessToken, options).cookie("refreshToken", newRefreshToken, options).json(
        new ApiResponse(200,{accessToken, refreshToken: newRefreshToken}, "Token refreshed successfully.")
    );
});

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Old password is incorrect")
    }

    user.password = newPassword

    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(200,{},"Password changed successfully")
    )
});

const getCurrentUser = asyncHandler(async(req,res) => {
    return res.status(200).json(
        new ApiResponse(200,req.user,"Current user fetched successfully")
    )
})

const updateUserAvatar = asyncHandler(async(req,res) => {
    const newAvatarLocalPath = req.file?.path

    if(!newAvatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const newAvatar = await uploadOnCloudinary(newAvatarLocalPath)

    if(!avatar.url){
        throw new ApiError(401,"Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        { $set:{
            avatar: newAvatar.url,
        }},
        {new: true}
    ).select("-password")

    res.status(200).json(
        new ApiResponse(200,user,"Avatar changed successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req,res) => {
    const newCoverLocalPath = req.file?.path || ""


    const newCover = await uploadOnCloudinary(newCoverLocalPath)

    if(!newCover.url){
        throw new ApiError(401,"Error while uploading cover image")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        { $set:{
            coverImage: newCover.url,
        }},
        {new: true}
    ).select("-password")

    res.status(200).json(
        new ApiResponse(200,user,"Cover Image changed successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateUserAvatar,
    updateUserCoverImage
};