import { Model, ModelStatic } from "sequelize";
import { TotpCredential } from "../domain-model/entities/TotpCredential";
import { GenericCrud, SequelizeGenericCrud } from "./common/GenericCrud";
import { EntityMapperBase } from "./common/RepositoryMapper";

interface TotpCredentialsRepository {
  readByAccountId(id: string): Promise<TotpCredential | undefined>
}

class SequelizeTotpCredentialsRepository implements TotpCredentialsRepository {
  private totpCredentialsCrud: GenericCrud<TotpCredential> = new SequelizeGenericCrud(this.accountModel, this.mapper)

  constructor(
    private accountModel: ModelStatic<Model<any, any>>, 
    private mapper: EntityMapperBase<TotpCredential>
  ) { }

  readByAccountId = this.totpCredentialsCrud.readById
}

export { TotpCredentialsRepository, SequelizeTotpCredentialsRepository }