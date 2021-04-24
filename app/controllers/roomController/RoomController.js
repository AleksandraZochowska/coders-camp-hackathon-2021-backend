import { UserModel } from "../../models/users/userSchema.js";
import Controller from "../Controller.js";
import { roomValidation } from "./roomValidation.js";
import RoomModel from "../../models/rooms/roomSchema.js";
import mongoose from "mongoose";
import CollectionModel from "../../models/collections/collectionSchema.js";
import { editRoomValidation } from "./roomValidation.js";

class RoomController extends Controller {
    constructor() {
        super();
    }
    async getRooms(req, res) {
        const user = await UserModel.findById(req.userId);
        if (!user) return this.showError(res, 400, `You are not a logged user.`);

        try {
            const rooms = await RoomModel.find({ ownerId: req.userId }).populate("questionsCollectionId");
            return this.success(res, rooms);
        } catch (err) {
            return this.showError(res, 500, err);
        }
    }

    async createRoom(req, res) {
        const { error } = roomValidation(req.body);
        if (error) return this.showError(res, 400, `Incorrect request body for room creation.`);
        const user = await UserModel.findById(req.userId);
        if (!user) return this.showError(res, 400, `Only logged user can create a room.`);

        const exist = await RoomModel.findOne({ name: req.body.name, ownerId: req.userId });
        if (exist) return this.showError(res, 400, `You arlady have a room with this name.`);

        const room = new RoomModel({
            name: req.body.name,
            ownerId: mongoose.Types.ObjectId(req.userId),
            questionsCollectionId: req.body.questionsCollectionId,
            questionsAsked: [],
            guests: [],
        });

        try {
            await room.save();
            return this.success(res, room);
        } catch (err) {
            return this.showError(res, 500, err); //`Error, room ${req.body.name} not created`
        }
    }

    async editRoom(req, res) {
        const { error } = editRoomValidation(req.body);
        if (error) return this.showError(res, 400, error.details);

        try {
            const room = await RoomModel.findById(req.params.id);
            if (!room) return this.showError(res, 404, "No room with given id found");

            if (`${room.ownerId}` !== req.userId) return this.showError(res, 401);

            if (req.body.name) {
                const nameTaken = await RoomModel.findOne({ name: `${req.body.name}`, ownerId: req.userId });
                if (nameTaken) return this.showError(res, 400, "Room with this name already exists");

                room.name = `${req.body.name}`;
            }

            if (req.body.collectionId) {
                const collectionExists = await CollectionModel.findOne({
                    _id: `${req.body.collectionId}`,
                    ownerId: req.userId,
                });
                if (!collectionExists) return this.showError(res, 404, "No collection with provided ID found");

                room.questionsCollectionId = `${req.body.collectionId}`;
            }

            const savedRoom = await room.save();
            return this.success(res, savedRoom);
        } catch (error) {
            return this.showError(res, 500);
        }
    }

    // async updateGuest(req, res) {}
}

export default RoomController;
