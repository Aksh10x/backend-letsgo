import { Schema } from "mongoose";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; //bearer token, whoever has the token can recieve the data

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,  //opimizes searching
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String, //cloudinary url
        required: true,
    },
    coverImage: {
        type: String, //cloudinary url
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String,
    }

}, {timestamps: true});

userSchema.pre('save', async function( next ){    //pre = middleware before saving

    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password) {

    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){

    

    return jwt.sign(
        {
            _id: this._id,  //payload
            emai: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,  //payload
            emai: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}



export const User = mongoose.model("User", userSchema)