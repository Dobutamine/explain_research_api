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
    case "start":
      start();
      break;
    case "stop":
      stop();
      break;
    case "reset":
      reset();
      break;
    case "calculate":
      calculate(mes.payload);
      break;
    case "set_dc":
      setDatacollector(mes.payload);
      break;
    case "set_props":
      setProperties(mes.payload);
      break;
  }
}

function calculate(timeToCalculate) {
  console.log("calculating model for " + timeToCalculate);
}

function start() {
  console.log("starting realtime model");
}

function stop() {
  console.log("stopping realtime model");
}

function reset() {
  console.log("resetting model");
}

function setDatacollector(dc_config) {
  console.log("configuring the datacollector with " + dc_config);
}

function setProperties(properties) {
  console.log("setting model properties");
}
