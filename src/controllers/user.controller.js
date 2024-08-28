import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save();
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
export {registerUser, loginUser, logOutUser, renewAccessToken};