import { createServer, Server } from "http";

import express, { Application, Request, Response } from "express";
import socket from "socket.io";

import router from "./routes/index";
import error_middleware from "./middleware/error_middleware";
import ServerResponse from "./utils/response";
import SocketController from "./controller/socket_controller";
import("./model/connect");

class App {
  private express: Application;
  public server: Server;
  public io: socket.Server;

  constructor() {
    this.express = express();

    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));

    this.express.use("/api", router);

    this.express.get("/health", (req: Request, res: Response) => {
      new ServerResponse("Server is alive.").statusCode(200).respond(res);
    });

    this.express.use(error_middleware);

    this.express.use("*", (req, res) => {
      new ServerResponse(`The route ${req.baseUrl} does not exist.`)
        .statusCode(404)
        .success(false)
        .respond(res);
    });
  }

  listenWithSocket(port: string, cb: () => void) {
    this.server = createServer(this.express);
    this.io = new socket.Server(this.server);
    new SocketController(this.io);
    this.server.listen(port, cb);
  }
}

export default new App();
