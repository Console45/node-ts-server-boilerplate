import { BadRequest } from "./../utils/api-error";
import { authServiceInstance } from "./../services/auth";
import { Response, NextFunction } from "express";
import { UnAuthorizedRequest } from "../utils/api-error";

export const auth = async (
  req: any,
  _: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.header("Authorization"))
      throw new BadRequest("Authorization header is required");
    const token: string = req.header("Authorization").replace("Bearer ", "");
    const user = await authServiceInstance.checkAuth(token);
    req.user = user;
    req.accessToken = token;
    next();
  } catch (err) {
    if (err.message === "Authorization header is required") next(err);
    else next(new UnAuthorizedRequest("Not authenticated"));
  }
};
