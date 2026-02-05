/**
 * Membership Repository
 */
import BaseRepository from './BaseRepository.js';
import MemberMembership from '../models/MemberMembership.js';
import TrainingLog from '../models/TrainingLog.js';
import { Op } from 'sequelize';

console.log('Initializing MemberMembershipRepository...');

class MemberMembershipRepository extends BaseRepository {
  constructor() {
    console.log('MemberMembershipRepository constructor called, Member:', MemberMembership);
    super(MemberMembership);
  }

  async getLatestActiveMemberships(memberIds, options = {}) {
    console.log('getLatestActiveMemberships called with memberIds:', memberIds);

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return [];
    }

    // Remove the require statement - Op is now imported at the top
    const currentDate = new Date();
    
    // First, get the latest start date for each member (only for ACTIVE memberships)
    const latestDates = await this.model.findAll({
      attributes: [
        'memberId',
        [this.model.sequelize.fn('MAX', this.model.sequelize.col('start_date')), 'latestStartDate']
      ],
      where: {
        memberId: { [Op.in]: memberIds },
        deletedAt: null,
        startDate: { [Op.lte]: currentDate }, // Membership has started
        endDate: { [Op.gte]: currentDate }    // Membership hasn't ended (ACTIVE)
      },
      group: ['memberId'],
      raw: true
    });

    console.log('Latest dates found:', latestDates);

    if (latestDates.length === 0) {
      return [];
    }

    // Then get the actual memberships - FIXED VERSION
    const whereConditions = latestDates.map(item => ({
      memberId: item.memberId,
      startDate: item.latestStartDate,  // Exact match for the latest start date
      deletedAt: null,
      endDate: { [Op.gte]: currentDate }  // Still active (only endDate check needed here)
    }));

    const result = await this.model.findAll({
      where: {
        [Op.or]: whereConditions
      },
      ...options,
      raw: true, // Add this to return plain objects instead of Sequelize instances
      order: [['memberId', 'ASC']]
    });

    console.log('Final memberships result:', result);
    return result;
  }

  // Additional methods specific to Membership can be added here
  // For example, finding active members (not deleted)
  async findActive(options = {}) {
    const whereClause = options.where || {};
    whereClause.deletedAt = null;
    
    return this.findAll({
      ...options,
      where: whereClause
    });
  }

  // Soft delete a membership by setting the deletedAt field
  async softDelete(id) {
    return this.update(
      { deletedAt: new Date() },
      { where: { id } }
    );
  }

  // Restore a soft-deleted membership
  async restore(id) {
    return this.update(
      { deletedAt: null },
      { where: { id } }
    );
  }

  // Subtract one training from a member membership
  async subtractTraining(memberMembershipId) {
    const membership = await this.findById(memberMembershipId);

    if (!membership) {
      return { success: false, error: 'Member membership not found' };
    }

    if (membership.remainingTrainings === null) {
      return { success: true, message: 'Trainings not tracked for this membership' };
    }

    if (membership.remainingTrainings <= 0) {
      return { success: false, error: 'No trainings remaining' };
    }

    const newRemaining = membership.remainingTrainings - 1;
    await this.update(
      { remainingTrainings: newRemaining },
      { where: { id: memberMembershipId } }
    );

    // Create a training log entry for subtraction
    await TrainingLog.create({
      memberMembershipId: memberMembershipId,
      usedAt: new Date(),
      action: 'subtract'
    });

    return {
      success: true,
      remainingTrainings: newRemaining,
      totalTrainings: membership.totalTrainings
    };
  }

  // Add one training back to a member membership
  async addTraining(memberMembershipId) {
    const membership = await this.findById(memberMembershipId);

    if (!membership) {
      return { success: false, error: 'Member membership not found' };
    }

    if (membership.remainingTrainings === null || membership.totalTrainings === null) {
      return { success: false, error: 'Trainings not tracked for this membership' };
    }

    if (membership.remainingTrainings >= membership.totalTrainings) {
      return { success: false, error: 'Cannot exceed total trainings' };
    }

    const newRemaining = membership.remainingTrainings + 1;
    await this.update(
      { remainingTrainings: newRemaining },
      { where: { id: memberMembershipId } }
    );

    // Create a training log entry for addition
    await TrainingLog.create({
      memberMembershipId: memberMembershipId,
      usedAt: new Date(),
      action: 'add'
    });

    return {
      success: true,
      remainingTrainings: newRemaining,
      totalTrainings: membership.totalTrainings
    };
  }

  // Get expirations by month
  async getExpirationsByMonth(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    
    const result = await this.model.findAll({
      where: {
        endDate: {
          [Op.between]: [startDate, endDate]
        },
        deletedAt: null
      },
      include: [
        {
          model: this.model.sequelize.models.Member,
          as: 'member'
        }
      ],
      order: [['endDate', 'ASC']]
    });
    
    return result.map(item => item.toJSON());
  }

  // Get training logs for a member membership
  async getTrainingLogs(memberMembershipId) {
    const logs = await TrainingLog.findAll({
      where: {
        memberMembershipId: memberMembershipId
      },
      order: [['usedAt', 'DESC']]
    });

    return logs.map(log => log.toJSON());
  }
}

// Create and export an instance of the repository
console.log('Creating MemberMembershipRepository instance...');
const repository = new MemberMembershipRepository();
console.log('MemberMembershipRepository instance created:', repository);
export default repository;