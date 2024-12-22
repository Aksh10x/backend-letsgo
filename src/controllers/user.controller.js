import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/apiResponse.js"


const registerUser = asyncHandler(async(req,res) => {
    const {
        fullName,
        email,
        username,
        password
    } = req.body;
    console.log("email: ",email);

    if ([fullName,email,username,password].some((field) => {
        field?.trim() === ""
    })) {
        throw new ApiError(400,"All fields are required");
    }

    if(email.indexOf("@") === -1){
        throw new ApiError(400,"Enter a valid email address")
    }

    const userExists = () => {User.findOne({
        $or: [{username}, {email}]
    })};

    if(userExists){
        throw new ApiError(409, "User with same email or username already exists")
    };

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar required")
    };

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar required")
    };

    const user = User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser  = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user.")
    }

    return rest.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )

});

export {registerUser};