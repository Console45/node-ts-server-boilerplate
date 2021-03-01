import { authServiceInstance } from "./../services/auth";
import { Response, Request, NextFunction } from "express";
import compression from "compression";

/**
 * Should the compressor compress the respond?
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @returns {boolean} true or false
 */
export const shouldCompress = (req: Request, res: Response) => {
  if (req.headers["x-no-compression"]) {
    return false;
  }

  return compression.filter(req, res);
};

export const passRes = (_: Request, res: Response, next: NextFunction) => {
  authServiceInstance.res = res;
  next();
};
