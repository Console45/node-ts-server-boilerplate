import { transports } from "winston";
import {
  consoleTransportStreamOptons,
  logger,
  mongodbTransportStreamOptions,
} from ".";

export const httpLogger = logger("http.log");

if (process.env.NODE_ENV !== "production") {
  httpLogger.add(new transports.Console(consoleTransportStreamOptons()));
}

export const stream = {
  write(message: string) {
    httpLogger.http(message);
  },
};

if (process.env.NODE_ENV === "production") {
  httpLogger.add(
    new transports.MongoDB(mongodbTransportStreamOptions("http_logs"))
  );
}
