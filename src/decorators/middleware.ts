import { RouteHandlerDescriptor } from "./routes";
import { RequestHandler } from "express";
import { MetadataKeys } from "../constants/constant";

/**
 * Middleware decorator
 * @param {RequestHandler} middleware Middleware request handler
 */
export function use(middleware: RequestHandler) {
  return function (target: Object, key: string, _: RouteHandlerDescriptor) {
    const middlewares =
      Reflect.getMetadata(MetadataKeys.MIDDLEWARE, target, key) || [];

    Reflect.defineMetadata(
      MetadataKeys.MIDDLEWARE,
      [...middlewares, middleware],
      target,
      key
    );
  };
}
