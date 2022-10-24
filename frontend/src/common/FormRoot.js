import { Project, SyntaxKind } from "ts-morph"
import { FormFrame } from "./FormFrame"

class FormRoot {
  constructor(code) {
    const argsTypeReference = this._getArgsTypeReference(code)
    const rootName = "[Root]"
    try {
      this.formFrame = new FormFrame(rootName, argsTypeReference)
    } catch(err) {
      console.error(`Failed creating child of ${rootName}`)
      console.error(err)
    }

    this.formFrameInstance = this.formFrame?.createInstance(null)
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
    const unsubscribe = this.formFrameInstance.addValueListener(callback)
    return () => unsubscribe()
  }
}

export { FormRoot }