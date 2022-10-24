import { SyntaxKind } from "ts-morph"
import { FormField } from "./FormField"
import { FormList } from "./FormList"
import { FormTemplate } from "./FormTemplate"

class FormFrame {
  constructor(name, typeReference) {
    this.name = name
    this.title = ""

    const properties = this._getProperties(typeReference)
    this.fields = this._getFields(properties)

    this.instances = []
    for (let name in this.fields) {
      this._addField(name, this.fields[name])
    }
  }

  static Instance = class extends FormTemplate.Instance {
    constructor(formFrame, parent) {
      super(formFrame, parent)
      this.fieldInstances = {}
      for (const name in formFrame.fields) {
        const field = formFrame.fields[name]
        this.fieldInstances[name] = field.createInstance(this)
      }
    }

    _addField = (name) => {
      this.fieldInstances[name] = this.template.fields[name].createInstance(this)
      this._notifySubscribers()
    }

    _deleteField = (name) => {
      delete this.fieldInstances[name]
      this._notifySubscribers()
    }

    toObject = () => {
      const obj = {}
      for (const name in this.fieldInstances) {
        obj[name] = this.fieldInstances[name].toObject()
      }
      return obj
    }
  }

  _getFields = (properties) => {
    const fields = {}
    for (const name in properties) {
      const { kind, astNode } = properties[name]

      switch (kind) {
        case 'primitive':
          fields[name] = new FormField(name, astNode)
          break
        case 'array':
          fields[name] = new FormList(name, astNode)
          break
        case 'class':
          fields[name] = new FormFrame(name, astNode)
          break
        default:
          throw new Error('Invalid property kind.')
      }
    }
    return fields
  }

  _getProperties = (typeReference) => {
    const type = typeReference
      .getFirstChildByKind(SyntaxKind.Identifier)
      .getDefinitionNodes()
      .find(definition => definition.isKind(SyntaxKind.ClassDeclaration))

    return type
      .getFirstChildByKind(SyntaxKind.SyntaxList)
      .getChildrenOfKind(SyntaxKind.PropertyDeclaration)
      .reduce((propertyObject, property) => {
        const arrayType = property.getFirstChildByKind(SyntaxKind.ArrayType)
        const typeReference = property.getFirstChildByKind(SyntaxKind.TypeReference)
        const primitiveKeyword = [
          SyntaxKind.StringKeyword, 
          SyntaxKind.BooleanKeyword, 
          SyntaxKind.NumberKeyword
        ].find(syntaxKind => Boolean(property.getFirstChildByKind(syntaxKind)))

        let kind = null
        let astNode = null
        if (arrayType) {
          kind = 'array'
          astNode = arrayType
        } else if (typeReference) {
          kind = 'class'
          astNode = typeReference
        } else if (primitiveKeyword) {
          kind = 'primitive'
          astNode = property.getFirstChildByKind(primitiveKeyword).getText()
        } else {
          return propertyObject
        }

        const propertyName = property.getFirstChildByKind(SyntaxKind.Identifier).getText()
        return {
          ...propertyObject,
          [propertyName]: { kind, astNode }
        }
      }, {})
  }

  _addField = (name, field) => {
    this.fields[name] = field
    this.instances.forEach(instance => instance._addField(name))
  }

  _deleteField = (name) => {
    delete this.fields[name]
    this.instances.forEach(instance => instance._deleteField(name))
  }

  createInstance = (parent) => {
    const instance = new FormFrame.Instance(this, parent)
    this.instances.push(instance)
    return instance
  }

  update = (typeReference) => {
    const newProperties = this._getProperties(typeReference)
    const newFields = this._getFields(newProperties)

    for (const name in this.fields) {
      // If the old field does not exist in the new version.
      if (!newFields[name]) {
        this._deleteField(name)
      }

      // If the old field is incompatible with the new version.
      if (this.fields[name] && !this.fields[name].equals(newFields[name])) {
        this._deleteField(name)
      }
    }

    for (const name in newFields) {
      // If the new field does not exist in the old version.
      if (!this.fields[name]) {
        this._addField(name, newFields[name])
      }

      // Update existing fields with new code.
      if (this.fields[name]) {
        const { astNode } = newProperties[name]
        this.fields[name].update(astNode)
      }
    }
  }

  equals = (obj) => obj instanceof FormFrame && obj.name === this.name
}

export { FormFrame }