import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            lowercase: true,
        },

        answers: {
            type: [String],
            required: true,
        },

        correctAnswer: {
            type: Number,
            required: true,
        },

        timeForAnswer: {
            type: Number,
            default: 60,
        },
    },
    { timestamps: true },
);

export default mongoose.model("Question", questionSchema);
