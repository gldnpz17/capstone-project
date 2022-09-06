import { Model, ModelStatic } from "sequelize/types"
import { EntityMapperBase } from "./RepositoryMapper"

interface GenericReadAllConfig {
  start?: number
  count?: number
}

interface GenericCrud<TEntity> {
  create(instance: any): Promise<TEntity>
  readAll(config: GenericReadAllConfig): Promise<TEntity[]>
  readById(id: number | string): Promise<TEntity | undefined>
  update(id: number | string, instance: any): Promise<TEntity | undefined>
  delete(id: number | string): Promise<TEntity | undefined>
}

class SequelizeGenericCrud<TEntity> implements GenericCrud<TEntity> {
  constructor(
    private model: ModelStatic<Model<any, any>>,
    private mapper: EntityMapperBase<TEntity>
  ) {  }

  async create(instance: any): Promise<TEntity> {
    return this.mapper.map((await this.model.create(instance)).toJSON()).get()
  }

  async readAll(config: GenericReadAllConfig): Promise<TEntity[]> {
    return (await this.model
      .findAll({ 
        offset: config.start ?? 0, 
        limit: config.count
      }))
      .map(model => model.toJSON())
      .map(item => this.mapper.map(item).get())
  }

  async readById(id: number | string): Promise<TEntity | undefined> {
    return this.mapper.map((await this.model.findByPk(id))?.toJSON()).get() 
  }

  async update(id: number | string, instance: any): Promise<TEntity | undefined> {
    const modelInstance = await this.model.findByPk(id)
    await modelInstance?.update({ ...instance })
    const entity = modelInstance?.toJSON()

    return this.mapper.map(entity).get()
  }

  async delete(id: number | string): Promise<TEntity | undefined> {
    const modelInstance = await this.model.findByPk(id)
    const entity = modelInstance?.toJSON()
    
    await modelInstance?.destroy()

    return this.mapper.map(entity).get()
  }
}

export { GenericCrud, SequelizeGenericCrud, GenericReadAllConfig }