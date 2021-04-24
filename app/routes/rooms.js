import express from "express";
import * as roomController from "../controllers/roomController/index.js";
import tokenVerification from "../middlewares/tokenVerification.js";

const router = express.Router();

// POST:
router.post("", tokenVerification, roomController.createRoom);
router.post("/:id/guests", tokenVerification, roomController.editRoom);

// PATCH:
router.patch("/:id", roomController.updateGuest);

export default router;
