import Controller from "../Controller.js";
import CollectionModel from "../../models/collections/collectionSchema.js";
import QuestionModel from "../../models/questions/questionSchema.js";
import { UserModel } from "../../models/users/userSchema.js";

class CollectionController extends Controller {
    constructor() {
        super();
    }

    async getAllCollections(req, res) {
        try {
            const user = await UserModel.findById(req.userId);
            if (!user) return this.showError(res, 404, "User not found");

            const collections = await CollectionModel.find({ ownerId: req.userId }, "name questions").populate(
                "questions",
            );

            this.success(res, collections);
        } catch (error) {
            this.showError(res, 500, error);
        }
    }

    async getCollectionById(req, res) {
        try {
            const user = await UserModel.findById(req.userId);
            if (!user) return this.showError(res, 404, "User not found");

            const collection = await CollectionModel.findById(req.params.id, "name questions").populate("questions");
            if (!collection) return this.showError(res, 404, "Collection not found");

            this.success(res, collection);
        } catch (error) {
            this.showError(res, 500, error);
        }
    }
}

export default CollectionController;
