import { AuthorizationRule } from "../domain-model/entities/AuthorizationRule";
import { AuthorizationRuleMapper } from "./common/RepositoryMapper";
import { SequelizeInstance } from "./common/SequelizeModels";
import { SequelizeRepositoryBase } from "./common/SequelizeRepositoryBase";

interface AuthorizationRulesRepository {
  create(authorizationRule: { name: string, savedRule: string, savedFormSchema: string }): Promise<AuthorizationRule>
  readById(id: number): Promise<AuthorizationRule | undefined>
  update(id: number, authorizationRule: { name?: string, savedRule?: string, deployedRule?: string, savedFormSchema?: string, deployedFormSchema?: string }): Promise<AuthorizationRule | undefined>
  delete(id: number): Promise<AuthorizationRule | undefined>
}

class SequelizeAuthorizationRulesRepository extends SequelizeRepositoryBase<AuthorizationRule> implements AuthorizationRulesRepository {
  constructor(
    db: SequelizeInstance,
    mapper: AuthorizationRuleMapper
  ) { super(db, mapper, SequelizeInstance.modelNames.authorizationRule) }

  create = this.crud.create
  readById = this.crud.readById
  update = this.crud.update
  delete = this.crud.delete
}

export {
  AuthorizationRulesRepository,
  SequelizeAuthorizationRulesRepository
}