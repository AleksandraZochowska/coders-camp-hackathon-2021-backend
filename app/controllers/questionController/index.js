import QuestionController from "./QuestionController.js";

const question = new QuestionController();

// POST:
export const getQuestionById = (req, res) => {
    question.getQuestionById(req, res);
};
