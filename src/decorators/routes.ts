import "reflect-metadata";
import { RequestHandler } from "express";
import { MetadataKeys, Methods } from "src/constants/constant";

export interface RouteHandlerDescriptor extends PropertyDescriptor {
  value?: RequestHandler;
}

const routeBinder = (method: string) => {
  return function (path: string) {
    return function (target: any, key: string, desc: RouteHandlerDescriptor) {
      Reflect.defineMetadata(MetadataKeys.METHOD, method, target, key);
      Reflect.defineMetadata(MetadataKeys.PATH, path, target, key);
    };
  };
};

export const get = routeBinder(Methods.GET);
export const patch = routeBinder(Methods.PATCH);
export const post = routeBinder(Methods.POST);
export const del = routeBinder(Methods.DELETE);
export const put = routeBinder(Methods.PUT);