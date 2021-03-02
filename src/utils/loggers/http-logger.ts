import { transports } from "winston";
import {
  consoleTransportStreamOptons,
  logger,
  mongodbTransportStreamOptions,
} from ".";

export const httpLogger = logger({ filename: "http.log", level: "http" });

if (process.env.NODE_ENV === "development") {
  httpLogger.add(new transports.Console(consoleTransportStreamOptons("http")));
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
