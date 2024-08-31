import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const toggleVideoLike = async (req, res, next) => {
    //TODO: toggle like on video
    const {videoId} = req.params;
    const userId = req.user._id;

    try {
        const like = await Like.find({likedBy: userId, video: videoId});
        if(like){
            const delLike = await Like.Like.findOneAndUpdate(
                {likedBy: userId},
                {
                    $unset: { video: 1 }
                }
            );
            return res.status(200)
            .json(new ApiResponse(200, {}, "Like deletd"));
        }
        else{
            const createLike = await Like.create({
                likedBy: userId,
                video: videoId
            });
            if(!createLike){
                throw new ApiError(500, "Like could not be created");
            }
            return res.status(200)
            .json(new ApiResponse(200, createLike, "Like created"));
        }
    } catch (error) {
        next(error);
    }

}

const toggleCommentLike = async (req, res, next) => {
    const {commentId} = req.params;
    //TODO: toggle like on comment
    const userId = req.user._id;
    try {
        const like = await Like.find({likedBy: userId, comment: commentId});
        if(like){
            const delLike = await Like.findOneAndUpdate(
                {likedBy: userId},
                {
                    $unset: { comment: 1 }
                }
            );
            return res.status(200)
            .json(new ApiResponse(200, {}, "Like deletd"));
        }
        else{
            const createLike = await Like.create({
                likedBy: userId,
                comment: commentId
            });
            if(!createLike){
                throw new ApiError(500, "Like could not be created");
            }
            return res.status(200)
            .json(new ApiResponse(200, createLike, "Like created"));
        }
    } catch (error) {
        next(error);
    }
}

const toggleTweetLike = async (req, res, next) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user._id;
    try {
        const like = await Like.find({likedBy: userId, tweet: tweetId});
        if(like){
            const delLike = await Like.findOneAndUpdate(
                {likedBy: userId},
                {
                    $unset: { tweet: 1 }
                }
            );
            return res.status(200)
            .json(new ApiResponse(200, {}, "Like deletd"));
        }
        else{
            const createLike = await Like.create({
                likedBy: userId,
                tweet: tweetId
            });
            if(!createLike){
                throw new ApiError(500, "Like could not be created");
            }
            return res.status(200)
            .json(new ApiResponse(200, createLike, "Like created"));
        }
    } catch (error) {
        next(error);
    }
}


const getLikedVideos = async (req, res) => {
    //TODO: get all liked videos
}

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}