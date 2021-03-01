import { EventEmitter } from "events";
import Container, { Token } from "typedi";

export const eventEmitter = new EventEmitter();

export const EVENT_EMITTER_TOKEN = new Token<EventEmitter>("event.emitter");
Container.set(EVENT_EMITTER_TOKEN, eventEmitter);
