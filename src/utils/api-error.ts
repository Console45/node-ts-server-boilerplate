import { httpLogger } from "./loggers/http-logger";
import { NextFunction, Request, Response, ErrorRequestHandler } from "express";

enum HttpErrorCodes {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER = 500,
}

/**
 * Class representing an Api Error
 * @class Api Error
 *
 */
export default class ApiError {
  public readonly code: HttpErrorCodes | number;
  public readonly message: string;
  public readonly data: any;
  /**
   * Creates a new Api error
   * @param {HttpErrorCodes} code error code
   * @param {string} message error message
   * @param {any} data error data
   */
  constructor(code: HttpErrorCodes, message: string, data: any = null) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}

/**
 * Class representing a bad request(400) error
 * @class
 * @extends ApiError Api Error class
 */
export class BadRequest extends ApiError {
  /**
   * creates a new Bad request error
   * @param {string} message error message
   * @param {any} data error data
   */
  constructor(message: string, data: any = null) {
    super(HttpErrorCodes.BAD_REQUEST, message, data);
  }
}

/**
 * Class representing an Internal server(500) error
 * @class
 * @extends ApiError Api Error class
 */
export class InternalServerError extends ApiError {
  /**
   * creates a new Internal server error
   * @param {string} message error message
   * @param {any} data error data
   */
  constructor(message: string, data: any = null) {
    super(HttpErrorCodes.INTERNAL_SERVER, message, data);
  }
}

/**
 * Class representing a Forbidden request(403) error
 * @class
 * @extends ApiError Api Error class
 */
export class ForbiddenRequest extends ApiError {
  /**
   * creates a new Forbidden request error
   * @param {string} message error message
   * @param {any} data error data
   */
  constructor(message: string, data: any = null) {
    super(HttpErrorCodes.FORBIDDEN, message, data);
  }
}

/**
 * Class representing a Not found (404) error
 * @class
 * @extends ApiError Api Error class
 */
export class NotFoundError extends ApiError {
  /**
   * creates a new Not found error
   * @param {string} message error message
   * @param {any} data error data
   */
  constructor(message: string, data: any = null) {
    super(HttpErrorCodes.NOT_FOUND, message, data);
  }
}

/**
 * Class representing a Unauthorized request(401) error
 * @class
 * @extends ApiError Api Error class
 */
export class UnAuthorizedRequest extends ApiError {
  /**
   * creates a new Unauthorized request   error
   * @param {string} message error message
   * @param {any} data error data
   */
  constructor(message: string, data: any = null) {
    super(HttpErrorCodes.UNAUTHORIZED, message, data);
  }
}
/**
 * Server error middleware
 * @param {Error} err error object
 * @param {Request} _ express request object
 * @param {Response} res express response object
 * @param {NextFunction} __ express next function
 * @returns error response from server
 */
export const apiErrorHandler: ErrorRequestHandler = (
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction
) => {
  // api error response
  if (err instanceof ApiError) {
    httpLogger.error(
      `statusCode:${err.code},message:${err.message},data:${err.data}`
    );

    return res
      .status(err.code)
      .json({ message: err.message, status: "error", data: err.data });
  }
  //invalid payload response
  if (
    err instanceof SyntaxError &&
    (err as any).status === 400 &&
    "body" in err
  ) {
    httpLogger.error(
      `statusCode:${HttpErrorCodes.BAD_REQUEST},message:invalid JSON payload passed,data:null`
    );
    return res.status(HttpErrorCodes.BAD_REQUEST).json({
      message: "invalid JSON payload passed.",
      status: "error",
      data: null,
    });
  }

  httpLogger.error(
    `statusCode:${HttpErrorCodes.INTERNAL_SERVER},message:${err.message},data:null`
  );
  res
    .status(HttpErrorCodes.INTERNAL_SERVER)
    .json({ message: err.message, status: "error", data: null });
};
