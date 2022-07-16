import { Model } from "./explain/model.js";
import { WebSocketServer } from "ws";
import express from "express";

const app = express();

// set up a headless websocket server
const wsServer = new WebSocketServer({ noServer: true });

// spin up the server and handle an upgrade request to upgrade the connection to a websocket connection
const server = app.listen(3000);
server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request);
  });
});

// instantiate a new model
const model = new Model();

model.events.on("ready", (id) => console.log(id));
