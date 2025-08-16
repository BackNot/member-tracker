// MemberMembership.js
import { Model, DataTypes } from 'sequelize';

class MemberMembership extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        memberId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'member_id',
          references: {
            model: 'members',
            key: 'id'
          }
        },
        membershipId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'membership_id',
          references: {
            model: 'memberships',
            key: 'id'
          }
        },
        startDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          field: 'start_date'
        },
        endDate: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: 'end_date'
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true
        }
      },
      {
        sequelize,
        modelName: 'MemberMembership',
        tableName: 'member_memberships',
        timestamps: true,
        indexes: [
          // REMOVED: The unique constraint index
          // {
          //   unique: true,
          //   fields: ['member_id', 'membership_id'],
          //   where: {
          //     deletedAt: null
          //   }
          // },
          {
            fields: ['member_id']  // Keep this for performance
          },
          {
            fields: ['membership_id']  // Keep this for performance
          }
        ]
      }
    );
  }
}

export default MemberMembership;