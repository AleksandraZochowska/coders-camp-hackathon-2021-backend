import Joi from "@hapi/joi";

export const createCollectionValidation = (body) => {
    const createCollectionSchema = Joi.object({
        name: Joi.string().required(),
    });
    return createCollectionSchema.validate(body);
};
