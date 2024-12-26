import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {Like} from "../models/likes.model.js"
import { Video} from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async(req,res) => {
    const {videoId} = req.params

    const video = await Video.findById(videoId)

    if (!video){
        throw new ApiError(400,"Video does not exist")
    }

    const like = await Like.findOne({
        $and:[
            {likedBy: req.user._id},
            {video: video}
        ]
    })

    if(!like){
        const newLike = {
            video,
            likedBy: req.user._id,
        }
        const toggledLike = await Like.create(newLike)
        return res.status(200).json(
            new ApiResponse(200,toggledLike,"Video liked successfully, like toggled")
        )
    }

    await Like.findByIdAndDelete(like._id)

    return res.status(200).json(
        new ApiResponse(200,{},"Video unliked successfully, like toggled")
    )
    
})

const toggleTweetLike= asyncHandler(async(req,res) =>{
    const {tweetId} = req.params

    const tweet = await Tweet.findById(tweetId)

    if (!tweet){
        throw new ApiError(400,"Tweet does not exist")
    }

    const like = await Like.findOne({
        $and:[
            {likedBy: req.user._id},
            {tweet: tweet}
        ]
    })

    if(!like){
        const newLike = {
            tweet,
            likedBy: req.user._id,
        }
        const toggledLike = await Like.create(newLike)
        return res.status(200).json(
            new ApiResponse(200,toggledLike,"Tweet liked successfully, like toggled")
        )
    }

    await Like.findByIdAndDelete(like._id)

    return res.status(200).json(
        new ApiResponse(200,{},"Tweet unliked successfully, like toggled")
    )
})

const toggleCommentLike= asyncHandler(async(req,res) =>{
    const {commentId} = req.params

    const comment = await Comment.findById(commentId)

    if (!comment){
        throw new ApiError(400,"Comment does not exist")
    }

    const like = await Like.findOne({
        $and:[
            {likedBy: req.user._id},
            {comment: comment}
        ]
    })

    if(!like){
        const newLike = {
            comment,
            likedBy: req.user._id,
        }
        const toggledLike = await Like.create(newLike)
        return res.status(200).json(
            new ApiResponse(200,toggledLike,"Comment liked successfully, like toggled")
        )
    }

    await Like.findByIdAndDelete(like._id)

    return res.status(200).json(
        new ApiResponse(200,{},"Comment unliked successfully, like toggled")
    )
})

const getVideoLikes = asyncHandler(async(req,res) => {
    const {videoId} = req.params

    let video
    try {
        video = await Video.findById(videoId)
    } catch (error) {
        throw new ApiError(400,"Video id is invalid")
    } 

    if(!video){
        throw new ApiError(400,"Video does not exist")
    }

    

    const likes = await Like.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        }, 
    ])

    if(!likes){
        return res.status(200).json(
            new ApiResponse(200,{likeAmount: 0},"Video has 0 likes")
        )
    }

    return res.status(200).json(
        new ApiResponse(200,{
            likes: likes,
            likeAmount: likes.length,
        },
        "Likes successfully retrieved"
    )
    )
})

export {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    getVideoLikes
}