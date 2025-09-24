import express from "express";
import { signUp, signIn, signOut } from "../controllers/auth.controllers.js";
import e from "express";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.get("/signout", signOut);
export default authRouter;
