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
    enumClaimTypeOption: 'EnumClaimTypeOption',
    smartLock: 'SmartLock',
    deviceProfile: 'DeviceProfile',
    authorizationRule: 'AuthorizationRule'
  }

  private static compositeUniques = {
    accountClaimType: 'AccountClaimType'
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
      totpSharedSecret: DataTypes.STRING
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
        unique: true
      },
      camelCaseName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
      [SequelizeInstance.getId(SequelizeInstance.modelNames.account)]: {
        type: DataTypes.UUIDV4,
        references: {
          model: Account,
          key: 'id'
        },
        unique: SequelizeInstance.compositeUniques.accountClaimType
      },
      [SequelizeInstance.getId(SequelizeInstance.modelNames.claimType)]: {
        type: DataTypes.INTEGER,
        references: {
          model: ClaimType,
          key: 'id'
        },
        unique: SequelizeInstance.compositeUniques.accountClaimType
      },
      // TODO: Fix this stupidity. Just use a single string column and change the data type in the repository.
      stringValue: DataTypes.STRING,
      numberValue: DataTypes.DOUBLE,
      booleanValue: DataTypes.BOOLEAN,
      enumValue: DataTypes.STRING
    })

    const DeviceProfile = this.sequelize.define(SequelizeInstance.modelNames.deviceProfile, {
      privateKey: DataTypes.STRING,
      publicKey: DataTypes.STRING,
      macAddress: DataTypes.STRING,
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    })

    const SmartLock = this.sequelize.define(SequelizeInstance.modelNames.smartLock, {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      wifiSsid: DataTypes.STRING,
      wifiPassword: DataTypes.STRING,
      lockStatus: {
        type: DataTypes.ENUM('locked', 'unlocked'),
        defaultValue: 'locked'
      },
      authorizationRuleArgs: DataTypes.STRING
    })

    const AuthorizationRule = this.sequelize.define(SequelizeInstance.modelNames.authorizationRule, {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      savedRule: DataTypes.STRING,
      deployedRule: DataTypes.STRING,
      savedFormSchema: DataTypes.STRING,
      deployedFormSchema: DataTypes.STRING,
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

    this.registerAssociation(
      SequelizeInstance.modelNames.smartLock,
      'device',
      SmartLock.belongsTo(DeviceProfile)
    )
    this.registerAssociation(
      SequelizeInstance.modelNames.deviceProfile,
      'smartLock',
      DeviceProfile.hasOne(SmartLock)
    )

    this.registerAssociation(
      SequelizeInstance.modelNames.authorizationRule,
      'smartLocks',
      AuthorizationRule.hasMany(SmartLock, { 
        onDelete: 'SET NULL'
      })
    )
    this.registerAssociation(
      SequelizeInstance.modelNames.smartLock,
      'authorizationRule',
      SmartLock.belongsTo(AuthorizationRule)
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