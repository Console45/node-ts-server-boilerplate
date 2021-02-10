import { Response } from "express";
/**
 *
 * @param {Response} res expess response
 * @param {string} token refresh token
 */
export const sendRefreshToken = (res: Response, token: string): void => {
  res.cookie("jid", token, { httpOnly: true, path: "/auth/refresh_token" });
};
