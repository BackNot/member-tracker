import { Model, DataTypes } from 'sequelize';

class Notification extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        isRead: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        memberMembershipId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'member_memberships',
            key: 'id'
          }
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true
        }
      },
      {
        sequelize,
        modelName: 'Notification',
        tableName: 'notifications',
        timestamps: true
      }
    );
  }
}

export default Notification;