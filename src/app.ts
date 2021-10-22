import express, { Application, Request, Response } from "express";

import router from "./routes/index";
import error_middleware from "./middleware/error_middleware";
import ServerResponse from "./utils/response";

class App {
  private express: Application;
  constructor() {
    this.express = express();

    this.express.use("/api", router);

    this.express.get("/health", (req: Request, res: Response) => {
      new ServerResponse("Server is alive.").statusCode(200).respond(res);
    });

    this.express.use(error_middleware);
  }

  listen(port: string, cb: () => void) {
    this.express.listen(port, cb);
  }
}

export default new App()
