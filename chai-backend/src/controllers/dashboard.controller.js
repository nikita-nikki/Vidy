import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const user = req.user
    if(!user){
        throw new ApiError(401,"Login required.")
    }

    const userId = new mongoose.Types.ObjectId(user._id)

    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: userId
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1},
                totalViews: { $sum: "$views"}
            }
        }
    ]);

    const subscriberStats = await Subscription.aggregate([
        {
            $match: {
                channel: userId
            }
        },
        {
            $group: {
                _id: null,
                totalSubscribers: { $sum: 1}
            }
        }
    ]);

    const likeStats = await Like.aggregate([
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
            $match: {
                "video.owner": userId
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: { $sum: 1}
            }
        }
    ]);

    return res
      .status(200)
      .json(new ApiResponse(
        200,
        {
            totalVideos: videoStats[0]?.totalVideos || 0,
            totalViews: videoStats[0]?.totalViews || 0,
            totalSubscribers: subscriberStats[0]?.totalSubscribers || 0,
            totalLikes: likeStats[0]?.totalLikes || 0
        },
        "Channel stats fetched successfully."
      ))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const user = req.user
    if(!user){
        throw new ApiError(401,"Login required.")
    }

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(user._id)
            }
        },
        {
            $project: {
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,

            }
        }
    ]);

    return res
      .status(200)
      .json(new ApiResponse(
        200,
        videos,
        "Video fetched successfully."
      ))
})

export {
    getChannelStats, 
    getChannelVideos
    }