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
    APP: {
      GET_VERSION: 'app:getVersion',
      CHECK_UPDATES: 'app:checkUpdates'
    },
    SETTINGS: {
      GET: 'settings:get',
      SET: 'settings:set'
    }
  };
  