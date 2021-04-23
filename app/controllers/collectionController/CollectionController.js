import Controller from "../Controller.js";
import CollectionModel from "../../models/collections/collectionSchema.js";
import { createCollectionValidation } from "./collectionValidation.js";

class CollectionController extends Controller {
    constructor() {
        super();
    }

    async getAllCollections(req, res) {}

    async getCollectionById(req, res) {}

    async createCollection(req, res) {
        const { error } = createCollectionValidation(req.body);
        if (error) return this.showError(res, 400, error.details);

        try {
            const nameExists = await CollectionModel.findOne({ name: req.body.name, ownerId: req.userId });
            if (nameExists) return this.showError(res, 400, "Question collection with this name already exists");

            const collection = new CollectionModel({
                name: req.body.name,
                ownerId: req.userId,
                questions: [],
            });
            await collection.save();

            const result = (({ _id, name, questions }) => ({ _id, name, questions }))(collection);
            return this.success(res, result);
        } catch (error) {
            return this.showError(res, 500);
        }
    }
}

export default CollectionController;
