import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    //ndifferent method 
    if (!videoId) {
        throw new ApiError(404, "VideoId not found!");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(401, "VideoId is not valid");
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
                as: "commentOwner"
            }
        },
        {
            $unwind: "$commentOwner"
        },
        {
            $skip: (parseInt(page) - 1) * parseInt(limit),
        },
        {
            $limit: parseInt(limit),
        },
        {
            $project: {
                content: 1,
                "videoOwner.username": 1,
                "videoOwner.fullname": 1,
                "videoOwner.avatar": 1
            }
        }
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200,comments,"Comments of the video."))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const user = req.user; //current user
    if(!user){
        throw new ApiError(400,"You must be logged in!")
    }

    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400,"Video id is required.")
    }

    const {content} = req.body
    if(content.trim() ===""){
        throw new ApiError(400,"Comment content is required")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: user._id
    })

    const addedComment = await Comment.findById(comment._id)

    if(!addedComment){
        throw new ApiError(500,"Something went wrong while adding new comment")
    }

    return res
        .status(201)
        .json(new ApiResponse(201,addedComment,"Commented successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const user = req.user
    if(!user){
        throw new ApiError(400,"You must be logged in.")
    }

    const {commentId} = req.params
    const {content} = req.body

    //console.log(commentID);

    if (!commentId) {
        throw new ApiError(400, "commentId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }


    if(!content || content.trim() ===""){
        throw new ApiError(400,"Comment content is required.")
    }

    
    
    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404,"comment not found.")
    }
    //ownership checking
    if(!comment.owner.equals(user._id)){
        throw new ApiError(403,"Unauthorized request.")
    }

    comment.content = content;
    await comment.save();

    return res
       .status(200)
       .json(new ApiResponse(200,comment,"Comment is updated successfully!"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const user = req.user

    const {commentId} = req.params

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404,"Comment not found")
    }
    //ownership checking
    if(!comment.owner.equals(user._id)){
        throw new ApiError(403,"Unauthorized request.")
    }
    await comment.deleteOne()

    return res
       .status(200)
       .json(200,null,"Deleted comment successfully.")
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
