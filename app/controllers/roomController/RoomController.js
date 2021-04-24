import { UserModel } from "../../models/users/userSchema.js";
import Controller from "../Controller.js";
import { roomValidation, editRoomValidation, updateGusetsValidation, answerQuestionValidation } from "./roomValidation.js";
import RoomModel from "../../models/rooms/roomSchema.js";
import mongoose from "mongoose";
import CollectionModel from "../../models/collections/collectionSchema.js";
import QuestionModel from "../../models/questions/questionSchema.js";

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

            // Change room name
            if (req.body.name) {
                const nameTaken = await RoomModel.findOne({ name: `${req.body.name}`, ownerId: req.userId });
                if (nameTaken) return this.showError(res, 400, "Room with this name already exists");

                room.name = `${req.body.name}`;
            }

            // Change collection attached to the room
            if (req.body.collectionId) {
                const collectionExists = await CollectionModel.findOne({
                    _id: `${req.body.collectionId}`,
                    ownerId: req.userId,
                });
                if (!collectionExists) return this.showError(res, 404, "No collection with provided ID found");

                room.questionsCollectionId = `${req.body.collectionId}`;
            }

            // Add new active question
            if (req.body.selectedQuestionId) {
                const collection = await CollectionModel.findById(room.questionsCollectionId);
                if (!collection) return this.showError(res, 404, "No collection attached to the room");

                const questionInCollection = collection.questions.some((el) => `${el}` === `${req.body.selectedQuestionId}`);
                if (!questionInCollection) return this.showError(res, 404, "No question with gived ID found in currently attached collection");

                if (room.questionsAsked.length > 0) {
                    const lastQuestion = await QuestionModel.findById(`${room.questionsAsked[room.questionsAsked.length - 1]._id}`);
                    if (!lastQuestion) return this.showError(res, 404, "No question with given ID found");
                    // console.log(room.questionsAsked[room.questionsAsked.length - 1]);

                    if (Math.floor((new Date() - room.questionsAsked[room.questionsAsked.length - 1].askedAt) / 1000) < 5) {
                        return this.showError(res, 400, "Cannot ask new question yet, another question is still active");
                    }
                }

                const questionCard = {
                    _id: req.body.selectedQuestionId,
                    askedAt: new Date(),
                };
                room.questionsAsked.push(questionCard);
            }

            const savedRoom = await room.save();
            return this.success(res, savedRoom);
        } catch (error) {
            return this.showError(res, 500);
        }
    }

    async getAnswers(req, res) {
        const email = req.query.email;

        try {
            //Get room
            const room = await RoomModel.findById(req.params.id);
            if (!room) return this.showError(res, 404, "No room with given id found");

            //Check if guest is in room
            const guestIndex = room.guests.map((guest) => guest.email).indexOf(email);
            if (guestIndex === -1) return this.showError(res, 404, "No guest with given email exists within the room");

            const guest = room.guests[guestIndex];

            const summary = await this.summarizeGuest(guest, room.questionsAsked);

            return this.success(res, summary);
        } catch (error) {
            return this.showError(res, 500);
        }
    }

    async updateGuests(req, res) {
        const { error } = updateGusetsValidation(req.body);
        if (error) return this.showError(res, 400, error.details);
        try {
            const { email, name } = req.body;
            const room = await RoomModel.findById(req.params.id);
            if (!room) return this.showError(res, 404, "No room with given id found");

            const emailIndex = this.findGuestIndex(room, email);
            if (emailIndex == -1) {
                const guest = {
                    email: email,
                    name: name,
                    answers: [],
                };
                room.guests.push(guest);
                await room.save();
                return this.success(res, guest);
            } else {
                // update name for existing email in guests list
                room.guests[emailIndex] = {
                    email: email,
                    name: name,
                };
                await room.save();
                return this.success(res, room.guests[emailIndex]);
            }
        } catch (error) {
            return this.showError(res, 500, error);
        }
    }

    async answerQuestion(req, res) {
        //Validate request
        const { error } = answerQuestionValidation(req.body);
        if (error) return this.showError(res, 400, error.details);

        const { questionId, answer, email } = req.body;

        try {
            //Get room
            const room = await RoomModel.findById(req.params.id);
            if (!room) return this.showError(res, 404, "No room with given id found");

            //Check if guest is in room
            const guestIndex = room.guests.map((guest) => guest.email).indexOf(email);
            if (guestIndex === -1) return this.showError(res, 404, "No guest with given email exists within the room");

            const guest = room.guests[guestIndex];

            //Check if guest answered this question before:
            if (guest.answers.map((answer) => answer.questionId).includes(questionId)) return this.showError(res, 404, "Question already answered");

            //Add guest's answer
            const finalAnswer = {
                questionId,
                chosenAnswer: answer,
                answeredAt: Date.now(),
            };

            guest.answers.push(finalAnswer);
            await room.save();
            return this.success(res, finalAnswer);
        } catch (error) {
            return this.showError(res, 500, error);
        }
    }

    findGuestIndex(room, email) {
        return room.guests.map((guest) => guest.email).indexOf(email);
    }

    async summarizeGuest(guest, questionsAsked) {
        const { email, name, answers } = guest;

        const result = {
            email,
            name,
            questions: [],
        };

        //tu bangla
        for (const askedQuestion of questionsAsked) {
            const question = await QuestionModel.findById(`${askedQuestion._id}`);
            console.log(question);
            const guestAnswerIndex = answers.map((ans) => ans.questionId).indexOf(`${question._id}`);

            const guestAnswerDetails = guestAnswerIndex > -1 ? answers[guestAnswerIndex] : null;

            const entry = {
                text: question.text,
                correctAnswer: question.answers[question.correctAnswer],
                guestAnswer: guestAnswerDetails ? question.answers[guestAnswerDetails.chosenAnswer] : "",
                answeredAt: guestAnswerDetails ? guestAnswerDetails.answeredAt : "",
                correct: question.correctAnswer === guestAnswerDetails.chosenAnswer,
            };

            result.questions.push(entry);
        }

        return result;
    }
}

export default RoomController;
