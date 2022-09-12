import { DataTypes, Model, ModelStatic, Sequelize, HasMany, BelongsTo } from 'sequelize'

type AssociationTypes = HasMany | BelongsTo

class SequelizeAssociation {
  constructor(
    public propertyName: string,
    public association: AssociationTypes
  ) { }
}

abstract class SequelizeInstance {
  private sequelize: Sequelize
  private associations: Record<string, SequelizeAssociation[]> = {}
  
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

  private registerAssociation(modelName: string, propertyName: string, association: AssociationTypes) {
    if (!this.associations[modelName]) this.associations[modelName] = []

    this.associations[modelName].push(new SequelizeAssociation(propertyName, association))
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

    this.registerAssociation(
      SequelizeInstance.modelNames.adminPrivilegePreset,
      'accounts',
      AdminPrivileges.hasMany(Account, {
        foreignKey: {
          allowNull: false
        }
      })
    )
    this.registerAssociation(
      SequelizeInstance.modelNames.account,
      'privilegePreset',
      Account.belongsTo(AdminPrivileges)
    )

    this.registerAssociation(
      SequelizeInstance.modelNames.account,
      'claims',
      Account.hasMany(ClaimInstance, { 
        foreignKey: { 
          allowNull: false 
        } 
      })
    )
    this.registerAssociation(
      SequelizeInstance.modelNames.claimInstance,
      'account',
      ClaimInstance.belongsTo(Account)
    )

    this.registerAssociation(
      SequelizeInstance.modelNames.claimType,
      'options',
      ClaimType.hasMany(EnumClaimTypeOption)
    )
    this.registerAssociation(
      SequelizeInstance.modelNames.enumClaimTypeOption,
      'type',
      EnumClaimTypeOption.belongsTo(ClaimType)
    )

    this.registerAssociation(
      SequelizeInstance.modelNames.claimType,
      'claims',
      ClaimType.hasMany(ClaimInstance, {
        onDelete: 'CASCADE'
      })
    )
    this.registerAssociation(
      SequelizeInstance.modelNames.claimInstance,
      'type',
      ClaimInstance.belongsTo(ClaimType)
    )

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

  public getAssociations(modelName: string): SequelizeAssociation[] {
    return this.associations[modelName]
  }
}

class InMemorySqliteSequelizeInstance extends SequelizeInstance {
  protected getSequelize(): Sequelize {
    return new Sequelize('sqlite::memory')
  }
}

export { SequelizeInstance, InMemorySqliteSequelizeInstance }