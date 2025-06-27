import express from "express";
import { TryCatch } from "../middlewares/error";
import { adminSignup ,adminLogin,adminCreateUser,verifyUser,assignPermissions,AdmineCreateuserLogin, changePassword} from "../controllers/user.auth.controller";
import { verifyToken} from "../middlewares/user.verify.permission.middleware"

const userRouter = express.Router();

userRouter.route("/admin-signup").post(TryCatch(adminSignup));
userRouter.route("/admin-sigin").post(TryCatch(adminLogin));
userRouter.route("/admin-create-user").post(verifyToken,adminCreateUser);
userRouter.route("/admin-verify-user/:userId").put(verifyToken,verifyUser)
userRouter.route("/admin-assign-permission").post(verifyToken,assignPermissions)




//// admin create for the users
userRouter.route("/admin-create-user-login").post(AdmineCreateuserLogin);
userRouter.route("/admin-user-change-password").patch(verifyToken,changePassword)



export default userRouter;