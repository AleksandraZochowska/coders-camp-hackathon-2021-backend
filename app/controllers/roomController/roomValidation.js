import Joi from "@hapi/joi";

export const roomValidation = (body) => {
    const roomSchema = Joi.object({
        name: Joi.string().email().required(),
    });
    return roomSchema.validate(body);
};
