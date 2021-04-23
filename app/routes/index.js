import users from "./users.js";
import questions from "./questions.js";

import collections from "./collections.js";
import rooms from "./rooms.js";

export default (app) => {
    app.use("/api/users", users);
    app.use("/api/questions", questions);
    app.use("/api/collections", collections);
    app.use("/api/rooms", rooms);
};
