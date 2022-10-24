class FormTemplate {
  static Instance = class {
    constructor(template, parent) {
      this.template = template
      this.parent = parent
      this.rerenderCallbacks = {}
      this.valueCallbacks = {}
    }

    _notifySubscribers = () => {
      for (const id in this.rerenderCallbacks) {
        const rerender = this.rerenderCallbacks[id]
        rerender()
      }
      this._bubbleValueChanges()
    }

    _bubbleValueChanges = () => {
      this.parent?._bubbleValueChanges()
      for (const id in this.valueCallbacks) {
        this.valueCallbacks[id](this.toObject())
      }
    }
    
    addValueListener = (callback) => {
      const id = Math.random()
      this.valueCallbacks[id] = callback

      return () => delete this.valueCallbacks[id]
    }

    subscribe = (rerenderCallback) => {
      const id = Math.random()
      this.rerenderCallbacks[id] = rerenderCallback

      return () => delete this.rerenderCallbacks[id]
    }

    toObject = () => { }
  }
}

export { FormTemplate }