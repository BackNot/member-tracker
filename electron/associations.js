import Member from './models/Member.js';
import Membership from './models/Membership.js';
import MemberMembership from './models/MemberMembership.js';

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
}