import express, { Application, json } from "express";
import { apiErrorHandler } from "./utils/api-error";
import { AppRouter } from "./utils/app-router";
import "./controllers/root.controller";

const app: Application = express();

app.use(json());
app.use(AppRouter.instance);
app.use(apiErrorHandler);

export default app;
