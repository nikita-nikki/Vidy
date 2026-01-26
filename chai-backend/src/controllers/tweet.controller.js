import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const user  = req.user
    if(!user){
        throw new ApiError(400,"Unauthorized request.")
    }
    const {content} = req.body
    if(!content || content.trim() ===""){
        throw new ApiError(400,"Tweet content cannot be empty.")
    }

    const tweet  = await Tweet.create({
        content,
        owner: user._id
    })

    if(!tweet){
        throw new ApiError(500,"Something went wrong while creating the new tweet.")
    }
    return res
      .status(201)
      .json(new ApiResponse(201,tweet,"Tweet is created successfully."))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const user = req.user
    if(!user){
        throw new ApiError(401,"Login required!")
    }

    const tweet = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id) 
            }
        },
        {
            $project: {
                content: 1
            }
        }
    ])

    if(!tweet?.length){
        throw new ApiError(404,"Tweet does not exists.")
    }

    return res
       .status(200)
       .json(new ApiResponse(200,tweet,"This is the tweets"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const user = req.user
    const {tweetId} = req.params

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"Tweet not found.")
    }

    //ownership checking
    if(!tweet.owner.equals(user?._id)){
        throw new ApiError(403,"Unauthorized request.")
    }
    console.log("ownership checked!");
    
    const {content} = req.body
    if(!content || content.trim() === ""){
        throw new ApiError(400,"Tweet content cannot be empty.")
    }
    tweet.content = content
    await tweet.save()

    return res
       .status(200)
       .json(new ApiResponse(200,tweet,"Tweet is updated successfully."))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const user = req.user
    const {tweetId} = req.params

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }

    if(!tweet.owner.equals(user?._id)){
        throw new ApiError(403,"Unauthorized request.")
    }

    await tweet.deleteOne()

    return res
      .status(201)
      .json(new ApiResponse(201,null,"Tweet is deleted successfully."))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
