import { SyntaxKind } from "ts-morph"
import { FormField } from "./FormField"
import { FormList } from "./FormList"
import { FormTemplate } from "./FormTemplate"

class FormFrame {
  constructor(name, typeReference) {
    this.name = name
    this.title = ""

    try {
      const properties = this._getProperties(typeReference)
      this.fields = this._getFields(properties)
    } catch(err) {
      console.error(`Failed creating FormFrame ${name}.`)
      console.error(err)
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

  createInstance = (parent) => {
    const instance = new FormFrame.Instance(this, parent)
    return instance
  }

  equals = (obj) => obj instanceof FormFrame && obj.name === this.name
}

export { FormFrame }