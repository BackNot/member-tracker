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
  }
});