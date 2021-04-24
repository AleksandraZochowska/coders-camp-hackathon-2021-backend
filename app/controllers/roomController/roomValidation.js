import Joi from "@hapi/joi";

export const editRoomValidation = (body) => {
    const editRoomSchema = Joi.object({
        name: Joi.string(),
        collectionId: Joi.string(),
    });
    return editRoomSchema.validate(body);
};
