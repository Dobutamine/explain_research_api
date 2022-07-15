import { Worker } from "worker_threads";
import { readFileSync } from "fs";
import path from "path";
import { timeStamp } from "console";

export class Model {
  model_initialized = false;
  model;
  worker;
  id = 0;
  port = 3000;

  constructor(model_filename = "normal_neonate", port = 3000) {
    // load the modeldefinition file from disk
    let model_definition = this.loadModelDefinitionFromDisk(model_filename);

    // initialize the model engine
    if (model_definition) {
      this.initializeModelEngine(model_definition);
    }
  }

  initializeModelEngine(model_definition) {
    // parse the model definition file
    if (model_definition) {
      this.model = this.parseModelDefinition(model_definition);

      // instantiate a worker thread running the model-engine
      this.worker = new Worker("./explain/model-engine.js");

      // open a communication channel with the model engine
      this.worker.on("message", (message) => {
        this.modelEngineMessage(message);
      });

      this.worker.on("error", (err) => {
        this.modelEngineError(err);
      });

      this.worker.on("exit", (code) => {
        this.modelEngineExit(code);
      });

      // inject the model_definition object into the model-engine
      this.worker.postMessage({
        type: "inject_definition",
        message: "",
        payload: this.model,
      });
    }
  }

  modelEngineMessage(mes) {
    console.log(mes);
  }

  modelEngineError(err) {
    console.log(`Modelengine error: ${err}`);
  }

  modelEngineExit(code) {
    console.log(`Modelengine exit code: ${code}`);
  }

  sendMessageToModelEngine(type, message, payload) {
    this.worker.postMessage({
      type: type,
      message: message,
      payload: payload,
    });
  }

  loadModelDefinitionFromDisk(filename) {
    // construct the correct filename by adding to extension and path
    const abs_path = path.resolve(
      "./explain/model-definitions/" + filename + ".json"
    );

    let model_def = readFileSync(abs_path, "utf-8", function (err, data) {
      if (err) {
        console.log("Model definition file not found on disk.");
      }
      try {
        return JSON.parse(data);
      } catch {}
    });
    return model_def;
  }

  parseModelDefinition(model_definition) {}
}
