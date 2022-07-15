import { parentPort } from "worker_threads";

let model = {};
let initialized = false;

// get the message from the patent
parentPort.on("message", (mes) => processParentMessage(mes));

function processParentMessage(mes) {
  switch (mes.command) {
    case "init":
      // store the model and set the init flag to true
      model = mes.payload;
      initialized = true;
      // signal model that the model has been initiallized
      parentPort.postMessage({
        type: "status",
        message: "model ready",
        payload: {},
      });
      break;
  }
}

function calculate(timeToCalculate) {}

function start() {}

function stop() {}
