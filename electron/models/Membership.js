import { Model, DataTypes } from 'sequelize';

class Membership extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        days: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
          deletedAt: {
          type: DataTypes.DATE,
          allowNull: true
        }
      },
      {
        sequelize,
        modelName: 'Membership',
        tableName: 'memberships',
        timestamps: true
      }
    );
  }
}

export default Membership;