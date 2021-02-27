import { transports } from "winston";
import {
  consoleTransportStreamOptons,
  logger,
  mongodbTransportStreamOptions,
} from ".";

export const authLogger = logger("auth.log");

if (process.env.NODE_ENV !== "production") {
  authLogger.add(new transports.Console(consoleTransportStreamOptons()));
}

if (process.env.NODE_ENV === "production") {
  authLogger.add(
    new transports.MongoDB(mongodbTransportStreamOptions("auth_logs"))
  );
}
