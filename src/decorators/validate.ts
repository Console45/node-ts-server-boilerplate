import { MetadataKeys } from "../constants/constant";
import { Validator } from "../validators/validationFunction";

export function validate(...validators: Validator[]) {
  return function (target: any, key: string, _: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKeys.VALIDATOR, validators, target, key);
  };
}
