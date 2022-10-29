import { AuthorizationRuleInstance } from "../entities/AuthorizationRuleInstance";
import { ClaimInstance, ClaimInstanceUnion } from "../entities/ClaimInstance";
import { VM } from "vm2"
import { transpile } from "typescript"
import { FormSchemaError, NotImplementedError } from "../../common/Errors";
import { ArrayTypeNode, TypeReferenceNode, SyntaxKind, Project } from "ts-morph"

class ExecutionResult {
  constructor(
    public authorized: boolean,
    public logMessages: string[] = [],
    public denyMessage: string | null = null,
    public errorMessage: string | null = null
  ) { }
}

interface RulesEngineService {
  checkAuthorization(claims: ClaimInstanceUnion[], ruleInstance: AuthorizationRuleInstance): ExecutionResult,
  applySchema(formValues: string, formSchema: string): string
  generateFormSchema(code: string): string
}

// TODO: Fix the types in this code. Holy fuck it's horrible.

type ListSchema = {
  type: 'list',
  itemSchema: Schemas
}

type GroupSchema = {
  type: 'group',
  name: string,
  fieldSchema: object
}

type PrimitiveSchema = {
  type: 'primitive',
  primitiveType: 'number' | 'string' | 'boolean'
}

type Schemas = ListSchema | GroupSchema | PrimitiveSchema

type FormSchema = {
  root: object
}

type primitives = string | number | boolean

class TypeScriptRulesEngineService implements RulesEngineService {
  checkAuthorization(claims: ClaimInstanceUnion[], ruleInstance: AuthorizationRuleInstance): ExecutionResult {
    const transpiledCode = transpile(ruleInstance.authorizationRule.deployedRule)

    const claimsObject = {}
    claims.forEach(claim => {
      if (!claim.type) throw new NotImplementedError()
      claimsObject[claim.type.name] = claim.value
    })

    let authorized: boolean = false
    let denyMessage: string | null = null
    let errorMessage: string | null = null
    const logs: string[] = []
    const vm = new VM({
      timeout: 1000,
      allowAsync: false,
      sandbox: {
        console: {
          log: (str: string) => {
            logs.push(str)
          }
        },
        globals: {
          request: {
            allow: () => authorized = true,
            deny: (reason: string) => {
              authorized = false
              denyMessage = reason
            },
            claims: claimsObject
          },
          args: JSON.parse(ruleInstance.argsValue)
        }
      }
    })

    vm.run(
`${transpiledCode}\n
authorize(globals.request, globals.args)`)

    logs.push(`Execution result: ${errorMessage ? 'error' : (authorized ? 'authorized' : 'unauthorized')}`)
    
    return new ExecutionResult(authorized, logs, denyMessage, errorMessage)
  }

  _mapPrimitiveState = (primitiveSchema: PrimitiveSchema, oldState: primitives): primitives | null => {
    try {
      switch(primitiveSchema.primitiveType) {
        case 'number':
          return typeof(oldState) == 'string' ?  Number.parseFloat(oldState) : oldState
        case 'string':
          return typeof (oldState) === 'string' ? oldState : oldState.toString()
        default:
          return null
      }
    } catch {
      return null
    }
  }
  
  _mapListState = (listSchema: ListSchema, oldState: primitives[] | object[]): (primitives | object | null)[] => {
    return oldState.map((state: primitives | object | primitives[] | object[]) => {
      const schema = listSchema.itemSchema
  
      switch (schema.type) {
        case 'primitive':
          
          return this._mapPrimitiveState(schema, state as primitives)
        case 'list':
          return this._mapListState(schema, state as primitives[] | object[])
        case 'group':
          return this._mapGroupState(schema, state as object)
      }
    })
  }
  
  _mapGroupState = (groupSchema: GroupSchema, oldState: object): object => {
    const newState = {}
  
    for (const name in groupSchema.fieldSchema) {
      if (!oldState[name]) {
        newState[name] = null
        continue
      }
  
      const schema = groupSchema.fieldSchema[name]
      switch (schema.type) {
        case 'primitive':
          newState[name] = this._mapPrimitiveState(schema, oldState[name])
          break
        case 'list':
          newState[name] = this._mapListState(schema, oldState[name])
          break
        case 'group':
          newState[name] = this._mapGroupState(schema, oldState[name])
          break
      }
    }
  
    return newState
  }

  applySchema = (formValues: string, formSchema: string): string => {
    const parsedFormValues = JSON.parse(formValues)
    const parsedFormSchema = JSON.parse(formSchema)

    return JSON.stringify(this._mapGroupState(parsedFormSchema, parsedFormValues))
  }

  _generateListSchema = (inputArrayType: ArrayTypeNode): ListSchema => {
    const arrayType = inputArrayType.getFirstChildByKind(SyntaxKind.ArrayType)
    const typeReference = inputArrayType.getFirstChildByKind(SyntaxKind.TypeReference)
    const primitiveType = inputArrayType?.getType()?.getArrayElementType()?.compilerType?.['intrinsicName']
  
    let itemSchema: Schemas | null = null
    if (arrayType) {
      itemSchema = this._generateListSchema(arrayType)
    } else if (typeReference) {
      itemSchema = this._generateGroupSchema(typeReference)
    } else if (primitiveType) {
      itemSchema = {
        type: 'primitive',
        primitiveType
      }
    } else {
      throw new FormSchemaError('Invalid AST node type for the Array\'s itemSchema.')
    }
  
    return {
      type: 'list',
      itemSchema
    }
  }
  
  _generateGroupSchema = (typeReference: TypeReferenceNode): GroupSchema => {
    const classDeclaration = typeReference
      ?.getFirstChildByKind(SyntaxKind.Identifier)
      ?.getDefinitionNodes()
      ?.find(definition => definition.isKind(SyntaxKind.ClassDeclaration))
  
    const name = classDeclaration?.getFirstChildByKind(SyntaxKind.Identifier)?.getText()
  
    if (!name) throw new FormSchemaError('Unabled to get class identifier.')
  
    const fieldSchema = classDeclaration
      ?.getFirstChildByKind(SyntaxKind.SyntaxList)
      ?.getChildrenOfKind(SyntaxKind.PropertyDeclaration)
      ?.reduce((propertyObject, property) => {
        const arrayType = property.getFirstChildByKind(SyntaxKind.ArrayType)
        const typeReference = property.getFirstChildByKind(SyntaxKind.TypeReference)
        const primitiveKeyword = [
          SyntaxKind.StringKeyword, 
          SyntaxKind.BooleanKeyword, 
          SyntaxKind.NumberKeyword
        ].find(syntaxKind => Boolean(property.getFirstChildByKind(syntaxKind)))
  
        let schema: object | null = null
        try {
          if (arrayType) {
            schema = this._generateListSchema(arrayType)
          } else if (typeReference) {
            schema = this._generateGroupSchema(typeReference)
          } else if (primitiveKeyword) {
            schema = {
              type: 'primitive',
              primitiveType: property?.getFirstChildByKind(primitiveKeyword)?.getText() ?? null
            }
          } else {
            throw new FormSchemaError('Invalid AST node type for the group\'s fieldSchema.')
          }
        } catch {
          return propertyObject
        }
  
        const propertyName = property?.getFirstChildByKind(SyntaxKind.Identifier)?.getText()
  
        if (!propertyName) throw new FormSchemaError('Can\'t resolve property name.')
  
        return {
          ...propertyObject,
          [propertyName]: schema
        }
      }, {})
  
    return {
      type: 'group',
      name,
      fieldSchema: fieldSchema ?? {}
    }
  }
  
  _generateFormSchema = (code: string): FormSchema => {
    const project = new Project({ useInMemoryFileSystem: true })
    const source = project.createSourceFile("something.ts", code)
  
    const authorizeFunction = source
      .getFirstChildByKind(SyntaxKind.SyntaxList)
      ?.getChildrenOfKind(SyntaxKind.FunctionDeclaration)
      ?.find(func => func.getName() === 'authorize')
  
    if (!authorizeFunction) throw new FormSchemaError('Cannot find a function with the identifier "authorize".')
  
    const argsTypeReference = authorizeFunction
      ?.getFirstChildByKind(SyntaxKind.SyntaxList)
      ?.getChildrenOfKind(SyntaxKind.Parameter)
      ?.find(param => param.getName() === 'args')
      ?.getFirstChildByKind(SyntaxKind.TypeReference)
  
    if (!argsTypeReference) throw new FormSchemaError('Cannot find a parameter named "args" inside the "authorize" function.')
  
    return {
      root: this._generateGroupSchema(argsTypeReference)
    }
  }

  generateFormSchema = (code: string): string => JSON.stringify(this._generateFormSchema(code))
}

export {
  RulesEngineService,
  TypeScriptRulesEngineService
}