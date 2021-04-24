import express from "express";
import * as collectionController from "../controllers/collectionController/index.js";
import tokenVerification from "../middlewares/tokenVerification.js";

const router = express.Router();

// GET
router.get("/", tokenVerification, collectionController.getAllCollections);
router.get("/:id", tokenVerification, collectionController.getCollectionById);

// POST
router.post("/", tokenVerification, collectionController.createCollection);

//PATCH
router.patch("/:id", tokenVerification, collectionController.updateCollection);

export default router;
