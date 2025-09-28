// preload.js - CommonJS format
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
  },
  // Backup-specific APIs for easier access
  backup: {
    checkAuth: () => ipcRenderer.invoke('backup:check-auth'),
    authenticate: () => ipcRenderer.invoke('backup:authenticate'),
    completeAuth: (authCode) => ipcRenderer.invoke('backup:complete-auth', authCode),
    create: () => ipcRenderer.invoke('backup:create'),
    list: () => ipcRenderer.invoke('backup:list'),
    restore: (fileId, fileName) => ipcRenderer.invoke('backup:restore', fileId, fileName),
    delete: (fileId) => ipcRenderer.invoke('backup:delete', fileId),
    disconnect: () => ipcRenderer.invoke('backup:disconnect')
  },
  
  // Notification-specific APIs
  notification: {
    getAll: () => ipcRenderer.invoke('notification:getAll'),
    getAllActive: (options) => ipcRenderer.invoke('notification:getAllActive', options),
    getUnread: (options) => ipcRenderer.invoke('notification:getUnread', options),
    getById: (id) => ipcRenderer.invoke('notification:getById', id),
    getByMemberMembership: (memberMembershipId, options) => ipcRenderer.invoke('notification:getByMemberMembership', memberMembershipId, options),
    create: (data) => ipcRenderer.invoke('notification:create', data),
    update: (values, options) => ipcRenderer.invoke('notification:update', values, options),
    markAsRead: (id) => ipcRenderer.invoke('notification:markAsRead', id),
    markAllAsRead: (memberMembershipId) => ipcRenderer.invoke('notification:markAllAsRead', memberMembershipId),
    softDelete: (id) => ipcRenderer.invoke('notification:softDelete', id),
    restore: (id) => ipcRenderer.invoke('notification:restore', id)
  },

  // MemberMembership-specific APIs
  memberMembership: {
    getExpirationsByMonth: (year, month) => ipcRenderer.invoke('memberMembership:getExpirationsByMonth', year, month)
  }
});