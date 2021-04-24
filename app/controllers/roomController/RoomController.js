import Controller from "../Controller.js";
import RoomModel from "../../models/rooms/roomSchema.js";
import CollectionModel from "../../models/collections/collectionSchema.js";
import { editRoomValidation } from "./roomValidation.js";

class RoomController extends Controller {
    constructor() {
        super();
    }

    // async createRoom(req, res) {}

    async editRoom(req, res) {
        const { error } = editRoomValidation(req.body);
        if (error) return this.showError(res, 400, error.details);

        try {
            const room = await RoomModel.findById(req.params.id);
            if (!room) return this.showError(res, 404, "No room with given id found");

            if (room.ownerId !== req.userId) return this.showError(res, 401);

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

                room.questionCollection = `${req.body.collectionId}`;
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
