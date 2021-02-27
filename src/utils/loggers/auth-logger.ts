import { createLogger, transports } from "winston";
import { fileTransportFormat, consoleTransportFormat, logsDir } from ".";
import keys from "../../constants/keys";

export const authLogger = createLogger({
  exitOnError: false,
  transports: [
    new transports.File({
      level: "info",
      dirname: logsDir,
      filename: `auth.log`,
      format: fileTransportFormat(),
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  authLogger.add(
    new transports.Console({
      level: "info",
      format: consoleTransportFormat(),
    })
  );
}
if (process.env.NODE_ENV === "production") {
  authLogger.add(
    new transports.MongoDB({
      level: "error",
      db: keys.LOGS_MONGO_URI,
      options: { useUnifiedTopology: true },
      collection: "auth_logs",
      silent: true,
      leaveConnectionOpen: true,
    })
  );
}
