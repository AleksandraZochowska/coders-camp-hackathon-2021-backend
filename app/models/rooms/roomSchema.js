import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase: true,
        },

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        questionCollection: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Collection",
            required: true,
        },

        questionsAsked: {
            type: [
                {
                    id: mongoose.Schema.Types.ObjectId,
                    askedAt: Date,
                },
            ],
            ref: "Question",
            required: true,
        },

        guests: {
            type: [
                {
                    email: String,
                    answers: [
                        {
                            questionId: {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "Question",
                            },
                            chosenAnswer: Number,
                            answeredAt: Date,
                        },
                    ],
                },
            ],
        },
    },
    { timestamps: true },
);

export default mongoose.model("Room", roomSchema);
