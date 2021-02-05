import "reflect-metadata";
import { RouteHandlerDescriptor } from "./routes";
import { RequestHandler } from "express";
import { MetadataKeys } from "src/constants/constant";

export function use(middleware: RequestHandler) {
  return function (target: any, key: string, desc: RouteHandlerDescriptor) {
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
