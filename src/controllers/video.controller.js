import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
}

const publishAVideo = async (req, res, next) => {
    // TODO: get video, upload to cloudinary, create video

    try {
        const { title, description} = req.body
        const videoFileLocalPath = req.files?.videoFile?.at(0).path;
        const thumbnailoFileLocalPath = req.files?.thumbnail?.at(0).path;
        const userId = req.user?._id;
        if(!title || !description || !videoFileLocalPath || !thumbnailoFileLocalPath){
            throw new ApiError(400, "Please Enter all the required fields");
        }
    
        const video = await uploadOnCloudinary(videoFileLocalPath);
        const thumbnail = await uploadOnCloudinary(thumbnailoFileLocalPath);
    
        if(!video || ! thumbnail){
            throw new ApiError(400, "Video or Thumbnail upload failed");
        }
    
        const createdVideo = await Video.create({
            videoFile: video.url,
            thumbnail: thumbnail.url,
            title,
            description,
            duration: video.duration,
            owner: userId
        });
        if(!createdVideo){
            throw new ApiError(400, "Video creation failed in database");
        }


        return res.status(200)
        .json(200, createdVideo, "Video created and uploaded successfully");

    } catch (error) {
        next(error);
    }

}

const getVideoById = async (req, res, next) => {
    //TODO: get video by id
    try {
        const { videoId } = req.params;
        if(!videoId){
            throw new ApiError(400, "Invalid Video ID");
        }

        const video = await Video.findById(videoId);
        if(!video){
            throw new ApiError(400, "Video not found");
        }
        return res.status(200)
        .json(200, video, "Video fetched successfully");

    } catch (error) {
        next(error);
    }

}

const updateVideo = async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    try {
        const { videoId } = req.params;
        const {title, description} = req.body;
        const thumbnail = req.file?.thumbnail.path;

        if(!videoId || !title || !description || !thumbnail){
            throw new ApiError(400, "Please enter required details");
        }

        const video = await Video.findById(videoId);
        const isDeleted = await deleteFromCloudinary(video.thumbnail);
        if(!isDeleted){
            throw new ApiError(400, "File could not be deleted");
        }

        const uploaded = await uploadOnCloudinary(thumbnail);

        const newVideo = await Video.findByIdAndUpdate({ _id: videoId },
            {
                $set: {
                    title: title,
                    description: description,
                    thumbnail: uploaded.url
                }
            },
            { $new: true }
        );

        return res.status(200)
        .josn(200, newVideo, "Video updated successfully");
    
    } catch (error) {
        next(error);
    }

}

const deleteVideo = async (req, res) => {
    //TODO: delete video
    try {
        const { videoId } = req.params;
        if(!videoId){
            throw new ApiError(400, "Invalid Video ID");
        }

        const deleteVideo = await Video.findById(videoId);
        const delThumbnail = await deleteFromCloudinary(deleteVideo.thumbnail);
        const delVideo= await deleteFromCloudinary(deleteVideo.video);

        if(!delThumbnail || !delVideo){
            throw new ApiError(400, "Delete unsuccessfully");
        }
        await Video.findByIdAndDelete(videoId);
        return res.status(200)
        .josn(200, newVideo, "Video deleted successfully");
    } catch (error) {
        next(error);
    }
}

const togglePublishStatus = async (req, res) => {
    try {
        const { videoId } = req.params;
        if(!videoId){
            throw new ApiError(400, "Invalid Video ID");
        };
        const video = await Video.findById(videoId);
        if(!video){
            throw new ApiError(400, "Invalid Video");
        }
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const vId = new mongoose.Types.ObjectId(video.owner);
        if(!userId.equals(vId)){
            throw new ApiError(400, "You are not the owner of the video");
        }
        if(video.isPublished){
            video.isPublished=false;
            await video.save();
            return res.status(200)
            .josn(200, {}, "Video unpublished successfully");
        }
        else{
            video.isPublished=true;
            await video.save();
            return res.status(200)
            .josn(200, {}, "Video published successfully");
        }
    } catch (error) {
        
    }
}

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}