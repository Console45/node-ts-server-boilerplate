import { createLogger, transports } from "winston";
import { consoleTransportFormat, fileTransportFormat, logsDir } from ".";
import keys from "../../constants/keys";

export const httpLogger = createLogger({
  exitOnError: false,
  transports: [
    new transports.File({
      level: "http",
      dirname: logsDir,
      filename: `http.log`,
      format: fileTransportFormat(),
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  httpLogger.add(
    new transports.Console({
      level: "http",
      format: consoleTransportFormat(),
    })
  );
}

export const stream = {
  write(message: string) {
    httpLogger.http(message);
  },
};

if (process.env.NODE_ENV === "production") {
  httpLogger.add(
    new transports.MongoDB({
      level: "error",
      db: keys.LOGS_MONGO_URI,
      options: { useUnifiedTopology: true },
      collection: "http_logs",
      silent: true,
      leaveConnectionOpen: true,
    })
  );
}
