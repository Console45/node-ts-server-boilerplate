import "reflect-metadata";
import express, { Application, json, urlencoded } from "express";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./database/database-config";
import { apiErrorHandler } from "./utils/api-error";
import { AppRouter } from "./utils/app-router";
import { passRes, shouldCompress } from "./utils/app-utils";
import morgan from "morgan";
import { stream } from "./utils/loggers";
import "./utils/run-error";
import "./controllers/root.controller";
import "./controllers/auth.conroller";
import "./controllers/user.controller";

const app: Application = express();

// connect database
connectDatabase();
app.use(cors());
app.use(hpp());
app.use(helmet());
app.use(morgan("combined", { stream }));
app.use(cookieParser());
app.use(compression({ filter: shouldCompress }));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(passRes);
app.use(AppRouter.instance);
app.use(apiErrorHandler);

export default app;
