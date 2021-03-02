import { transports } from "winston";
import {
  consoleTransportStreamOptons,
  logger,
  mongodbTransportStreamOptions,
} from ".";

export const authLogger = logger({ filename: "auth.log" });

if (process.env.NODE_ENV === "development") {
  authLogger.add(new transports.Console(consoleTransportStreamOptons("http")));
}

if (process.env.NODE_ENV === "production") {
  authLogger.add(
    new transports.MongoDB(mongodbTransportStreamOptions("auth_logs"))
  );
}
