import express from "express";
import { createRoom, editRoom, updateGuest } from "../controllers/roomController/index.js";
import tokenVerification from "../middlewares/tokenVerification.js";

const router = express.Router();

// POST:
router.post("/", tokenVerification, createRoom);
router.post("/:id/guests", tokenVerification, editRoom);

// PATCH:
router.patch("/rooms/:id", updateGuest);

export default router;
