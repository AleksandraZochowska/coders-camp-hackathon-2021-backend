import express from "express";

import { getQuestionById } from "../controllers/questionController/index.js";
const router = express.Router();

// GET:
router.get("/:id", getQuestionById);

export default router;
