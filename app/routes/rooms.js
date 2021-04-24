import express from "express";
import * as roomController from "../controllers/roomController/index.js";
import tokenVerification from "../middlewares/tokenVerification.js";

const router = express.Router();

// POST:
router.post("/", tokenVerification, roomController.createRoom);
router.post("/:id/guests", roomController.updateGuest);

// PATCH:
router.patch("/:id", tokenVerification, roomController.editRoom);

export default router;
