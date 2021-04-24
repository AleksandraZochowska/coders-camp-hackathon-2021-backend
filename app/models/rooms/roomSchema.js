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
        questionsCollectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Collection",
            required: true,
        },

        questionsAsked: {
            type: [
                {
                    id: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
                    askedAt: Date,
                },
            ],
            required: true,
        },

        guests: {
            type: [
                {
                    email: String,
                    name: String,
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
