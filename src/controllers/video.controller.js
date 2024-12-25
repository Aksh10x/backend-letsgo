import {asyncHandler} from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

const publishVideo = asyncHandler(async(req,res) => {
    const {title, description} = req.body
    const user = req.user

    if([title,description].some((field) => {
        field?.trim() === ""
    })){
        throw new ApiError(400,"Title and Descreption are required fields")
    }

    
    const thumbnailLocalPath = await req.files?.thumbnail?.[0].path 
    const videoLocalPath = await req.files?.video?.[0].path 
    console.log(thumbnailLocalPath,"\n",videoLocalPath)


    if(!(thumbnailLocalPath || videoLocalPath)){
        throw new ApiError(400,"Thumbnail and Video are required fields")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const video = await uploadOnCloudinary(videoLocalPath)

    if(!(video || thumbnail)){
        throw new ApiError(400,"Thumbnail and Video are required fields")
    }

    console.log(video);

    const publishedVideo = await Video.create(
        {
            title,
            description,
            thumbnail: thumbnail.url,
            videoFile: video.url,
            duration: video.duration,
            owner: user,

        }
    )

    res.status(200).json(
        new ApiResponse(201,publishedVideo,"Video published successfully")
    )
});

const getVideoById = asyncHandler(async(req,res) => {
    const {videoId} = req.params

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video does not exist")
    }

    res.status(200).json(
        new ApiResponse(200,video,"Video with given id was found")
    )
})

const updateVideo = asyncHandler(async(req,res) => {
    const {videoId} = req.params

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"Video id is invalid")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(401,"Unauthorized access")
    }

    const {newTitle, newDescription} = req.body
    const newThumbnailLocalPath = req.file ? req.file?.path : ""

    if([newTitle,newDescription].some((field) => {
        field?.trim() === ""
    })){
        throw new ApiError(400,"Title and Descreption are required fields")
    }

    if(!newThumbnailLocalPath){
        throw new ApiError(400,"Thumbnail is a required field")
    }

    const thumbnail = await uploadOnCloudinary(newThumbnailLocalPath)

    video.title = newTitle
    video.description = newDescription
    video.thumbnail = thumbnail.url

    await video.save({validateBeforeSave: false})

    const updatedVideo = await Video.findById(videoId)

    res.status(200).json(
        new ApiResponse(200,updatedVideo,"Video details updated")
    )

})

const togglePublishStatus = asyncHandler(async(req,res) => {
    const {videoId} = req.params

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"Video id is invalid")
    }
    
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(401, "Unauthorized access")
    }

    video.isPublished = req.body.isPublished

    await video.save({validateBeforeSave: false})

    res.status(200).json(
        new ApiResponse(200,{isPublished: req.body.isPublished}, "Publish status updated")
    )
})

const getAllVideos = asyncHandler(async(req,res) => {
    const { page = 1, limit = 1, query, sortBy = "likes", sortType = -1 , userId } = req.query

    const options = {page, limit}


    const userQuery = query ? {
        $or: [
            {title: {
                $regex: query,
                $options: "i",
            }},
            {description: {
                $regex: query,
                $options: "i",
            }}
        ]
    } : {}
    
    const pipeline = [
        {
            $match: userQuery,
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "createdBy",
            }
        },
        {
            $unwind: "$createdBy"
        },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                videoFile: 1,
                createdBy: {
                    fullName: 1,
                    avatar: 1,
                    username: 1,
                }
            }
        },
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1,
            }
        },

    ]

    // if(userId){
        
    // }

    try {
        const paginatedVideos = await Video.aggregatePaginate(pipeline, options)
        return res.status(200).json(
            new ApiResponse(200,paginatedVideos,"Videos successfully retrieved")
        )
    } catch (error) {
        throw new ApiError(500,"Something went wrong while paginating")
    }

    

})

export {
    publishVideo,
    getVideoById,
    updateVideo,
    togglePublishStatus,
    getAllVideos
}