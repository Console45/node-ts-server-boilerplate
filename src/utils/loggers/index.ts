import path from "path";
import fs from "fs";
import { format } from "winston";
import "winston-mongodb";

export const logsDir = path.join(__dirname, "../../../", "logs");
const {
  printf,
  combine,
  timestamp,
  align,
  splat,
  colorize,
  simple,
  json,
} = format;

export const logFormat = printf(
  info => `${info.timestamp} ${info.level}: ${info.message}`
);

export const fileTransportFormat = () =>
  combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    align(),
    logFormat
  );

export const consoleTransportFormat = () =>
  combine(splat(), colorize(), simple());

export const mongodbTransportFormat = () => combine(timestamp(), json());

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

export * from "./auth-logger";
export * from "./http-logger";
