import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false}); // This property avoids validations mentioned in Schema defined
        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Error while generating access or refresh tkoens");
    }
}

const registerUser = async(req, res, next) => {
   try {
    const {email, username, fullName, password} = req.body;

    if(email.trim() === "" || username.trim() === "" || fullName.trim() === "" || password.trim() === ""){
        throw new ApiError(400, "Please Enter all the required fields");
    }

    const exists = await User.findOne({ $or: [{username: username}, {email: email} ]});
    if(exists){
        throw new ApiError(400, "User already exists");
    }

    // req.files because multiple files are being uploaded, but for single syntax will be different
    const avatarLocalPath = req.files?.avatar?.at(0).path;
    const coverImageLocalPath = req.files?.coverImage?.at(0).path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const cover = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar image upload problem");
    }

    const user = await User.create({
        fullName,
        email,
        avatar: avatar.url,
        coverImage: cover?.url || "",
        username: username.toLowerCase(),
        password
    });
    const createdUser = await User.findById(user._id).select("-password");
    if(!createdUser){
        throw ApiError(500, "User registeration problem")
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
   } 
   catch (error) {
    console.log(error);
    next(error)
   }
}

const loginUser = async(req,res, next) => {
    try{    
        const {email, password} = req.body;
        if(!email){
            throw new ApiError(400, "Email is required");
        }
        const user = await User.findOne({email: email});
        if(!user){
            throw new ApiError(404, "User Not Found");
        }

        const checkPassword = await user.isPasswordCorrect(password);
        if(!checkPassword){
            throw new ApiError(401, "Incorrect Password");
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
        const findUser = await User.findById(user._id).select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true
        }

        res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, findUser, "User Logged in Successfully"));
    }
    catch(error){
        console.log(error);
        next(error);
    }
}

const logOutUser = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {$set: {refreshToken: ""}});

        const options = {
            httpOnly: true,
            secure: true
        }

        res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out Successfully"));

    } catch (error) {
        console.log(error);
        next(error);
    }
}

const renewAccessToken = async(req, res, next) => {
    try {
        const incomingToken = req.cookies.refreshToken;
        if(!incomingToken){
            throw new ApiError(401, "Incorrect Refresh Token");
        }
        const decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(401, "Invalid Access Token");
        }
        
        if (incomingToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh Token expired or something");
        }
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
        const options = {
            httpOnly: true,
            secure: true
        }

        res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {accessToken, refreshToken}, "Token regenerated Successfully"));
    }
    catch (error) {
        next(error);
    }
}

const changePassword = async (req, res, next) => {
    try {
        const {oldPassword, newPassword} = req.body;
        if(oldPassword === newPassword){
            throw new ApiError(400, "Enter a different password");
        }
        const user = await User.findById(req.user._id);
        const isCorrect = await user.isPasswordCorrect(oldPassword);
        if(!isCorrect){
            throw new ApiError(400, "Incorrect Password entered");
        }

        user.password = newPassword;
        await user.save({validateBeforeSave : false});

        return res.status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));

    } catch (error) {
        next(error);
    }
}

const getUser = async (req, res, next) => {
    return res.status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
}

const updateAccountDetails = async (req, res, next) => {
    try {
        const {email , fullName} = req.body;
        if(!email || !fullName){
            throw new ApiError(400, "Enter the required fields");
        }
        const user = await User.findByIdAndUpdate(req.user?._id,
            {
                $set: {fullName: fullName, email: email}
            },
            { new: true }
        ).select("-password -refreshToken");

        return res.status(200)
        .json(new ApiResponse(200, user, "Details updated successfully"));
    } 
    catch (error) {
        next(error);
    }
}

const updateAvatar = async (req, res, next) => {
    try {
        // Here single file is uploaded so only req.file
        const avatarLocalPath = req.file?.path;
        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar Image is required"); 
        }
        const user = await User.findById(req.user._id).select("-password -refreshToken");
        user.avatar = "";

        const uploadPath = await uploadOnCloudinary(avatarLocalPath);
        if(!uploadPath){
            throw new ApiError(400, "Avatar Image upload failed");
        }
        user.avatar = uploadPath.url;
        await user.save({validateBeforeSave: false});

        return res.status(200)
        .json(new ApiResponse(200, user, "Avatar Image Updated Successfully"));

    } catch (error) {
        next(error);
    }
}

const updateCoverImage = async (req, res, next) => {
    try {
        // Here single file is uploaded so only req.file
        const coverImageLocalPath = req.file?.path;
        if(!coverImageLocalPath){
            throw new ApiError(400, "Cover Image is required"); 
        }
        const user = await User.findById(req.user._id).select("-password -refreshToken");
        user.coverImage = "";

        const uploadPath = await uploadOnCloudinary(coverImageLocalPath);
        if(!uploadPath){
            throw new ApiError(400, "Avatar Image upload failed");
        }
        user.coverImage = uploadPath.url;
        await user.save({validateBeforeSave: false});

        return res.status(200)
        .json(new ApiResponse(200, user, "Cover Image Updated Successfully"));

    } catch (error) {
        next(error);
    }
}

const getUserChannelProfile = async (req, res, next) => {
    try {
        const {username} = req.params;
        if(!username?.trim()){
            throw new ApiError(400, "Username is required");
        }

        const channelData = await User.aggregate([
            {
                $match:{
                    username: username.toLowerCase()
                }
            },
            {
                $lookup:{
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    subscribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project:{
                    username: 1,
                    fullName: 1,
                    subscribersCount: 1,
                    subscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1
                }
            }
        ])
        if(!channelData?.length){
            throw new ApiError(404, "Channel does not exist");
        }

        return res.status(200)
        .json(new ApiResponse(200, channelData[0], "User Channel fetched successfully"));

    } catch (error) {
        next(error);
    }
}

const getWatchHistory = async (req, res, next) => {
    try {
        const history = await User.aggregate([
            {
                $match: new mongoose.Types.ObjectId(req.user._id)
                
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as : "history",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ])
        return res.status(200)
        .json(200,history[0].watchHistory ,  "Watched History fetched successfully");
    } catch (error) {
        next(error);
    }
}
export {registerUser, loginUser, logOutUser, renewAccessToken, changePassword, getUser, updateAccountDetails, updateAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory};