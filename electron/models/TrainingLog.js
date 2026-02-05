import { Model, DataTypes } from 'sequelize';

class TrainingLog extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        memberMembershipId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'member_membership_id',
          references: {
            model: 'member_memberships',
            key: 'id'
          }
        },
        usedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'used_at'
        },
        action: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'subtract'  // 'subtract' or 'add'
        }
      },
      {
        sequelize,
        modelName: 'TrainingLog',
        tableName: 'training_logs',
        timestamps: true
      }
    );
  }
}

export default TrainingLog;
