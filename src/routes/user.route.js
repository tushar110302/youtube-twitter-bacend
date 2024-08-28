import { Router } from "express";
import { changePassword, getUser, loginUser, logOutUser, registerUser, renewAccessToken, updateAccountDetails, updateAvatar, updateCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.js"
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },{
        name: "coverImage",
        maxCount: 1
    }
]), registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(renewAccessToken);
router.route("/get-user").get(verifyJWT, getUser);
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/change-password").patch(verifyJWT, changePassword);
router.route("/update-details").patch(verifyJWT, updateAccountDetails);
router.route("/avatar").patch(verifyJWT, upload.single("avatar") ,updateAvatar);
router.route("/cover").patch(verifyJWT, upload.single("coverImage"), updateCoverImage);




export default router;