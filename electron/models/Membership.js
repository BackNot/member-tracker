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
        type: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'time'  // 'time' or 'training'
        },
        trainings: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null
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