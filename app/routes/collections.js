import express from "express";
import * as collectionController from "../controllers/collectionController/index.js";
import tokenVerification from "../middlewares/tokenVerification.js";

const router = express.Router();

//GET
router.get("/collections", tokenVerification, collectionController.getAllCollections);
router.get("/collections/:id", tokenVerification, collectionController.getCollectionById);

export default router;
