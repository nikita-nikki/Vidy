import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const user = req.user
    if (!user) {
        throw new ApiError(400, "Unauthorized request.")
    }
    const { content } = req.body
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content cannot be empty.")
    }

    const tweet = await Tweet.create({
        content,
        owner: user._id
    })

    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating the new tweet.")
    }
    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet is created successfully."))
})

const getAllTweets = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
        throw new ApiError(401, "Login required!")
    }

    const tweets = await Tweet.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        // Lookup likes for this tweet
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        // Lookup comments for this tweet
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "tweet",
                as: "comments"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                content: 1,
                owner: 1,
                createdAt: 1,
                likesCount: 1,
                commentsCount: 1,
                isLiked: 1
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "All tweets fetched successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const user = req.user
    if (!user) {
        throw new ApiError(401, "Login required!")
    }

    const { userId } = req.params

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId || req.user._id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        // Lookup likes for this tweet
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        // Lookup comments for this tweet
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "tweet",
                as: "comments"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                content: 1,
                owner: 1,
                createdAt: 1,
                likesCount: 1,
                commentsCount: 1,
                isLiked: 1
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const user = req.user
    const { tweetId } = req.params

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found.")
    }

    //ownership checking
    if (!tweet.owner.equals(user?._id)) {
        throw new ApiError(403, "Unauthorized request.")
    }
    console.log("ownership checked!");

    const { content } = req.body
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content cannot be empty.")
    }
    tweet.content = content
    await tweet.save()

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet is updated successfully."))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const user = req.user
    const { tweetId } = req.params

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (!tweet.owner.equals(user?._id)) {
        throw new ApiError(403, "Unauthorized request.")
    }

    await tweet.deleteOne()

    return res
        .status(201)
        .json(new ApiResponse(201, null, "Tweet is deleted successfully."))
})

export {
    createTweet,
    getAllTweets,
    getUserTweets,
    updateTweet,
    deleteTweet
}
