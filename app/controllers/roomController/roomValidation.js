import Joi from "@hapi/joi";

export const roomValidation = (body) => {
    const roomSchema = Joi.object({
        name: Joi.string().required(),
        questionsCollectionId: Joi.string().required(),
    });
    return roomSchema.validate(body);
};

export const editRoomValidation = (body) => {
    const editRoomSchema = Joi.alternatives().try(
        Joi.object({
            name: Joi.string().required(),
        }),
        Joi.object({
            collectionId: Joi.string().required(),
        }),
        Joi.object({
            selectedQuestionId: Joi.string().required(),
        }),
    );
    return editRoomSchema.validate(body);
};

export const updateGusetsValidation = (body) => {
    const updateGuestsSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
    });
    return updateGuestsSchema.validate(body);
};
