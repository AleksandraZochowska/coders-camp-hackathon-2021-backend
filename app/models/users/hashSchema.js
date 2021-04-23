import mongoose from "mongoose";

const hashSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        hash: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export default hashSchema;
