import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from "mongoose"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const addComment = asyncHandler(async(req,res) => {
    const {content} = req.body
    const {videoId} = req.params

    if(!content.trim()){
        throw new ApiError(400,"Content is a required field")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400, "Video does not exist")
    }

    const newComment = {
        content,
        video: video._id,
        owner: req.user._id,
    }

    const comment = await Comment.create(newComment)

    return res.status(200).json(
        new ApiResponse(200,comment,"Comment uploaded successfully")
    )
})

const editComment = asyncHandler(async(req,res) => {
    const {newContent} = req.body
    const {commentId} = req.params

    if(!newContent.trim()){
        throw new ApiError(400,"Content is a required field")
    }

    const comment = await Comment.findByIdAndUpdate(commentId,
        {content: newContent},
        {new: true}
    ).then(comment => {
        return res.status(200).json(
            new ApiResponse(200,comment,"Successfully updated comment")
        )
    }
    ).catch((error) =>{
        throw new ApiError(400, "Comment does not exist")
    }
    )

})

const deleteComment = asyncHandler(async(req,res) => {
    const {commentId} = req.params

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(400,"Comment does not exist")
    }

    if(comment.owner._id.toString() !== req.user._id.toString()){
        throw new ApiError(401,"The comment is not created by the user")
    }

    await Comment.findByIdAndDelete(commentId)

    res.status(200).json(
        new ApiResponse(200,"Comment has been deleted successfully")
    )
})

const getVideoComments = asyncHandler(async(req,res) =>{
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400,"Enter a video id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"Video does not exist")
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner",
        },
        {
            $addFields: {
                username: "$owner.username",
                fullName: "$owner.fullName",
                avatar: "$owner.avatar"
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                content: 1,
            }
        }   
    ])

    return res.status(200).json(
        new ApiResponse(200,comments,"Comments successfully retrieved")
    )
})

export {
    addComment,
    editComment,
    deleteComment,
    getVideoComments
}
