import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res, next) => {
    //TODO: create playlist
    try {
        const {name, description} = req.body;
        if(!name || !description){
            throw new ApiError(400, "Please enter required fields");
        }

        const userId = req.user?._id;
        const playList = await Playlist.create({
            name,
            description,
            owner: userId
        });

        return res.status(200).json(new ApiResponse(200, playList, "Playlist created successfully"));
    } catch (error) {
        next(error)
    }
})

const getUserPlaylists = asyncHandler(async (req, res, next) => {
    //TODO: get user playlists
    try {
        const {userId} = req.params;

        const playList = await Playlist.find({owner: userId}).select("-owner");
        if(!playList){
            throw new ApiError(500, "Playlist Not found");
        }
        return res.status(200)
        .json(new ApiResponse(200, playList, "Playlists fetched successfully"));
    } catch (error) {
        next(error)
    }
    
})

const getPlaylistById = asyncHandler(async (req, res),next => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    try {
        const {playlistId, videoId} = req.params;

        const playlist = await Playlist.findById(playlistId);
        if(!playlist){
            throw new ApiError(400, "Playlist not found");
        }

        const userId = new mongoose.Types.ObjectId(req.user?.id);
        const newId = new mongoose.Types.ObjectId(playlist.owner);
        if(!userId.equals(newId)){
            throw new ApiError(400, "You are not owner of the playlisy");
        }

        const updated = await Playlist.findByIdAndUpdate(playlistId,
            {
                $push : {videos : videoId}
            },
            {$new: true}
        );

        if(!updated){
            throw new ApiError(500, "Could not add video");
        }
        return res.status(200)
        .json(new ApiResponse(200, updated , "Video added successfully"));
    } catch (error) {
        next(error);
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    try {
        const {playlistId, videoId} = req.params;


        const playlist = await Playlist.findById(playlistId);
        if(!playlist){
            throw new ApiError(400, "Playlist not found");
        }

        const userId = new mongoose.Types.ObjectId(req.user?.id);
        const newId = new mongoose.Types.ObjectId(playlist.owner);
        if(!userId.equals(newId)){
            throw new ApiError(400, "You are not owner of the playlisy");
        }

        playlist.videos = playlist.videos.filter((id) => videoId.toString() !== id.toString() );
        await playlist.save();

        return res.status(200)
        .json(new ApiResponse(200, playlist, "Video removed successfully"));
    } catch (error) {
        
    }

})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    try {
        const {playlistId} = req.params;
        if(!playlistId){
            throw new ApiError(400, "PLaylist Id is invalid");
        }

        const playlist = await Playlist.findById(playlistId);
        if(!playlist){
            throw new ApiError(400, "Playlist not found");
        }

        const userId = new mongoose.Types.ObjectId(req.user?.id);
        const newId = new mongoose.Types.ObjectId(playlist.owner);
        if(!userId.equals(newId)){
            throw new ApiError(400, "You are not owner of the playlisy");
        }

        const del = await Playlist.findByIdAndDelete(playlistId);
        if(!del){
            throw new ApiError(500, "PLaylist could not be deleted");
        }

        return res.status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
    } catch (error) {
        next(error);
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist
    try {
        const {playlistId} = req.params;
        const {name, description} = req.body;
        if(!name || !description){
            throw new ApiError(400, "Please enter all the required fields");
        }
        if(!playlistId){
            throw new ApiError(400, "PLaylist Id is invalid");
        }

        const playlist = await Playlist.findById(playlistId);
        if(!playlist){
            throw new ApiError(400, "Playlist not found");
        }

        const userId = new mongoose.Types.ObjectId(req.user?.id);
        const newId = new mongoose.Types.ObjectId(playlist.owner);
        if(!userId.equals(newId)){
            throw new ApiError(400, "You are not owner of the playlisy");
        }

        const newPlaylist = await Playlist.findByIdAndUpdate(playlistId,
            {
                $set: {
                    name: name,
                    description: description
                }
            },
            {$new: true}
        );
        if(!newPlaylist){
            throw new ApiError(500, "PLaylist could not be updated");
        }
        return res.status(200)
        .json(new ApiResponse(200, newPlaylist, "Playlist updated Successfully"));
    } catch (error) {
        next(error);
    }

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
