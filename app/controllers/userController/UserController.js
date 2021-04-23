import Controller from "../Controller.js";
import UserModel from "../../models/users/UserModel.js";
import { loginValidation, registerValidation } from "./userValidation.js";

class UserController extends Controller {
    constructor() {
        super();
        this.userModel = new UserModel();
    }

    async login(req, res) {
        const { error } = loginValidation(req.body);
        if (error) return this.showError(res, 400, "Please, provide correct email & password");

        try {
            const user = await this.userModel.findByEmail(req.body.email);
            if (!user) return this.showError(res, 401);
            const usersProfile = (({ _id, email, name }) => ({ _id, email, name }))(user);

            // Authorization:
            const token = await this.userModel.authorize(user, req.body.password);
            if (!token) return this.showError(res, 401);
            return this.success(res, {
                token: token,
                user: usersProfile,
            });
        } catch (error) {
            return this.showError(res, 500, "Error");
        }
    }

    async register(req, res) {
        const { error } = registerValidation(req.body);
        if (error) return this.showError(res, 400, error.details);

        try {
            // Check if noone had previously registered with given email:
            const sameMailUser = await this.userModel.findByEmail(req.body.email);
            if (sameMailUser) return this.showError(res, 400, "User with this email already exists");

            // Add user and hash:
            const user = await this.userModel.addUser(req.body.name, req.body.email);
            if (!user) return this.showError(res, 500);

            try {
                const hash = await this.userModel.addHash(user._id, req.body.password);
                if (!hash) return this.showError(res, 500);
            } catch (err) {
                this.userModel.removeUserById(user._id);
                return this.showError(res, 500, "Here");
            }
            return this.success(res, { message: "You've been registered" });
        } catch (error) {
            return this.showError(res, 500, "Hello");
        }
    }
}

export default UserController;
