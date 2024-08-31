import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const getVideoComments = async (req, res,next) => {
    //TODO: get all comments for a video
    try {
        const {videoId} = req.params
        const {page = 1, limit = 10} = req.query
        if (!videoId) {
            throw new ApiError(400, "Invalid video (D");
        }
        const comments = await Comment.find({video: videoId}).select("content");
        if(!comments){
            throw new ApiError(400, "Comments not found");
        }

        return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"));
    } catch (error) {
        next(error);
    }
}

const addComment =async (req, res,next) => {
    // TODO: add a comment to a video
    try {
        const {content} = req.body;
        if(!content) {
            throw new ApiError(400, "Content is required");
        }
        const {videoId} = req.params;
        const userId = req.user?._id;
    
        const comment = await Comment.create({
            content,
            videoId,
            userId
        });
        if(!comment){
            throw new ApiError(500, "Could not add comment");
        }
        return res.status(200).json(new ApiResponse(200, comment, "Comment created successfully"));
    } catch (error) {
        next(error);
    }
}

const updateComment = async (req, res,next) => {
    // TODO: update a comment
    try {
        const {content} = req.body;
        if(!content) {
            throw new ApiError(400, "Content is required");
        }
        const {commentId} = req.params;
        const newComment = await Comment.findByIdAndUpdate({_id: commentId}, {
            $set: {
                content: content
            }
        })
        if(!newComment){
            throw new ApiError(500, "Could not update comment");
        }

        return res.status(200).json(new ApiResponse(200, newComment, "Comment updated successfully"));
    } catch (error) {
        next(error);
    }
}

const deleteComment = async (req, res,next) => {
    // TODO: delete a comment
    try {
        const {commentId} = req.params;

        const deleteCom = await Comment.findByIdAndDelete(commentId);
        if(!deleteCom){
            throw new ApiError(500, "Could not delete comment");
        }
        return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"));
    } catch (error) {
        nect(error);
    }
}

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }