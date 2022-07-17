import { Model } from "./explain/model.js";
import { createServer } from "https";
import { WebSocketServer } from "ws";
import { readFileSync } from "fs";
import express from "express";

// create a dictionary holding all the clients
// clients = { id: 1000, model: model instance, socket: websocket }

let clients = {};

// create an express application
const app = express();

// spin up the express server with https
const server = createServer(
  {
    key: readFileSync("./api/key.pem"),
    cert: readFileSync("./api/cert.pem"),
  },
  app
).listen(80);

// when a request comes in on the https server an id is generated which is needed for the websocket connection
// when this id a new model instance is created

// create an array of websockets
let wsSockets = [];

const wsServer = new WebSocketServer({ port: 8080 });
wsServer.on("connection", function (socket) {
  wsSockets.push(socket);

  socket.on("message", function (msg) {
    console.log(msg);
  });

  socket.on("close", () => {
    wsSockets = wsSockets.filter((s) => s !== socket);
  });
});

// instantiate a new model
const model = new Model("normal_neonate");
model.events.on("ready", (id) => console.log(id));
