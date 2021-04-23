import Joi from "@hapi/joi";
import { PW_REGEX } from "../../constants/index.js";

export const loginValidation = (body) => {
    const loginSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    return loginSchema.validate(body);
};

export const registerValidation = (body) => {
    const registerSchema = Joi.object({
        name: Joi.string().min(2).max(20).required(),
        email: Joi.string().email().required(),
        password: Joi.string().pattern(PW_REGEX).required(),
    });

    return registerSchema.validate(body);
};
