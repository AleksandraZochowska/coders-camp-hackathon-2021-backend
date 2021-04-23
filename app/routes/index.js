import users from "./users.js";
import rooms from "./rooms.js";

export default (app) => {
    app.use("/api/users", users);
    app.use("/api/rooms", rooms);
};
