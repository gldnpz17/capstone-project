import { FormTemplate } from "./FormTemplate"

class FormField {
  constructor(name, dataType) {
    this.name = name
    this.dataType = dataType
  }

  static Instance = class extends FormTemplate.Instance {
    constructor(formField, parent) {
      super(formField, parent)
      this.value = null
      switch (formField.dataType) {
        case "string":
          this.value = ""
          break
        case "boolean":
          this.value = false
          break
        case "number":
          this.value = 0
          break
      }
    }

    setValue = (e) => {
      this.value = e.target.value
      this._notifySubscribers()
    }

    toObject = () => this.value
  }

  createInstance = (parent) => new FormField.Instance(this, parent)

  update = (dataType) => {} // idk what to do tbh. Maybe handle type conversion?

  equals = (formField) => formField.name === this.name && formField.dataType === this.dataType
}

export { FormField }