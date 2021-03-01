import { EventEmitter } from "events";

/**
 * Events enum
 * @enum
 */
export enum Events {
  REGISTER_USER = "register-user",
  LOGIN_USER = "login-user",
  REFRESH_TOKEN = "refresh-token",
}

export const eventEmitter = new EventEmitter();
