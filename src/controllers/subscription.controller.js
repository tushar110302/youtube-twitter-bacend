import ApiResponse from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import mongoose, {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import { User } from "../models/user.model.js"


const toggleSubscription = async (req, res, next) => {
    try {
        const {channelId} = req.params
        const channel = await User.findById(channelId);
        if(!channelId || !channel){
            throw new ApiError(400, "Channel not found");
        }
        const uuserId = req.user?._id;
        const subscribed = await Subscription.findOne({ subscriber: uuserId, channel: channelId });

        if(subscribed){
            const unSubscribe = await Subscription.findOneAndDelete({ subscriber: uuserId, channel: channelId });
            if(!unSubscribe){
                throw new ApiError(400, "Unsubscribe error");
            }
            return res.status(200)
            .json(new ApiResponse(200, {}, "Unubscribed Successfully"));
        }
        else{
            const subscribe = await Subscription.create({
                subscriber: uuserId,
                channel: channelId
            });
            if(!subscribe){
                throw new ApiError(400, "Unsubscribe error");
            }
            return res.status(200)
            .json(new ApiResponse(200, {}, "Subscribed Successfully"));
        }

    } catch (error) {
        next(error);
    }
    // TODO: toggle subscription
}

// controller to return subscriber list of a channel
const getUserChannelSubscribers = async (req, res, next) => {
    try {
        const {subscriberId} = req.params
        if(!subscriberId || !isValidObjectId(subscriberId)){
            throw new ApiError(400, "Invalid channel");
        }

        const subs = await Subscription.aggregate([
            {
                $match: { channel: new mongoose.Types.ObjectId(subscriberId) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscriberDetails"
                }
            },
            {
                $addFields: {
                    subscriberDetails: {
                        $first: "$subscriberDetails"
                    }
                }
            },
            {
                $project: {
                    "$subscriberDetails.username": 1,
                    "$subscriberDetails.avatar": 1,
                    "$subscriberDetails.fullName": 1
                }
            }
        ]);
        if(!subs){
            return new ApiError(400, "No subscribers found");
        }

        return res.status(200)
        .json(200, subs ,"Subscribers fetched successfully for the channel");
    } catch (error) {
        next(error)
    }
}

// controller to return channel list to which user has subscribed
const getSubscribedChannels = async (req, res, next) => {
    try {
        const { channelId } = req.params
        if(!channelId || !isValidObjectId(channelId)){
            throw new ApiError(400, "Invalid Subscriber ");
        }
    
        const channelList = await Subscription.aggregate([
            {
                $match: new mongoose.Types.ObjectId(channelId)
            },
            {
                $lookup: {
                    from: "users",
                    localField: "channel",
                    foreignField: "_id",
                    as: "channelList"
                }
            },
            {
                $addFields: {
                    channelList: {
                        $first: "$channelList"
                    }
                }
            },
            {
                $project: {
                    "$channelList.username": 1,
                    "$channelList.avatar": 1,
                    "$channelList.fullName": 1
                }
            }
        ]);
        if(!channelList){
            throw new Error(400, "No channels found");
        }

        return res.status(200)
        .json(200, channelList, "Channels fetched successfully");
    } catch (error) {
        next(error);
    }

}

export {toggleSubscription, getSubscribedChannels, getUserChannelSubscribers};