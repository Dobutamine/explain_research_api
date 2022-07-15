export class CoreModel {
  model;
  is_enabled;
  is_initialized = false;

  constructor(model) {
    this.model = model;
  }

  modelStep() {
    if (this.is_initialized) {
      this.calcStep();
    } else {
      this.initModel();
    }
  }

  initModel() {}

  calcModel() {}
}
