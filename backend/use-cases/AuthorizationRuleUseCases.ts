import { NotImplementedError } from "../common/Errors"
import { ApplicationConfiguration } from "../domain-model/common/ApplicationConfiguration"
import { AuthorizationRule } from "../domain-model/entities/AuthorizationRule"
import { BooleanClaim, ClaimInstance, EnumClaim, NumberClaim, StringClaim } from "../domain-model/entities/ClaimInstance"
import { RulesEngineService } from "../domain-model/services/RulesEngineService"
import { AuthorizationRulesRepository } from "../repositories/AuthorizationRulesRepository"
import { ClaimTypeRepository } from "../repositories/ClaimTypeRepository"
import { SmartLocksRepository } from "../repositories/SmartLocksRepository"

class AuthorizationRuleUseCases {
  constructor(
    private configuration: ApplicationConfiguration,
    private repository: AuthorizationRulesRepository,
    private claimTypeRepository: ClaimTypeRepository,
    private smartLocksRepository: SmartLocksRepository,
    private rulesEngineService: RulesEngineService
  ) { }

  create = async (): Promise<AuthorizationRule> => {
    const defaultRule = this.configuration.defaultAuthorizationRule

    const newAuthorizationRule = await this.repository.create({
      name: "Untitled Rule",
      savedRule: defaultRule,
      savedFormSchema: this.rulesEngineService.generateFormSchema(defaultRule)
    })

    return newAuthorizationRule
  }

  saveChanges = async (params: { id: number, authorizationRule: string }): Promise<void> => {
    const { id, authorizationRule } = params

    const savedFormSchema = this.rulesEngineService.generateFormSchema(authorizationRule)

    await this.repository.update(id, {
      savedRule: authorizationRule,
      savedFormSchema
    })
  }

  update = async (params: { id: number, authorizationRule: { name: string }}) => {
    const { id, authorizationRule } = params
    await this.repository.update(id, authorizationRule)
  }

  deploy = async (id: number): Promise<void> => {
    const authorizationRule = await this.repository.readByIdIncludeSmartLocks(id)

    if (!authorizationRule) return

    const { savedRule, savedFormSchema } = authorizationRule

    await this.repository.update(id, {
      deployedRule: savedRule,
      deployedFormSchema: savedFormSchema
    })

    if (authorizationRule.smartLocks) {
      await Promise.all(authorizationRule.smartLocks.map(async (lock) => {
        if (!lock.authorizationRuleArgs) return
        await this.smartLocksRepository.update(lock.id, {
          authorizationRuleArgs: this.rulesEngineService.applySchema(
            savedFormSchema,
            lock.authorizationRuleArgs
          )
        })
      }))
    }
  }

  applySchema = async (params: { schema: string, values: string }): Promise<string> => {
    const newValues = this.rulesEngineService.applySchema(params.schema, params.values)
    return newValues
  }

  execute = async (params: { id: number, args: string, claims: { typeId: number, value: string }[] }) => {
    const { id, args, claims } = params

    const [rule, claimObjects] = await Promise.all([
      await this.repository.readById(id),
      await Promise.all(claims.map(async (claim, index) => {
        const claimType = await this.claimTypeRepository.readById(claim.typeId)
        const claimId = index

        if (!claimType) throw new NotImplementedError()

        switch(claimType.dataType) {
          case 'string':
            return new StringClaim(claimId, claimType, claim.value)
          case 'boolean':
            return new BooleanClaim(claimId, claimType, Boolean(claim.value))
          case 'number':
            return new NumberClaim(claimId, claimType, Number.parseFloat(claim.value))
          case 'enum':
            return new EnumClaim(claimId, claimType, claim.value)
          default:
            throw new NotImplementedError()
        }
      }))
    ])

    if (!rule) throw new NotImplementedError()

    const result = this.rulesEngineService.checkAuthorization(claimObjects, rule.savedRule, args)

    return result
  }

  delete = this.repository.delete
}

export { AuthorizationRuleUseCases }