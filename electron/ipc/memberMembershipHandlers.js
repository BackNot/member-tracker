// electron/ipc/membershipHandlers.js
import { ipcMain } from 'electron';
import memberMembershipRepo from '../repositories/MemberMembershipRepository.js';
import Member from '../models/Member.js';
import Membership from '../models/Membership.js';

import { IPC_CHANNELS } from './ipcConstant.js';

export function registerMemberMembershipHandlers() {
  // Create handler
  ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.CREATE, (_e, data) => memberMembershipRepo.create(data));
  
  // Get all members handler
  ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.GET_ALL, async () => {
    try {
      if (!memberMembershipRepo || typeof memberMembershipRepo.findAll !== 'function') {
        console.error('memberMembershipRepo is invalid or missing findAll method:', memberMembershipRepo);
        return [];
      }
      const result = await memberMembershipRepo.findAll();
      console.log('getAll result:', result);
      return result || [];
    } catch (error) {
      console.error(`Error in ${IPC_CHANNELS.MEMBER_MEMBERSHIP.GET_ALL} handler:`, error);
      return [];
    }
  });
  
  ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.GET_ALL_ACTIVE, (_e, options) => memberMembershipRepo.findActive(options));

  ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.FIND_ONE, (_e, options) => memberMembershipRepo.findOne(options));
  
  ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.FIND_ALL, async (_e, options = {}) => {
    const withMembership = await memberMembershipRepo.findActive({
      ...options,
      include: [
        { model: Member, as: 'member' },
        { model: Membership, as: 'membership' }
      ]
    });
    return withMembership;
});
  // Get one member handler
  ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.GET_BY_ID, (_e, id) => memberMembershipRepo.findById(id));
  
  // Update member handler
  ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.UPDATE, (_e, values, options) => memberMembershipRepo.update(values, options));
  
  // Hard delete handler (if you still need this alongside soft delete)
  ipcMain.handle('memberMembership:delete', (_e, options) => memberMembershipRepo.destroy(options));
  
  // Soft delete handler
  ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.SOFT_DELETE, (_e, id) => memberMembershipRepo.softDelete(id));
  
  // Restore handler
  ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.RESTORE, (_e, id) => memberMembershipRepo.restore(id));
  
}