import users from "./users.js";
import questions from "./questions.js";

export default (app) => {
    app.use("/api/users", users);
    app.use("/api/questions", questions);
};
