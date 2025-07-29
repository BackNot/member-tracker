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
      FIND_ALL: 'memberMembership:findAll'
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
    APP: {
      GET_VERSION: 'app:getVersion',
      CHECK_UPDATES: 'app:checkUpdates'
    },
    SETTINGS: {
      GET: 'settings:get',
      SET: 'settings:set'
    }
  };
  