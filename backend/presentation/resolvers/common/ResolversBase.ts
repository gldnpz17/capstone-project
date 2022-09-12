abstract class ResolversBase {
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