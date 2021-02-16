import { Request, Response, NextFunction } from "express";
import { controller, post } from "../decorators";
import { authServiceInstance } from "../services/auth";

@controller("/auth")
class AuthController {
  @post("/register")
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
