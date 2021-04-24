import Controller from "../Controller.js";
import CollectionModel from "../../models/collections/collectionSchema.js";
import { createCollectionValidation } from "./collectionValidation.js";
import { UserModel } from "../../models/users/userSchema.js";
import { updateCollectionValidation } from "./collectionValidation.js";

class CollectionController extends Controller {
    constructor() {
        super();
    }

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

    async getAllCollections(req, res) {
        try {
            const user = await UserModel.findById(req.userId);
            if (!user) return this.showError(res, 404, "User not found");

            const collections = await CollectionModel.find({ ownerId: req.userId }, "name questions").populate(
                "questions",
            );

            return this.success(res, collections);
        } catch (error) {
            return this.showError(res, 500, error);
        }
    }

    async getCollectionById(req, res) {
        try {
            const user = await UserModel.findById(req.userId);
            if (!user) return this.showError(res, 404, "User not found");

            const collection = await CollectionModel.findById(req.params.id, "name questions").populate("questions");
            if (!collection) return this.showError(res, 404, "Collection not found");

            return this.success(res, collection);
        } catch (error) {
            return this.showError(res, 500, error);
        }
    }

    async updateCollection(req, res) {
        //Validate data
        const { error } = updateCollectionValidation(req.body);
        if (error) return this.showError(res, 400, "Please, provide correct question");

        try {
            //Check user
            const user = await UserModel.findById(req.userId);
            if (!user) return this.showError(res, 404, "User not found");

            const collection = await CollectionModel.findById(req.params.id);
            if (!collection) return this.showError(res, 404, "Collection not found");

            if (`${collection.ownerId}` !== `${user._id}`) return this.showError(res, 401);

            const reqName = req.body.name;
            const reqQuestion = req.body.question;

            //Change name
            if (reqName) {
                await CollectionModel.findByIdAndUpdate(req.params.id, { $set: { name: reqName } });
            }

            //Add question
            if (!reqQuestion) return this.success(res, "Name changed");
            const question = await QuestionModel.create(reqQuestion);

            const updatedCollection = await CollectionModel.findByIdAndUpdate(req.params.id, {
                $set: { questions: [...collection.questions, question._id] },
            });

            this.success(res, question);
        } catch (error) {
            this.showError(res, 500, error);
        }
    }
}

export default CollectionController;
