import { validationFunction } from "./../validators/validationFunction";
import { MetadataKeys, Methods } from "../constants/constant";
import { AppRouter } from "../utils/app-router";

const getMetadata = (
  metadataKey: MetadataKeys,
  target: Object,
  propertyKey: string
): any => {
  return Reflect.getMetadata(metadataKey, target, propertyKey);
};

export function controller(prefix: string) {
  return function (constructor: Function) {
    const router = AppRouter.instance;
    for (let key in constructor.prototype) {
      const handler = constructor.prototype[key];
      const path = getMetadata(MetadataKeys.PATH, constructor.prototype, key);
      const method: Methods = getMetadata(
        MetadataKeys.METHOD,
        constructor.prototype,
        key
      );
      const middlewares =
        getMetadata(MetadataKeys.MIDDLEWARE, constructor.prototype, key) || [];
      const validator = getMetadata(
        MetadataKeys.VALIDATOR,
        constructor.prototype,
        key
      );
      if (path)
        router[method](
          `${prefix}${path}`,
          ...middlewares,
          validationFunction(validator),
          handler
        );
    }
  };
}
