import express, { Application } from "express";

class App {
  private express: Application;
  constructor() {
    this.express = express();
  }

  listen(port: string, cb: () => void) {
    this.express.listen(port, cb);
  }
}

export default new App();
