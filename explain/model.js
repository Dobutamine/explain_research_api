import { Worker } from "worker_threads";
import { readFileSync } from "fs";
import path from "path";
import * as models from "./core-models/index.js";

export class Model {
  initialized = false;
  available_models = {};
  model = {};
  worker;
  id = 0;
  port = 3000;

  constructor(model_filename = "normal_neonate", port = 3000) {
    // generate an id for this model
    this.id = Math.floor(Math.random() * 1000000);

    // build a available model list
    for (const [key, value] of Object.entries(models)) {
      this.available_models[key] = value;
    }

    // load the modeldefinition file from disk
    let model_definition = this.loadModelDefinitionFromDisk(model_filename);

    // initialize the model engine
    this.initializeModelEngine(model_definition);
  }

  initializeModelEngine(model_definition) {
    // parse the model definition file
    if (model_definition) {
      this.model = this.parseModelDefinition(model_definition);

      // if the model is parsed then setup the modelengine and inject the model-definition
      if (this.model) {
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
    });
    return JSON.parse(model_def);
  }

  parseModelDefinition(model_definition) {
    let parsedModel = {};
    // parse the main properties
    parsedModel["name"] = model_definition["name"];
    parsedModel["description"] = model_definition["description"];
    parsedModel["weight"] = model_definition["weight"];
    parsedModel["model_time_total"] = model_definition["model_time_total"];
    parsedModel["modeling_stepsize"] = model_definition["modeling_stepsize"];
    parsedModel["components"] = {};

    // parse the components
    let parsing_error = false;
    // iterate over all components
    for (const comp_name in model_definition.components) {
      let errorMessage = "";
      // get the component type
      const comp_type = model_definition.components[comp_name].model_type;
      // get all the properties of the component
      const comp_props = model_definition.components[comp_name];
      // we now have the type and the properties so first instantiate the correct model type
      let newComponent = {};
      if (comp_type in this.available_models) {
        newComponent = new this.available_models[comp_type]();
      } else {
        errorMessage = `Model initializing error: ${comp_type} model not found.`;
        parsing_error = true;
        console.log(errorMessage);
      }
      if (errorMessage === "") {
        // iterate over all properties
        for (const prop_name in comp_props) {
          let prop = comp_props[prop_name];
          if (comp_type in this.available_models) {
            // set the props on the newly formed component
            newComponent[prop_name] = prop;
          }
        }
        // add the component to the model
        parsedModel.components[comp_name] = newComponent;
      }
    }

    if (parsing_error) {
      return undefined;
    } else {
      return parsedModel;
    }
  }
}
