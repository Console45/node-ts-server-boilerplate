import { Response, Request } from "express";
import compression from "compression";

/**
 *
 * @param {Response} res expess response
 * @param {string} token refresh token
 */
export const sendRefreshToken = (res: Response, token: string): void => {
  res.cookie("jid", token, { httpOnly: true, path: "/auth/refresh_token" });
};

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
