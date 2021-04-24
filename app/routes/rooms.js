import express from "express";
import * as roomController from "../controllers/roomController/index.js";
import tokenVerification from "../middlewares/tokenVerification.js";

const router = express.Router();

// GET
router.get("", tokenVerification, roomController.getRooms);
router.get("/:id/activequestion", roomController.getActiveQuestion);
router.get("/:id", roomController.getRoomById);

// POST:
router.post("/", tokenVerification, roomController.createRoom);
router.post("/:id/answers", roomController.answerQuestion);

// PATCH:
router.patch("/:id", tokenVerification, roomController.editRoom);
router.patch("/:id/guests", roomController.updateGuests);

export default router;
