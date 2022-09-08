import { Model, ModelStatic } from "sequelize";
import { TotpCredential } from "../domain-model/entities/TotpCredential";
import { GenericCrud, SequelizeGenericCrud } from "./common/GenericCrud";
import { EntityMapperBase } from "./common/RepositoryMapper";
import { SequelizeInstance } from "./common/SequelizeModels";

interface TotpCredentialsRepository {
  readByAccountId(id: string): Promise<TotpCredential | undefined>
}

class SequelizeTotpCredentialsRepository implements TotpCredentialsRepository {
  private model = this.db.getModel(SequelizeInstance.modelNames.account)
  private totpCredentialsCrud: GenericCrud<TotpCredential> = new SequelizeGenericCrud(this.model, this.mapper)

  constructor(
    private db: SequelizeInstance, 
    private mapper: EntityMapperBase<TotpCredential>
  ) { }

  readByAccountId = this.totpCredentialsCrud.readById
}

export { TotpCredentialsRepository, SequelizeTotpCredentialsRepository }