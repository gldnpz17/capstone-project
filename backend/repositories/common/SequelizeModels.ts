import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize'

abstract class SequelizeModelBase {
  protected model: ModelStatic<Model<any, any>>
  private static initialized = false

  constructor(protected modelName: string, protected sequelize: Sequelize) { 
    if (!sequelize.models[modelName]) {
      this.model = this.createModel()
    } else {
      this.model = sequelize.models[modelName]
    }
  }

  protected abstract createModel(): ModelStatic<Model<any, any>>

  async initialize(): Promise<ModelStatic<Model<any, any>>> {
    if (!SequelizeModelBase.initialized) {
      await this.model.sync()
      SequelizeModelBase.initialized = true
    }
    return this.model
  }
}

class AccountModel extends SequelizeModelBase {
  constructor(sequelize: Sequelize) {
    super('Account', sequelize)
  }

  protected createModel(): ModelStatic<Model<any, any>> {
    return this.sequelize.define(this.modelName, {
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      hash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      salt: {
        type: DataTypes.STRING,
        allowNull: false
      }
    })  
  }
}

export { AccountModel }