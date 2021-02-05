import { Request, Response } from "express";
import { controller, get } from "../decorators";

@controller("")
class RootController {
  @get("/")
  getRootRoute(req: Request, res: Response) {
    res.json({
      message: "node ts boilerplate code",
      status: "success",
    });
  }
}
