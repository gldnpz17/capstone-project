import { GenericCrud, SequelizeGenericCrud } from "./GenericCrud"
import { EntityMapperBase } from "./RepositoryMapper"
import { SequelizeInstance } from "./SequelizeModels"

class SequelizeRepositoryBase<TModel> {
  model = this.db.getModel(this.modelName)
  crud: GenericCrud<TModel> = new SequelizeGenericCrud(this.model, this.mapper)

  constructor(
    protected db: SequelizeInstance,
    protected mapper: EntityMapperBase<TModel>,
    protected modelName: string
  ) { }
}

export { SequelizeRepositoryBase }