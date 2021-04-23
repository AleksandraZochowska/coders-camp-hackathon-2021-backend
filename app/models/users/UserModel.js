import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userSchema from "./userSchema.js";
import hashSchema from "./hashSchema.js";

class UserModel {
    constructor() {
        this.User = mongoose.model("User", userSchema);
        this.Hash = mongoose.model("Hash", hashSchema);
    }

    addHash(userId, password) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) reject(err);

                const hashedEntry = new this.Hash({
                    userId,
                    hash,
                });
                hashedEntry
                    .save()
                    .then(() => resolve(userId))
                    .catch((err) => reject(err));
            });
        });
    }

    addUser(name, email) {
        return new Promise((resolve, reject) => {
            const user = new this.User({
                email,
                name,
            });
            user.save()
                .then((user) => {
                    resolve(user);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    authorize(user, password) {
        return new Promise((resolve, reject) => {
            this.Hash.findOne({ userId: user._id }, (err, hash) => {
                if (err) reject(err);

                bcrypt.compare(`${password}`, hash.hash, (authError, result) => {
                    if (authError) reject(authError);
                    if (!result) resolve(false);
                    const token = jwt.sign({ userId: user._id }, `${process.env.PRIVATE_KEY}`, { expiresIn: "24h" });
                    if (token) resolve(token);
                });
            });
        });
    }

    findByEmail(email) {
        return new Promise((resolve, reject) => {
            this.User.findOne({ email }, (err, user) => {
                if (err) reject(err);
                resolve(user);
            });
        });
    }

    removeUserById(id) {
        return new Promise((resolve, reject) => {
            this.User.findByIdAndDelete(id, (err, user) => {
                if (err) reject(err);
                resolve(user);
            });
        });
    }
}

export default UserModel;
