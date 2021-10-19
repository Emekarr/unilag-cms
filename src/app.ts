import express, { Application, Request, Response } from "express";

class App {
  private express: Application;
  constructor() {
    this.express = express();

    this.express.get("/health", (req: Request, res: Response) => {
      res.send("server is alive");
    });
  }

  listen(port: string, cb: () => void) {
    this.express.listen(port, cb);
  }
}

export default new App();
