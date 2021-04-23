import users from "./users.js";
import collections from "./collections";

export default (app) => {
    app.use("/api/users", users);
    app.use("/api/collections", collections);
};
