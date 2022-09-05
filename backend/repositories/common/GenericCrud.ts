import { Model, ModelStatic } from "sequelize/types"

interface GenericReadAllConfig {
  start?: number
  count?: number
}

interface GenericCrud<TEntity> {
  create(instance: any): Promise<TEntity>
  readAll(config: GenericReadAllConfig): Promise<TEntity[]>
  readById(id: number): Promise<TEntity | undefined>
  update(id: number, instance: any): Promise<TEntity | undefined>
  delete(id: number): Promise<TEntity | undefined>
}

class SequelizeGenericCrud<TEntity> implements GenericCrud<TEntity> {
  model: ModelStatic<Model<any, any>>
  
  constructor(model: ModelStatic<Model<any, any>>) {
    this.model = model
  }

  async create(instance: any): Promise<TEntity> {
    return (await this.model.create(instance)).toJSON()
  }

  async readAll(config: GenericReadAllConfig): Promise<TEntity[]> {
    return (await this.model
      .findAll({ 
        offset: config.start ?? 0, 
        limit: config.count
      }))
      .map(model => model.toJSON())
  }

  async readById(id: number): Promise<TEntity | undefined> {
    return (await this.model.findByPk(id))?.toJSON()
  }

  async update(id: number, instance: any): Promise<TEntity | undefined> {
    const modelInstance = await this.model.findByPk(id)
    await modelInstance?.update({ ...instance })
    const entity = modelInstance?.toJSON()

    return entity
  }

  async delete(id: number): Promise<TEntity | undefined> {
    const modelInstance = await this.model.findByPk(id)
    const entity = modelInstance?.toJSON()
    
    await modelInstance?.destroy()

    return entity
  }
}

export { GenericCrud, SequelizeGenericCrud, GenericReadAllConfig }