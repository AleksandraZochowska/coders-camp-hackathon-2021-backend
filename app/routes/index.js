import users from "./users.js";

export default (app) => {
    app.use("/api/users", users);
};
