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
      throw new BadRequest("authorization header is required");
    const token: string = req.header("Authorization").replace("Bearer ", "");
    const user = await authServiceInstance.checkAuth(token);
    req.user = user;
    req.accessToken = token;
    next();
  } catch (err) {
    next(new UnAuthorizedRequest("Not authenticated"));
  }
};
