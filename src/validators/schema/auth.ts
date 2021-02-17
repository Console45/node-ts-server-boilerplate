import Joi, { ObjectSchema } from "joi";

export const registerSchema: ObjectSchema = Joi.object().keys({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("User", "Admin", "Super Admin").required(),
});

export const loginSchema: ObjectSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginParamsSchema: ObjectSchema = Joi.object().keys({
  role: Joi.string().valid("user", "admin", "super-admin").required().messages({
    "any.only": "route parameter must be one of [user, admin, super-admin]",
  }),
});
