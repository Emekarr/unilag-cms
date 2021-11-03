import http from "http";

import { Server } from "socket.io";
import app from "./app";

const server = http.createServer(app.express);
export const io = new Server(server);

export default server;
