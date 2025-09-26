import express from "express";
<<<<<<< HEAD
import { signUp, signIn, signOut } from "../controllers/auth.controllers.js";
import e from "express";
=======
import {
  signUp,
  signIn,
  signOut,
  sendOtp,
  verifyOtp,
  resetPassword,
} from "../controllers/auth.controllers.js";
>>>>>>> ATR_Branch

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.get("/signout", signOut);
<<<<<<< HEAD
=======
authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);

>>>>>>> ATR_Branch
export default authRouter;
