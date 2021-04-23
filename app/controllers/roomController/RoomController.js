import UserModel from "../../models/users/UserModel.js";
import Controller from "../Controller.js";
import { roomValidation } from "./roomValidation.js";
import RoomModel from "../../models/rooms/roomSchema.js";

class RoomController extends Controller {
    constructor() {
        super();
    }
    async getRooms(req, res) {
        const user = await UserModel.findById(req.user);
        if (!user) return this.showError(res, 400, `You are not a logged user.`);

        try {
            const rooms = await RoomModel.find({ ownerId: req.user }).populate("questionCollections");
            return this.success(res, rooms);
        } catch (err) {
            return this.showError(res, 500, err);
        }
    }

    async createRoom(req, res) {
        const { error } = roomValidation(req.body);
        if (error) return this.showError(res, 400, `Incorrect request body for room creation.`);

        const user = await UserModel.findById(req.user);
        if (!user) return this.showError(res, 400, `Only logged user can create a room.`);

        const exist = await RoomModel.findOne({ name: req.body.name, ownerId: req.user });
        if (exist) return this.showError(res, 400, `You arlady have a room with this name.`);

        const room = new RoomModel({
            name: req.body.name,
            ownerId: req.user,
            questionCollections: [],
            questionsAsked: [],
        });

        try {
            await room.save();
            return this.success(res, `Room ${req.body.name} created`);
        } catch {
            return this.showError(res, 500, `Error, room ${req.body.name} not created`);
        }
    }

    // editRoom(req, res) {}

    // updateGuest(req, res) {}
}

export default RoomController;
