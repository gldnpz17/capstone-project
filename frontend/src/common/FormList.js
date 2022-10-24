import { SyntaxKind } from "ts-morph"
import { FormField } from "./FormField"
import { FormFrame } from "./FormFrame"
import { FormTemplate } from "./FormTemplate"

class FormList {
  constructor(name, arrayType) {
    this.name = name

    this.itemType = null
    const { kind, astNode } = this._getArrayItem(arrayType)
    const itemName = "[ArrayItem]"
    switch (kind) {
      case 'primitive':
        this.itemType = new FormField(itemName, astNode)
        break
      case 'class':
        this.itemType = new FormFrame(itemName, astNode)
        break
      case 'array':
        this.itemType = new FormList(itemName, astNode)
        break
      default:
        throw new Error('Invalid array item kind.')
    }

    this.itemInstances = []
  }

  static Instance = class extends FormTemplate.Instance {
    constructor(formList, parent) {
      super(formList, parent)
      this.itemInstances = []
    }

    addItem = () => {
      this.itemInstances.push(this.template.itemType.createInstance(this))
      this._notifySubscribers()
    }

    deleteItem = (index) => () => {
      this.itemInstances.splice(index, 1)
      this._notifySubscribers()
    }

    toObject = () => this.itemInstances.map(item => item.toObject())
  }

  _getArrayItem = (inputArrayType) => {
    const arrayType = inputArrayType.getFirstChildByKind(SyntaxKind.ArrayType)
    const typeReference = inputArrayType.getFirstChildByKind(SyntaxKind.TypeReference)

    let kind = null
    let astNode = null
    if (arrayType) {
      kind = 'array'
      astNode = arrayType
    } else if (typeReference) {
      kind = 'class'
      astNode = typeReference
    } else {
      kind = 'primitive'
      astNode = inputArrayType.getType().getArrayElementType().compilerType.intrinsicName
    }

    return { kind, astNode }
  }

  update = (arrayType) => {} // I also don't know what to do here.

  createInstance = (parent) => new FormList.Instance(this, parent)

  equals = (formList) => formList.name === this.name && formList.itemType.equals(this.itemType)
}

export { FormList }