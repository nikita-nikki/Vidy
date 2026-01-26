import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"



const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    const user  = req.user
    if(!user){
        throw new ApiError(400,"Login required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: new mongoose.Types.ObjectId(user._id)
    });

    if(!playlist){
        throw new ApiError(500,"Something went wrong while creating playlist.")
    }

    return res
       .status(200)
       .json(new ApiResponse(
        200,
        playlist,
        "Playlist is created successfully."
       ))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!userId){
        throw new ApiError(400,"userId is required.")
    }

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"userId is invalid")
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                videos: 1,
                owner: 1
            }
        }
    ]);
    
    return res
      .status(200)
      .json(new ApiResponse(
        200,
        playlists,
        "userPlaylists is fetched successfully."
      ))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId){
        throw new ApiError(400,"playlistId is required.")
    }
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"playlistId is invalid")
    }

    const playlist = await Playlist.findById(playlistId)

    return res
      .status(200)
      .json(new ApiResponse(
        200,
        playlist,
        "Playlist fetched successfully."
      ))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const user = req.user
    if(!user){
        throw new ApiError(401,"Login required.")
    }
    if(!playlistId || !videoId){
        throw new ApiError(400,"playlistId and videoId both required.")
    }

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const existingPlaylist = await Playlist.findById(playlistId);
    if (!existingPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    if(!existingPlaylist.owner.equals(user._id)){
        throw new ApiError(403,"Unauthorized reuest.")
    }

    const playlistObjectId = new mongoose.Types.ObjectId(playlistId)
    const videoObjectId = new mongoose.Types.ObjectId(videoId)

    if (existingPlaylist.videos.includes(videoObjectId)) {
        throw new ApiError(404, "Video already in this playlist");
    }

     const updatedPlaylist = await Playlist.updateOne(
        { _id: playlistObjectId },
        { $addToSet: { videos: videoObjectId } }
    );

    return res
      .status(200)
      .json(new ApiResponse(
        200,
        updatePlaylist,
        "Video addedd successfully."
      ))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const user = req.user
    if(!user){
        throw new ApiError(401,"Login required.")
    }
    if(!playlistId || !videoId){
        throw new ApiError(400,"playlistId and videoId both required.")
    }

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const existingPlaylist = await Playlist.findById(playlistId);
    if (!existingPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    if(!existingPlaylist.owner.equals(user._id)){
        throw new ApiError(403,"Un authorized reuest.")
    }

    const playlistObjectId = new mongoose.Types.ObjectId(playlistId)
    const videoObjectId = new mongoose.Types.ObjectId(videoId)

    if (!existingPlaylist.videos.includes(videoObjectId)) {
        throw new ApiError(404, "Video not found in this playlist");
    }

    const updatedPlaylist = await Playlist.updateOne(
        { _id: playlistObjectId },
        { $pull: { videos: videoObjectId } }
    );

    return res
      .status(200)
      .json(new ApiResponse(
        200,
        updatePlaylist,
        "Video removed successfully."
    ))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const user = req.user
    if(!user){
        throw new ApiError(401,"Login required.")
    }

    if(!playlistId){
        throw new ApiError(400,"playlistId is required.")
    }
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"playlistId is invalid")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist not found.")
    }
    //ownership checking
    if(!playlist.owner.equals(user._id)){
        throw new ApiError(403,"Unauthorized request.")
    }

    await playlist.deleteOne()

    return res
       .status(200)
       .json(new ApiResponse(
        200,
        playlist,
        "Playlist deleted successfully."
       ))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    const user = req.user
    if(!user){
        throw new ApiError(401,"Login required.")
    }
    if(!playlistId){
         throw new ApiError(400,"playlistId required.")
    }
    if(!name && !description){
         throw new ApiError(400,"Name or description required.")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist not found.")
    }

    if(name){
        playlist.name = name
    }
    if(description){
        playlist.description = description
    }
    await playlist.save()

    return res 
      .status(201)
      .json(new ApiResponse(
        201,
        playlist,
        "Playlist updated successfully."
      ))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
