export const IPC_CHANNELS = {
    MEMBER: {
      GET_ALL_ACTIVE: 'member:getAllActive',
      GET_ALL: 'member:getAll',
      GET_BY_ID: 'member:getById',
      CREATE: 'member:create',
      UPDATE: 'member:update',
      SOFT_DELETE: 'member:softDelete',
      RESTORE: 'member:restore'
    },
     MEMBER_MEMBERSHIP: {
      GET_ALL_ACTIVE: 'memberMembership:getAllActive',
      GET_ALL: 'memberMembership:getAll',
      GET_BY_ID: 'memberMembership:getById',
      CREATE: 'memberMembership:create',
      UPDATE: 'memberMembership:update',
      SOFT_DELETE: 'memberMembership:softDelete',
      RESTORE: 'memberMembership:restore',
      FIND_ONE: 'memberMembership:findOne',
      FIND_ALL: 'memberMembership:findAll',
      GET_ALL_ACTIVE_BY_MEMBERS: "memberMembership:getLatestActiveMemberships",
      GET_EXPIRATIONS_BY_MONTH: 'memberMembership:getExpirationsByMonth'
    },
     MEMBERSHIP: {
      GET_ALL_ACTIVE: 'membership:getAllActive',
      GET_ALL: 'membership:getAll',
      GET_BY_ID: 'membership:getById',
      CREATE: 'membership:create',
      UPDATE: 'membership:update',
      SOFT_DELETE: 'membership:softDelete',
      RESTORE: 'membership:restore'
    },
     NOTIFICATION: {
      GET_ALL_ACTIVE: 'notification:getAllActive',
      GET_ALL: 'notification:getAll',
      GET_BY_ID: 'notification:getById',
      GET_UNREAD: 'notification:getUnread',
      GET_BY_MEMBER_MEMBERSHIP: 'notification:getByMemberMembership',
      CREATE: 'notification:create',
      UPDATE: 'notification:update',
      MARK_AS_READ: 'notification:markAsRead',
      MARK_ALL_AS_READ: 'notification:markAllAsRead',
      SOFT_DELETE: 'notification:softDelete',
      RESTORE: 'notification:restore',
      CHECK_EXPIRED: 'notification:checkExpired'
    },
    APP: {
      GET_VERSION: 'app:getVersion',
      CHECK_UPDATES: 'app:checkUpdates'
    },
    SETTINGS: {
      GET: 'settings:get',
      SET: 'settings:set'
    }
  };
  
