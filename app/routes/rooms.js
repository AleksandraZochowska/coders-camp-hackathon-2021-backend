import express from "express";
import * as roomController from "../controllers/roomController/index.js";
import tokenVerification from "../middlewares/tokenVerification.js";

const router = express.Router();

// GET
router.get("", tokenVerification, roomController.getRooms);

// POST:
router.post("/", tokenVerification, roomController.createRoom);

// PATCH:
router.patch("/:id", tokenVerification, roomController.editRoom);
router.patch("/guests/:id", roomController.updateGuests);

export default router;
