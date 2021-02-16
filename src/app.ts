import "reflect-metadata";
import { connectDatabase } from "./database/database-config";
import express, { Application, json } from "express";
import compression from "compression";
import { apiErrorHandler } from "./utils/api-error";
import { AppRouter } from "./utils/app-router";
import cors from "cors";
import "./controllers/root.controller";
import "./controllers/auth.conroller";
import { shouldCompress } from "./utils/app-utils";

const app: Application = express();

// connect database
connectDatabase();

app.use(cors());
app.use(compression({ filter: shouldCompress }));
app.use(json());
app.use(AppRouter.instance);
app.use(apiErrorHandler);

export default app;
