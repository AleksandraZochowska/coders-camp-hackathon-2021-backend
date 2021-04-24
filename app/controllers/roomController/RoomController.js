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
        this.populateQuery = [
            {
                path: "questionsCollectionId",
                model: "Collection",
                populate: {
                    path: "questions",
                    model: "Question",
                },
            },
            {
                path: "questionsAsked",
                populate: {
                    path: "_id",
                    model: "Question",
                },
            },
        ];
    }
    async getActiveQuestion(req, res) {
        const { email } = req.query;
        try {
            const room = await RoomModel.findById(req.params.id, (err) => {
                if (err) return this.showError(res, 404, "No room with given id found");
            });

            //Check if guest is in room
            const guestIndex = room.guests.map((guest) => guest.email).indexOf(email);
            if (guestIndex === -1) return this.showError(res, 404, "No guest with given email exists within the room");
            const guest = room.guests[guestIndex];

            // No questions were asked in this room
            if (room.questionsAsked.length === 0) return this.success(res, false);

            // Some questions have been asked in this room
            if (room.questionsAsked.length > 0) {
                const lastQuestion = await QuestionModel.findById(`${room.questionsAsked[room.questionsAsked.length - 1]._id}`);

                if (!lastQuestion) return this.showError(res, 404, "No question with given ID found");

                const currentStatus = {
                    activeQuestion: lastQuestion,
                    roomClosed: room.closed,
                };

                // Last asked question is still valid (time-wise)
                if (Math.floor((new Date() - room.questionsAsked[room.questionsAsked.length - 1].askedAt) / 1000) < lastQuestion.timeForAnswer) {
                    // Guest has answered this question before
                    if (guest.answers.map((answer) => answer.questionId).includes(lastQuestion._id)) return this.success(res, false);

                    // Question is active & have not yet been answered by the guest
                    return this.success(res, currentStatus);
                }
                currentStatus.activeQuestion = false;
                return this.success(res, currentStatus);
            }
        } catch (err) {
            return this.showError(res, 500, err.reason.error);
        }
    }

    async closeRoom(req, res) {
        try {
            const room = await RoomModel.findById(req.params.id).populate(this.populateQuery);
            if (room.ownerId != req.userId) return this.showError(res, 400, `You cannot change close room that not belongs to you.`);
            await RoomModel.findByIdAndUpdate(req.params.id, { $set: { closed: true } });
            this.success(res, "Room closed");
        } catch (err) {
            return this.showError(res, 500, err);
        }
    }

    async openRoom(req, res) {
        try {
            const room = await RoomModel.findById(req.params.id).populate(this.populateQuery);
            if (room.ownerId != req.userId) return this.showError(res, 400, `You cannot change open the room that not belongs to you.`);
            await RoomModel.findByIdAndUpdate(req.params.id, { $set: { closed: false } });
            this.success(res, "Room opened");
        } catch (err) {
            return this.showError(res, 500, err);
        }
    }

    async getRooms(req, res) {
        const user = await UserModel.findById(req.userId);
        if (!user) return this.showError(res, 400, `You are not a logged user.`);

        try {
            const rooms = await RoomModel.find({ ownerId: req.userId }).populate(this.populateQuery);
            return this.success(res, rooms);
        } catch (err) {
            return this.showError(res, 500, err);
        }
    }

    async getRoomById(req, res) {
        try {
            const room = await RoomModel.findById(req.params.id).populate(this.populateQuery);
            return this.success(res, room);
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

                    if (Math.floor((new Date() - room.questionsAsked[room.questionsAsked.length - 1].askedAt) / 1000) < lastQuestion.timeForAnswer) {
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
                // do nothing
                const guest = room.guests[emailIndex];
                return this.success(res, `Guest ${guest.name} with email ${guest.email} already added to this room`);
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
        const emails = room.guests.map((guest) => guest.email);
        return emails.indexOf(email);
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
