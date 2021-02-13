import User, { AccessToken, IUser } from "./../database/models/User";
import { sendRefreshToken } from "./../utils/send-refresh-toke";
import { Request, Response, NextFunction } from "express";
import { controller, post } from "../decorators";
import ApiError from "../utils/api-error";

@controller("/auth")
class AuthController {
  @post("/login")
  async postLogin({ body }: Request, res: Response, next: NextFunction) {
    try {
      const user: IUser = new User(body);
      await user.save();
      sendRefreshToken(res, user.createRefreshToken());
      const accessToken: AccessToken = await user.createAccessToken();
      res.status(201).json({
        status: "success",
        user,
        token: accessToken,
      });
    } catch (err) {
      if (err.name === "MongoError" && err.code === 11000)
        next(new ApiError(409, "Email already exists."));
      else next(err);
    }
  }
}
