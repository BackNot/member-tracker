import Member from './models/Member.js';
import Membership from './models/Membership.js';
import MemberMembership from './models/MemberMembership.js';
import Notification from './models/Notification.js';
import TrainingLog from './models/TrainingLog.js';

export function setupAssociations() {  
  MemberMembership.belongsTo(Member, { 
    foreignKey: 'memberId',
    as: 'member'
  });

  MemberMembership.belongsTo(Membership, { 
    foreignKey: 'membershipId',
    as: 'membership'
  });

  Member.hasMany(MemberMembership, { 
    foreignKey: 'memberId',
    as: 'memberMemberships'
  });

  Membership.hasMany(MemberMembership, { 
    foreignKey: 'membershipId',
    as: 'memberMemberships'
  });

  Notification.belongsTo(MemberMembership, {
    foreignKey: 'memberMembershipId',
    as: 'memberMembership'
  });

  MemberMembership.hasOne(Notification, {
    foreignKey: 'memberMembershipId',
    as: 'notification'
  });

  TrainingLog.belongsTo(MemberMembership, {
    foreignKey: 'memberMembershipId',
    as: 'memberMembership'
  });

  MemberMembership.hasMany(TrainingLog, {
    foreignKey: 'memberMembershipId',
    as: 'trainingLogs'
  });
}