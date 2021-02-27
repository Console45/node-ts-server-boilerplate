import path from "path";
import fs from "fs";
import { format, transports, Logger, createLogger } from "winston";
import { MongoDBConnectionOptions } from "winston-mongodb";
import keys from "../../constants/keys";

export const logsDir = path.join(__dirname, "../../../", "logs");
const { printf, combine, timestamp, align, splat, colorize, simple } = format;

export const logFormat = printf(
  info => `${info.timestamp} ${info.level}: ${info.message}`
);

const fileTransportStreamOptions = (
  filename: string
): transports.FileTransportOptions => {
  return {
    level: "info",
    dirname: logsDir,
    filename,
    format: combine(
      timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      align(),
      logFormat
    ),
  };
};

export const consoleTransportStreamOptons = (): transports.ConsoleTransportOptions => {
  return {
    level: "info",
    format: combine(splat(), colorize(), simple()),
  };
};

export const mongodbTransportStreamOptions = (
  collection: string
): MongoDBConnectionOptions => {
  return {
    level: "error",
    db: keys.LOGS_MONGO_URI,
    options: { useUnifiedTopology: true },
    collection,
    silent: true,
    leaveConnectionOpen: true,
  };
};

export const logger = (filename: string): Logger => {
  return createLogger({
    exitOnError: false,
    transports: [new transports.File(fileTransportStreamOptions(filename))],
  });
};

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

export * from "./auth-logger";
export * from "./http-logger";
