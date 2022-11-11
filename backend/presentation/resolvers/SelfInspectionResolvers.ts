import { AccessToken } from "../../use-cases/AccountUseCases";
import { GraphqlContext } from "../Server";
import { ResolversBase } from "./common/ResolversBase";

class SelfInspectionResolvers extends ResolversBase {
  override getQueryResolvers(): object {
    return {
      inspectSelf: (parent: any, args: any, context: GraphqlContext ) => {
        return context.accessToken.account
      }
    }
  }
}

export { SelfInspectionResolvers }