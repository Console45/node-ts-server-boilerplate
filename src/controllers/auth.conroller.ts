import { ValidationFields } from "./../constants/constant";
import { Request, Response, NextFunction } from "express";
import { controller, post, validate } from "../decorators";
import { authServiceInstance } from "../services/auth";
import { registerSchema } from "../validators/schema/auth";

@controller("/auth")
class AuthController {
  @post("/register")
  @validate({ schema: registerSchema, field: ValidationFields.BODY })
  async postRegister({ body }: Request, res: Response, next: NextFunction) {
    authServiceInstance.res = res;
    try {
      const { user, accessToken } = await authServiceInstance.registerUser(
        body
      );
      res.status(201).json({
        status: "success",
        message: `${user.role} registration is successful.`,
        data: {
          user,
          accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
