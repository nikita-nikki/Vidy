import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const user = req.user
    if(!user){
        throw new ApiError(401,"You must be logged in.")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: user._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)

        return res
           .status(200)
           .json(new ApiResponse(200,{liked: false},"Video unliked."))
    }

    await Like.create({
        video: videoId,
        likedBy: user._id
    })
    
     return res
        .status(200)
        .json(new ApiResponse(200,{liked: true},"Video liked."))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const user = req.user
    if(!user){
        throw new ApiError(401,"You must be logged in.")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: user._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)

        return res
           .status(200)
           .json(new ApiResponse(200,{liked: false},"Comment unliked."))
    }

    await Like.create({
        comment: commentId,
        likedBy: user._id
    })
    
     return res
        .status(200)
        .json(new ApiResponse(200,{liked: true},"Comment liked."))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const user = req.user
    if(!user){
        throw new ApiError(401,"You must be logged in.")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: user._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)

        return res
           .status(200)
           .json(new ApiResponse(200,{liked: false},"Tweet unliked."))
    }

    await Like.create({
        tweet: tweetId,
        likedBy: user._id
    })
    
     return res
        .status(200)
        .json(new ApiResponse(200,{liked: true},"Tweet liked."))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const user = req.user 
    if(!user){
        throw new ApiError(401,"You must be logge in.")
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
               $and: [
                   { likedBy: new mongoose.Types.ObjectId(user._id) },
                   { video: { $ne: null } }
                ]
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $project: {
                "video.thumbnail": 1,
                "video.title": 1,
                "video.description": 1,
                "video.duration": 1,
                "video.views": 1,
                "video.owner": 1,

            }
        }
    ]);

    

    return res
      .status(200)
      .json(new ApiResponse(200,likedVideos,"Liked videos are fetched successfully."))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}