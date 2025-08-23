// electron/ipc/notificationHandlers.js
import { ipcMain } from 'electron';
import notificationRepo from '../repositories/NotificationRepository.js';
import { IPC_CHANNELS } from './ipcConstant.js';

export function registerNotificationHandlers() {
  // Create handler
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION.CREATE, (_e, data) => notificationRepo.create(data));
  
  // Get all notifications handler
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION.GET_ALL, async () => {
    console.log('notificationRepo:', notificationRepo);
    try {
      if (!notificationRepo || typeof notificationRepo.findAll !== 'function') {
        console.error('notificationRepo is invalid or missing findAll method:', notificationRepo);
        return [];
      }
      const result = await notificationRepo.findAll();
      console.log('getAll result:', result);
      return result || [];
    } catch (error) {
      console.error(`Error in ${IPC_CHANNELS.NOTIFICATION.GET_ALL} handler:`, error);
      return [];
    }
  });
  
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION.GET_ALL_ACTIVE, (_e, options) => notificationRepo.findActive(options));
  
  // Get unread notifications handler
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION.GET_UNREAD, (_e, options) => notificationRepo.findUnread(options));
  
  // Get one notification handler
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION.GET_BY_ID, (_e, id) => notificationRepo.findById(id));
  
  // Update notification handler
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION.UPDATE, (_e, values, options) => notificationRepo.update(values, options));
  
  // Mark as read handler
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION.MARK_AS_READ, (_e, id) => notificationRepo.markAsRead(id));
  
  // Mark all as read handler
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION.MARK_ALL_AS_READ, (_e, memberMembershipId) => notificationRepo.markAllAsRead(memberMembershipId));
  
  // Get notifications by member membership handler
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION.GET_BY_MEMBER_MEMBERSHIP, (_e, memberMembershipId, options) => notificationRepo.findByMemberMembership(memberMembershipId, options));
  
  // Hard delete handler (if you still need this alongside soft delete)
  ipcMain.handle('notification:delete', (_e, options) => notificationRepo.destroy(options));
  
  // Soft delete handler
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION.SOFT_DELETE, (_e, id) => notificationRepo.softDelete(id));
  
  // Restore handler
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION.RESTORE, (_e, id) => notificationRepo.restore(id));
  
  console.log('Notification IPC handlers registered successfully');
}