import { Project, SyntaxKind } from "ts-morph"
import { FormFrame } from "./FormFrame"

class FormRoot {
  constructor() {
    this.formFrame = null
    this.formFrameInstance = null
    this.valueCallbacks = {}
    this.unsubscriptions = []
  }

  _getArgsTypeReference = (code) => {
    const project = new Project({ useInMemoryFileSystem: true })
    const source = project.createSourceFile("something.ts", code)

    const authorizeFunction = source
      .getFirstChildByKind(SyntaxKind.SyntaxList)
      .getChildrenOfKind(SyntaxKind.FunctionDeclaration)
      .find(func => func.getName() === 'authorize')

    const argsTypeReference = authorizeFunction
      .getFirstChildByKind(SyntaxKind.SyntaxList)
      .getChildrenOfKind(SyntaxKind.Parameter)
      .find(param => param.getName() === 'args')
      .getFirstChildByKind(SyntaxKind.TypeReference)

    return argsTypeReference
  }

  addValueListener = (callback) => {
    const id = Math.random()
    this.valueCallbacks[id] = callback

    this.unsubscriptions.push(
      this.formFrameInstance.addValueListener(callback)
    )

    return () => {
      delete this.valueCallbacks[id]
    }
  }

  setCode = (code) => {
    console.log("Code updated.")

    const argsTypeReference = this._getArgsTypeReference(code)

    const rootName = "[Root]"
    if (!this.formFrame || !this.formFrame.equals(new FormFrame(rootName, argsTypeReference))) {
      this.unsubscriptions.forEach(unsubscribe => unsubscribe())
      this.unsubscriptions = []
      
      this.formFrame = new FormFrame(rootName, argsTypeReference)
      this.formFrameInstance = this.formFrame.createInstance(null)
      for (const callback in this.valueCallbacks) {
        this.unsubscriptions.push(
          this.formFrameInstance.addValueListener(callback)
        )
      }
    } else {
      this.formFrame.update(argsTypeReference)
    }
  }
}

export { FormRoot }