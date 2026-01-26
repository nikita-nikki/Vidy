import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const user = req.user
    if(!user){
        throw new ApiError(401,"You must be logged in.")
    }

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "channelId is not valid.");
    }

    const channelObjectId = new mongoose.Types.ObjectId(channelId);
    const subscriberObjectId = new mongoose.Types.ObjectId(user._id);

    const isSubscribed = await Subscription.exists({
        channel: channelObjectId,
        subscriber: subscriberObjectId
    });

     if (!isSubscribed) {
        const newSubscriber = await Subscription.create({
            channel: channelObjectId,
            subscriber: subscriberObjectId,
        });
    } else {
        const unsubscribe = await Subscription.findByIdAndDelete(isSubscribed._id);
    }

    return res
     .status(200)
     .json(200,"Toggled subscription successfully.")
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "channelId is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "channelId is not valid.");
  }


//   {
//   $facet: {
//     pipelineA: [ /* stages */ ],
//     pipelineB: [ /* stages */ ]
//   }
// }

// {
//   $facet: {
//     subscribers: [ ... ],
//     totalSubscribers: [ ... ]
//   }
// }



  const result = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $facet: {
        subscribers: [
          {
            $lookup: {
              from: "users",
              localField: "subscriber",
              foreignField: "_id",
              as: "subscriber",
            },
          },
          {
            $unwind: "$subscriber",
          },
          {
            $project: {
              _id: 0,
              username: "$subscriber.username",
              fullName: "$subscriber.fullName",
              avatar: "$subscriber.avatar",
            },
          },
        ],
        totalSubscribers: [
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const subscribers = result[0]?.subscribers || [];
  const totalSubscribers = result[0]?.totalSubscribers[0]?.count || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalSubscribers,
        subscribers,
      },
      "Subscriber list fetched successfully."
    )
  );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    
     if (!subscriberId) {
        throw new ApiError(400, "subscriberId is required.");
    }
    
    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400, "subscriberId is not valid.");
    }

    const result = await Subscription.aggregate([
        {
          $match: {
            subscriber: new mongoose.Types.ObjectId(subscriberId)
          }
        },
        {
            $facet: {
                subscriberTo: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "channel",
                            foreignField: "_id",
                            as: "subscriberTo"
                        }
                    },
                    {
                        $unwind: "$subscriberTo"
                    },
                    {
                        $project: {
                            _id: 0,
                            "subscriberTo.username": 1,
                            "subscriberTo.fullName": 1,
                            "subscriberTo.avatar": 1,
                        }
                    }
                ],
                totalChannels: [
                    {
                        $count: "count"
                    }
                ]
            }
        }
    ]);

    const channels = result[0]?.subscriberTo || [];
    const totalChannels = result[0]?.totalChannels[0]?.count || 0;

    return res
      .status(200)
      .json(new ApiResponse(
        200,
        {
            totalChannels,
            channels
        },
        "SubscribedTo list fetched successfully."
      ))


})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}



