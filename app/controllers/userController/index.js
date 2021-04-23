import UserController from "./UserController.js";
const user = new UserController();

// POST:
export const login = (req, res) => {
    user.login(req, res);
};

export const register = (req, res) => {
    user.register(req, res);
};
