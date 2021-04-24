import Joi from "@hapi/joi";

export const roomValidation = (body) => {
    const roomSchema = Joi.object({
        name: Joi.string().required(),
        questionCollection: Joi.string().required(),
    });
    return roomSchema.validate(body);
};
