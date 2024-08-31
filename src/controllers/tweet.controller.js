import { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const createTweet =  async (req, res, next) => {
    //TODO: create tweet
    try {
        const { content } = req.body;
        const owner = req.user?._id;
    
        if(!content) {
            throw new ApiError(400, "Content is required");
        }
        const tweet = await Tweet.create({
            content: content,
            owner : owner
        });
        if(!tweet){
            throw new ApiError(500, "Could not create tweet");
        }
    
        return res.status(200)
        .json(new ApiResponse(200, tweet, "Tweet created successfully"));
    } catch (error) {
        next(error);
    }
} 

const getUserTweets =  async (req, res) => {
    // TODO: get user tweets
    try {
        const {userId} = req.params;

        const userTweets = await Tweet.find({owner: userId});
        if(!userTweets){
            throw new ApiError(500, "Could not find tweets because they might not exist or server problem");
        }
        return res.status(200)
        .json(new ApiResponse(200, userTweets, "Tweets fetched successfully"));
    } catch (error) {
        next(error);
    }
} 

const updateTweet = async (req, res) => {
    //TODO: update tweet
    try {
        const {content} = req.body;
        const {tweetId} = req.params;
        if(!isValidObjectId(tweetId)){
            throw new ApiError(400, "Invalid tweet ID");
        }
        if(!content) {
            throw new ApiError(400, "Content is required");
        }
        const newTweet = await Tweet.findByIdAndUpdate({
            _id: tweetId
            },
            {
                $set: {
                    content: content
                }
            },
            {
                $mew: true
            }
        );
    
        if(!newTweet){
            throw new ApiError(500, "Could not update content");
        }
        return res.status(200)
        .json(new ApiResponse(200, newTweet, "Tweet updated successfully"));
    } catch (error) {
        next(error)
    }

} 

const deleteTweet =  async (req, res) => {
    //TODO: delete tweet
    try {
        const {tweetId} = req.params;
        const isDeleted = await Tweet.findByIdAndDelete(tweetId);
    
        if(!isDeleted){
            throw new ApiError(500, "Could not delete Tweet");
        }
        return res.status(200)
        .json(200, {}, "Tweet deleted successfully");
    } catch (error) {
        next(error);
    }
} 

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}