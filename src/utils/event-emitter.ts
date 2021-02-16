import { EventEmitter } from "events";

export enum Events {
  REGISTER_USER = "register-user",
}

export const eventEmitter = new EventEmitter();
