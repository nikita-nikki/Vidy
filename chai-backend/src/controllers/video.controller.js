import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import fs from "fs"
import { verify } from "crypto"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    // Build match stage - only apply query filter if query is provided
    const matchStage = {};
    if (query && query.trim() !== '') {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    // Filter unpublished videos:
    // If no userId is provided (public feed), show only published.
    // If userId IS provided, check if the requester is the owner. If not, show only published.
    if (!userId || !req.user._id.equals(userId)) {
        matchStage.isPublished = true;
    }

    const allVideos = await Video.aggregate([
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "videoOwner"
            }
        },
        {
            $unwind: "$videoOwner"
        },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                duration: 1,
                _id: 1,
                views: 1,
                isPublished: 1,
                owner: {
                    username: "$videoOwner.username",
                    fullName: "$videoOwner.fullName",
                    avatar: "$videoOwner.avatar"
                }
            }
        },
        {
            $sort: {
                [sortBy]: sortType == "asc" ? 1 : -1
            }
        },
        {
            $skip: (parseInt(page) - 1) * (parseInt(limit))
        },
        {
            $limit: parseInt(limit)
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, allVideos, "Video fetched successfully."))

})

const publishAVideo = asyncHandler(async (req, res) => {

    const user = req.user
    if (!user) {
        throw new ApiError(400, "You must be logged in!")
    }

    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    if (
        [title, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required.")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required.")
    }

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail required for now")
    }
    //console.log(videoLocalPath);


    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    // console.log("Files are uploaded.");

    const duration = videoFile.duration

    fs.unlinkSync(videoLocalPath)
    fs.unlinkSync(thumbnailLocalPath)

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration,

        isPublished: true,
        owner: user._id
    })

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video has been uploaded successfully."))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?._id

    //TODO: get video by id
    const video = await Video.findById(videoId).populate('owner', 'username fullName avatar')
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    video.views += 1;
    await video.save()

    // Add video to user's watch history
    if (userId) {
        // Remove the video if it already exists in history (to avoid duplicates)
        // Then add it to the beginning (most recent)
        await User.findByIdAndUpdate(
            userId,
            {
                $pull: { watchHistory: videoId }
            }
        )
        await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    watchHistory: {
                        $each: [videoId],
                        $position: 0
                    }
                }
            }
        )
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video has found."))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const user = req.user
    if (!user) {
        throw new ApiError(401, "You must be logged in.")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found.")
    }
    //ownership
    if (!video.owner.equals(user._id)) {
        throw new ApiError(403, "You're not allowed to update this.")
    }

    const { title, description } = req.body

    const thumbnailLocalPath = req.file?.path

    console.log(thumbnailLocalPath);

    if (title) {
        video.title = title
        //await video.save()
    }
    if (description) {
        video.description = description
    }
    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        fs.unlinkSync(thumbnailLocalPath)
        video.thumbnail = thumbnail.url
        console.log("thumbnail updated");

    }

    await video.save()

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video is updated!"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const user = req.user
    if (!user) {
        throw new ApiError(400, "You must be logged in!")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found.")
    }

    //ownership checking
    if (!video.owner.equals(user._id)) {
        throw new ApiError(403, "Unauthorized request")
    }

    await video.deleteOne()

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video has been deleted successfully."))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "VideoId is required.")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "VideoId is not valid")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found.")
    }

    if (!video.owner.equals(req.user?._id)) {
        throw new ApiError(403, "You are not authorized to perform this action")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
        .status(200)
        .json(new ApiResponse(200, video, "isPublish has been toggled successfully."))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
