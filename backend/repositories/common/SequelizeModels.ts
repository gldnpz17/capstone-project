import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize'

abstract class SequelizeInstance {
  private sequelize: Sequelize
  
  public static modelNames = {
    account: 'Account',
    adminPrivilegePreset: 'AdminPrivilegePreset',
    claimType: 'ClaimType',
    claimInstance: 'ClaimInstance',
    enumClaimTypeOption: 'EnumClaimTypeOption'
  }

  public static getId(modelName: string) {
    return modelName + 'Id'
  }

  constructor() {
    this.sequelize = this.getSequelize()
  }

  protected abstract getSequelize(): Sequelize

  public async initialize(): Promise<this> {
    const Account = this.sequelize.define(SequelizeInstance.modelNames.account, {
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

    const AdminPrivileges = this.sequelize.define(SequelizeInstance.modelNames.adminPrivilegePreset, {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      system: {
        type: DataTypes.BOOLEAN,
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

    const ClaimType = this.sequelize.define(SequelizeInstance.modelNames.claimType, {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dataType: {
        type: DataTypes.ENUM('string', 'number', 'boolean', 'enum'),
        allowNull: false
      },
      enumDefaultOption: {
        type: DataTypes.INTEGER
      }
    })

    const EnumClaimTypeOption = this.sequelize.define(SequelizeInstance.modelNames.enumClaimTypeOption, {
      value: {
        type: DataTypes.STRING,
        allowNull: false
      }
    })

    const ClaimInstance = this.sequelize.define(SequelizeInstance.modelNames.claimInstance, {
      stringValue: DataTypes.STRING,
      numberValue: DataTypes.DOUBLE,
      booleanValue: DataTypes.BOOLEAN,
      enumValue: DataTypes.STRING
    })

    AdminPrivileges.hasMany(Account, {
      foreignKey: {
        allowNull: false
      }
    })
    Account.belongsTo(AdminPrivileges)

    Account.hasMany(ClaimInstance, { 
      foreignKey: { 
        allowNull: false 
      } 
    })
    ClaimInstance.belongsTo(Account)

    ClaimType.hasMany(EnumClaimTypeOption)
    EnumClaimTypeOption.belongsTo(ClaimType)

    ClaimType.hasMany(ClaimInstance)
    ClaimInstance.belongsTo(ClaimType)

    await this.sequelize.sync()

    await AdminPrivileges.bulkCreate([
      {
        name: 'End User',
        system: true,
        canManageAccounts: false,
        canManageLocks: true
      }, 
      {
        name: 'Super Admin',
        system: true,
        canManageAccounts: true,
        canManageLocks: true
      }
    ])

    return this
  }

  public getModel(modelName: string) {
    return this.sequelize.models[modelName]
  }
}

class InMemorySqliteSequelizeInstance extends SequelizeInstance{
  protected getSequelize(): Sequelize {
    return new Sequelize('sqlite::memory')
  }
}

export { SequelizeInstance, InMemorySqliteSequelizeInstance }