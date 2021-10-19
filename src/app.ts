import express, { Application, Request, Response } from "express";

import router from "./routes/index.js";

class App {
  private express: Application;
  constructor() {
    this.express = express();

    this.express.use("/api", router);

    this.express.get("/health", (req: Request, res: Response) => {
      res.send("server is alive");
    });
  }

  listen(port: string, cb: () => void) {
    this.express.listen(port, cb);
  }
}

export default new App();
