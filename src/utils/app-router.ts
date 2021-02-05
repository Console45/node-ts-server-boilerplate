import { Router } from "express";

export class AppRouter {
  private static _instance: Router;

  /**
   * Gets the App router instance
   * @returns Router
   */
  static get instance(): Router {
    if (!AppRouter._instance) AppRouter._instance = Router();
    return AppRouter._instance;
  }
}
