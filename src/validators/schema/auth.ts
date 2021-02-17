import Joi, { ObjectSchema } from "joi";

export const registerSchema: ObjectSchema = Joi.object().keys({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("User", "Admin", "Super Admin").required(),
});
