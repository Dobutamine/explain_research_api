import { Model } from "./explain/model.js";
import { createServer } from "https";
import { WebSocketServer } from "ws";
import { readFileSync } from "fs";
import express from "express";

// create an express application
const app = express();

// spin up the express server with https
const server = createServer(
  {
    key: readFileSync("./api/key.pem"),
    cert: readFileSync("./api/cert.pem"),
  },
  app
).listen(3000);

// handle the upgrade request for a websocket connection
server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request);
  });
});

// set up a headless websocket server
const wsServer = new WebSocketServer({ noServer: true });

// handle events on the websocket server
wsServer.on("connection", (client) => {
  client.on("message", (data) => {
    console.log(JSON.parse(data));
  });
});

// instantiate a new model
const model = new Model();
model.events.on("ready", (id) => console.log(id));
