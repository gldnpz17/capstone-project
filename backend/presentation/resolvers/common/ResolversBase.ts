abstract class ResolversBase {
  protected mapUseCase(useCaseMethod: Function, options: { spread: boolean } = { spread: false }): Function {
    return async function (_: any, args: any) {
      if (options.spread) {
        const spreadArgs: any[] = []
        for (const key in args) {
          spreadArgs.push(args[key])
        }
        return await useCaseMethod(...spreadArgs)
      }

      return await useCaseMethod(args)
    }
  }

  getQueryResolvers(): object { 
    return {} 
  }
  getMutationResolvers(): object {
    return {}
  }
  getTypeResolvers(): object {
    return {}
  }
}

export { ResolversBase }