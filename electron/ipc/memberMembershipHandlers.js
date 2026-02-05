// electron/ipc/membershipHandlers.js
import { ipcMain } from 'electron';
import memberMembershipRepo from '../repositories/MemberMembershipRepository.js';
import membershipRepo from '../repositories/MembershipRepository.js';
import Member from '../models/Member.js';
import Membership from '../models/Membership.js';

import { IPC_CHANNELS } from './ipcConstant.js';

export function registerMemberMembershipHandlers() {
  // Create handler - enriches data with trainings from the membership type
  ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.CREATE, async (_e, data) => {
    // Fetch the membership type to get trainings count
    const membershipType = await membershipRepo.findById(data.membershipId);

    const enrichedData = {
      ...data,
      totalTrainings: membershipType?.trainings ?? null,
      remainingTrainings: membershipType?.trainings ?? null
    };

    return memberMembershipRepo.create(enrichedData);
  });

  // Subtract training handler
  ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.SUBTRACT_TRAINING, async (_e, memberMembershipId) => {
    return memberMembershipRepo.subtractTraining(memberMembershipId);
  });

  // Add training handler
  ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.ADD_TRAINING, async (_e, memberMembershipId) => {
    return memberMembershipRepo.addTraining(memberMembershipId);
  });
  
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

    ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.GET_ALL_ACTIVE_BY_MEMBERS, (_e, options) => memberMembershipRepo.getLatestActiveMemberships(options));

ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.FIND_ONE, (_e, memberMembershipId) => 
  memberMembershipRepo.findOne({
    where: { 
      id: memberMembershipId 
    },
    include: [{
      model: Member, // Your Member model
      as: 'member'   // The alias if you have one defined
    }]
  })
);
  
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
  
  // Get expirations by month handler
  ipcMain.handle(IPC_CHANNELS.MEMBER_MEMBERSHIP.GET_EXPIRATIONS_BY_MONTH, async (_e, year, month) => {
    try {
      const result = await memberMembershipRepo.getExpirationsByMonth(year, month);
      return result;
    } catch (error) {
      console.error(`Error in ${IPC_CHANNELS.MEMBER_MEMBERSHIP.GET_EXPIRATIONS_BY_MONTH} handler:`, error);
      return [];
    }
  });

  // Get training logs for a member membership
  ipcMain.handle(IPC_CHANNELS.TRAINING_LOG.GET_BY_MEMBER_MEMBERSHIP, async (_e, memberMembershipId) => {
    try {
      return await memberMembershipRepo.getTrainingLogs(memberMembershipId);
    } catch (error) {
      console.error('Error getting training logs:', error);
      return [];
    }
  });

}