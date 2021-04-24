import express from "express";

import { getQuestionById } from "../controllers/questionController/index.js";
const router = express.Router();

// POST:
router.post("/:id", getQuestionById);

export default router;
