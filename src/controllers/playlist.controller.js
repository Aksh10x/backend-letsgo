import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {Video} from "../models/video.model.js"
import {Playlist} from "../models/playlist.model.js"
import { User } from "../models/user.model.js";

const createPlaylist = asyncHandler(async(req,res) => {
    const {name, description} = req.body

    if(name.trim() === ""){
        throw new ApiError(400, "Playlist name is requuired")
    }

    const newPlaylist = {
        name,
        description,
        owner: req.user._id,
    }

    const playlist = await Playlist.create(newPlaylist)

    return res.status(200).json(
        new ApiResponse(200,playlist,"New playlist successfully created")
    )

})

const getUserPlaylists = asyncHandler(async(req,res) => {
    const {userId} = req.params

    const user = await User.findById(userId)

    if(!user){
        throw new ApiError(400, "User does not exist")
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
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
            $unwind: "$owner"
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
                name: 1,
                description: 1,
                username: 1,
                fullName: 1,
                avatar: 1
                
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200,playlists,"Playlist successfully retrieved")
    )
})

const addVideoToPlaylist = asyncHandler(async(req,res) => {
    const {playlistId, videoId} = req.params

    const playlist = await Playlist.findById(playlistId)

    const video = await Video.findById(videoId)

    if(!(video || playlist)){
        throw new ApiError(400,"Playlist or video does not exist")
    }

    
    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(401,"Unauthorized access")
    }

    const playlistVideos = playlist.videos

    const lol = (playlistVideos.map((vid) => {
        if(vid._id.toString() === video._id.toString()) return true
        else return false
    }))

    if(lol.find((el) => {
        if(el == true) return 1
    })){
        throw new ApiError(400, "Video already exists in playlist")
    }

    playlist.videos.push(video)

    await playlist.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(200,playlist,"Video added successfully")
    )

})

const deleteVideoFromPlaylist = asyncHandler(async(req,res) => {
    const {playlistId, videoId} = req.params

    const playlist = await Playlist.findById(playlistId)

    const video = await Video.findById(videoId)

    if(!(video || playlist)){
        throw new ApiError(400,"Playlist or video does not exist")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(401,"Unauthorized access")
    }

    const videoToDelete = playlist.videos.find((vid) => {
        if(vid.toString() === videoId.toString()){
            return videoId
        }
    })

    if(!videoToDelete){
        throw new ApiError(400, "Video does not exist in playlist, invalid local id")
    }

    const newVideoList = playlist.videos.filter((vid) => {
        if(vid._id.toString() === videoToDelete.toString()) return
        else return vid

    })

    playlist.overwrite({
        name: playlist.name,
        description: playlist.description,
        owner: playlist.owner,
        createdAt: playlist.createdAt,
        videos: newVideoList})

    playlist.save({validateBeforeSave: false})

    res.status(200).json(
        new ApiResponse(200,playlist,"Video deleted successfully")
    )
})

const getPlaylistById = asyncHandler(async(req,res) => { //aggregation left for user and videos match with id, 1 lookup for user
    const {playlistId} = req.params                      //2 lookup for videos and nested lookup for owner of video

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"Playlist does not exist")
    }

    res.status(200).json(
        new ApiResponse(200,playlist,"Playlist successfully retrieved")
    )
})

const deletePlaylist = asyncHandler(async(req,res) => {
    const {playlistId} = req.params

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"Playlist or video does not exist")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(401,"Unauthorized access")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res.status(200).json(
        new ApiResponse(200,{},"Playlist deleted successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    addVideoToPlaylist,
    deleteVideoFromPlaylist,
    getPlaylistById,
    deletePlaylist
}