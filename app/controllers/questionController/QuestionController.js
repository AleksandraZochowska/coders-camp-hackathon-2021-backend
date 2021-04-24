import Controller from "../Controller.js";
import QuestionModel from "../../models/questions/questionSchema.js";

class QuestionController extends Controller {
    constructor() {
        super();
    }

    async getQuestionById(req, res) {
        try {
            const question = await QuestionModel.findById(req.params.id, "text answers correctAnswer timeForAnswer");
            if (!question) return this.showError(res, 400, `Question not found by id ${req.params.id}`);
            return this.success(res, question);
        } catch (err) {
            return this.showError(res, 500, err);
        }
    }
}

export default QuestionController;
