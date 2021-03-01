import { ValidationFields } from "./../constants/constant";
import { Request, Response, NextFunction } from "express";
import { controller, post, use, validate } from "../decorators";
import { authServiceInstance } from "../services/auth";
import {
  registerSchema,
  loginParamsSchema,
  loginSchema,
  googleLoginSchema,
} from "../validators/schema";
import { auth } from "../middlewares/auth";

@controller("/auth")
class AuthController {
  @post("/register")
  @validate({ schema: registerSchema, field: ValidationFields.BODY })
  async postRegister({ body }: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken } = await authServiceInstance.registerUser(
        body
      );
      res.status(201).json({
        status: "success",
        message: `${user.role} registration is successful.`,
        data: {
          user,
          token: accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @post("/login/:role")
  @validate(
    { schema: loginParamsSchema, field: ValidationFields.PARAMS },
    { schema: loginSchema, field: ValidationFields.BODY }
  )
  async postLogin(
    { body, params }: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user, accessToken } = await authServiceInstance.loginUser(
        body,
        params
      );
      res.json({
        status: "success",
        message: `${user.role} login is successful.`,
        data: {
          user,
          token: accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @post("/google_login")
  @validate({ schema: googleLoginSchema, field: ValidationFields.BODY })
  async postGoogleLogin({ body }: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken } = await authServiceInstance.gooleLoginUser(
        body
      );
      return res.json({
        status: "success",
        message: `${user.role} login successfully`,
        data: {
          user,
          token: accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @post("/refresh_token")
  async postRefreshToken(req: any, res: Response, next: NextFunction) {
    try {
      const token = await authServiceInstance.refreshToken(req.cookies);
      req.accessToken = token.accessToken;
      res.json({
        status: "success",
        message: "Refreshed access token successfully",
        data: {
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @post("/logout")
  @use(auth)
  async postLogout(req: any, res: Response, next: NextFunction) {
    try {
      const user = await authServiceInstance.logoutUser(
        req.user,
        req.accessToken
      );
      res.json({
        status: "success",
        message: `${user.role} logout is successful`,
        data: {
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
