// electron/ipc/membershipHandlers.js
import { ipcMain } from 'electron';
import membershipRepo from '../repositories/MembershipRepository.js';
import { IPC_CHANNELS } from './ipcConstant.js';

export function registerMembershipHandlers() {
  // Create handler
  ipcMain.handle(IPC_CHANNELS.MEMBERSHIP.CREATE, (_e, data) => membershipRepo.create(data));
  
  // Get all members handler
  ipcMain.handle(IPC_CHANNELS.MEMBERSHIP.GET_ALL, async () => {
    console.log('membershipRepo:', membershipRepo);
    try {
      if (!membershipRepo || typeof membershipRepo.findAll !== 'function') {
        console.error('membershipRepo is invalid or missing findAll method:', membershipRepo);
        return [];
      }
      const result = await membershipRepo.findAll();
      console.log('getAll result:', result);
      return result || [];
    } catch (error) {
      console.error(`Error in ${IPC_CHANNELS.MEMBERSHIP.GET_ALL} handler:`, error);
      return [];
    }
  });
  
  ipcMain.handle(IPC_CHANNELS.MEMBERSHIP.GET_ALL_ACTIVE, (_e, options) => membershipRepo.findActive());
  
  // Get one member handler
  ipcMain.handle(IPC_CHANNELS.MEMBERSHIP.GET_BY_ID, (_e, id) => membershipRepo.findById(id));
  
  // Update member handler
  ipcMain.handle(IPC_CHANNELS.MEMBERSHIP.UPDATE, (_e, values, options) => membershipRepo.update(values, options));
  
  // Hard delete handler (if you still need this alongside soft delete)
  ipcMain.handle('membership:delete', (_e, options) => membershipRepo.destroy(options));
  
  // Soft delete handler
  ipcMain.handle(IPC_CHANNELS.MEMBERSHIP.SOFT_DELETE, (_e, id) => membershipRepo.softDelete(id));
  
  // Restore handler
  ipcMain.handle(IPC_CHANNELS.MEMBERSHIP.RESTORE, (_e, id) => membershipRepo.restore(id));
  
  console.log('Membership IPC handlers registered successfully');
}