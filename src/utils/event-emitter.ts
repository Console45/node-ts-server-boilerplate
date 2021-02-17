import { EventEmitter } from "events";

/**
 * Events enum
 * @enum
 */
export enum Events {
  REGISTER_USER = "register-user",
  LOGIN_USER = "login-user",
}

export const eventEmitter = new EventEmitter();
