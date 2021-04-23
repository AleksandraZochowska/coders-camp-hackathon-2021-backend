import express from "express";
import { login, register } from "../controllers/userController/index.js";
// import tokenVerification from "../middlewares/tokenVerification.js";

const router = express.Router();

// POST:
router.post("/login", login);
router.post("/register", register);

export default router;
