import { RequestHandler, NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";
import { ValidationFields } from "../constants/constant";
import { BadRequest } from "../utils/api-error";

export interface Validator {
  schema: ObjectSchema;
  field: ValidationFields;
}

export const validationFunction = (validators: Validator[]): RequestHandler => {
  return async function (req: Request, _: Response, next: NextFunction) {
    try {
      if (!Array.isArray(validators)) {
        next();
        return;
      }
      for (let validator of validators) {
        await validator.schema.validateAsync(req[validator.field]);
      }
      next();
    } catch (err) {
      next(new BadRequest(`${err.message}`));
    }
  };
};
