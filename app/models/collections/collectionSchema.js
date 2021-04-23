import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
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

        questions: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Question",
            required: true,
        },
    },
    { timestamps: true },
);

export default mongoose.model("Collection", collectionSchema);
