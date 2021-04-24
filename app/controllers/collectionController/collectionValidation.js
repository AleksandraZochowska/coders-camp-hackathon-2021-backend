import Joi from "@hapi/joi";

export const updateCollectionValidation = (body) => {
    const updateCollectionSchema = Joi.object({
        name: Joi.string().optional(),
        question: Joi.object()
            .keys({
                text: Joi.string(),
                answers: Joi.array().items(Joi.string()),
                correctAnswer: Joi.number(),
                timeForAnswer: Joi.number(),
            })
            .optional(),
    }).min(1);
    return updateCollectionSchema.validate(body);
};
