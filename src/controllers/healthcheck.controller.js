import ApiResponse from "../utils/ApiResponse";

const healthCheck = async (req, res, next) => {
    try {
        return res.status(200).json(new ApiResponse(200, {}, "ALL OK"));
    } catch (error) {
        next(error);
    }
}
export {healthCheck};