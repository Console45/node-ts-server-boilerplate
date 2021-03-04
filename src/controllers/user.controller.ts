import { NextFunction, Response } from "express";
import { auth } from "../middlewares/auth";
import { controller, get, use } from "../decorators";

@controller("/user")
class UserController {
  @get("/me")
  @use(auth)
  async getProfile(req: any, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      res.json({
        status: "success",
        message: `Gotten ${user.role} profile successfully`,
        data: {
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
