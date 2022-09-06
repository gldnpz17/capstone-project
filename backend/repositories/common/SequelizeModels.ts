import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize'

abstract class SequelizeModelBase {
  protected model: ModelStatic<Model<any, any>>
  private static initializedModels: string[] = []

  constructor(protected modelName: string, protected sequelize: Sequelize) { 
    if (!sequelize.models[modelName]) {
      this.model = this.createModel()
    } else {
      this.model = sequelize.models[modelName]
    }
  }

  protected abstract createModel(): ModelStatic<Model<any, any>>

  async initialize(): Promise<ModelStatic<Model<any, any>>> {
    if (!SequelizeModelBase.initializedModels.find(model => model == this.modelName)) {
      await this.model.sync()
      SequelizeModelBase.initializedModels.push(this.modelName)
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
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
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
      },
      totpSharedSecret: {
        type: DataTypes.STRING,
        allowNull: false
      }
    })  
  }
}

class AdminPrivilegePresetModel extends SequelizeModelBase {
  constructor(sequelize: Sequelize) { super('AdminPrivilegePreset', sequelize) } 

  protected createModel(): ModelStatic<Model<any, any>> {
    return this.sequelize.define(this.modelName, {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      canManageAccounts: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      canManageLocks: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    })
  }
}

export { AccountModel, AdminPrivilegePresetModel }