import RoomController from "./RoomController.js";
const room = new RoomController();

//GET
export const getRooms = (req, res) => {
    room.getRooms(req, res);
};
// POST:
export const createRoom = (req, res) => {
    room.createRoom(req, res);
};

export const editRoom = (req, res) => {
    room.editRoom(req, res);
};

export const updateGuests = (req, res) => {
    room.updateGuests(req, res);
};
