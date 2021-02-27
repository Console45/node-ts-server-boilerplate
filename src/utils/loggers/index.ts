import path from "path";
import fs from "fs";
import "winston-mongodb";
import { format, transports, Logger, createLogger } from "winston";
import { MongoDBConnectionOptions } from "winston-mongodb";
import keys from "../../constants/keys";

export const logsDir = path.join(__dirname, "../../../", "logs");
const { printf, combine, timestamp, align, splat, colorize, simple } = format;

export const logFormat = printf(
  info => `${info.timestamp} ${info.level}: ${info.message}`
);

const fileTransportStreamOptions = (
  filename: string,
  level: string = "info"
): transports.FileTransportOptions => {
  return {
    level: level,
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

export const consoleTransportStreamOptons = (
  level: string
): transports.ConsoleTransportOptions => {
  return {
    level: level,
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
  };
};

interface loggerOptions {
  filename: string;
  level?: string;
}

export const logger = ({ filename, level }: loggerOptions): Logger => {
  return createLogger({
    exitOnError: false,
    transports: [
      new transports.File(fileTransportStreamOptions(filename, level)),
    ],
  });
};

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

export * from "./auth-logger";
export * from "./http-logger";
