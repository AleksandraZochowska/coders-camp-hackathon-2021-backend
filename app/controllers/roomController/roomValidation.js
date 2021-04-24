import Joi from "@hapi/joi";

export const roomValidation = (body) => {
    const roomSchema = Joi.object({
        name: Joi.string().required(),
        questionsCollectionId: Joi.string().required(),
    });
    return roomSchema.validate(body);
};

export const editRoomValidation = (body) => {
    const editRoomSchema = Joi.object({
        name: Joi.string(),
        collectionId: Joi.string(),
    });
    return editRoomSchema.validate(body);
};

export const updateGusetsValidation = (body) => {
    const updateGuestsSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
    });
    return updateGuestsSchema.validate(body);
};
