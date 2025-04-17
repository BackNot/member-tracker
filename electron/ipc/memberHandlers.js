// electron/ipc/memberHandlers.js
import { ipcMain } from 'electron';
import memberRepo from '../repositories/MemberRepository.js';

export function registerMemberHandlers() {
  ipcMain.handle('member:create', (_e, data) => memberRepo.create(data));
  ipcMain.handle('member:getAll', async () => {
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
      console.error('Error in member:getAll handler:', error);
      return [];
    }
  });
  ipcMain.handle('member:findOne', (_e, options) => memberRepo.findOne(options));
  ipcMain.handle('member:update', (_e, values, options) => memberRepo.update(values, options));
  ipcMain.handle('member:delete', (_e, options) => memberRepo.destroy(options));
  
  // Add softDelete and restore handlers
  ipcMain.handle('member:softDelete', (_e, id) => memberRepo.softDelete(id));
  ipcMain.handle('member:restore', (_e, id) => memberRepo.restore(id));
}