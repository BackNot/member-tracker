// electron/ipc/memberHandlers.js
import { ipcMain } from 'electron';
import memberRepo from '../repositories/MemberRepository.js';
import { IPC_CHANNELS } from './ipcConstant.js';

export function registerMemberHandlers() {
  // Create handler
  ipcMain.handle(IPC_CHANNELS.MEMBER.CREATE, (_e, data) => memberRepo.create(data));
  
  // Get all members handler
  ipcMain.handle(IPC_CHANNELS.MEMBER.GET_ALL, async () => {
    console.log('memberRepo:', memberRepo);
    try {
      if (!memberRepo || typeof memberRepo.findAll !== 'function') {
        console.error('memberRepo is invalid or missing findAll method:', memberRepo);
        return [];
      }
      const result = await memberRepo.findAll();
      console.log('getAll result:', result);
      return result || [];
    } catch (error) {
      console.error(`Error in ${IPC_CHANNELS.MEMBER.GET_ALL} handler:`, error);
      return [];
    }
  });
  
  // Get one member handler
  ipcMain.handle(IPC_CHANNELS.MEMBER.GET_BY_ID, (_e, options) => memberRepo.findOne(options));
  
  // Update member handler
  ipcMain.handle(IPC_CHANNELS.MEMBER.UPDATE, (_e, values, options) => memberRepo.update(values, options));
  
  // Hard delete handler (if you still need this alongside soft delete)
  ipcMain.handle('member:delete', (_e, options) => memberRepo.destroy(options));
  
  // Soft delete handler
  ipcMain.handle(IPC_CHANNELS.MEMBER.SOFT_DELETE, (_e, id) => memberRepo.softDelete(id));
  
  // Restore handler
  ipcMain.handle(IPC_CHANNELS.MEMBER.RESTORE, (_e, id) => memberRepo.restore(id));
  
  console.log('Member IPC handlers registered successfully');
}