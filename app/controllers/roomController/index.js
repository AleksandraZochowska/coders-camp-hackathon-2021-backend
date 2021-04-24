import RoomController from "./RoomController.js";
const room = new RoomController();

//GET
export const getRooms = (req, res) => {
    room.getRooms(req, res);
};

export const getActiveQuestion = (req, res) => {
    room.getActiveQuestion(req, res);
};

export const getRoomById = (req, res) => {
    room.getRoomById(req, res);
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

export const answerQuestion = (req, res) => {
    room.answerQuestion(req, res);
};

export const getAnswers = (req, res) => {
    room.getAnswers(req, res);
};

export const getSummary = (req, res) => {
    room.getSummary(req, res);
};
