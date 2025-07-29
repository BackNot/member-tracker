/**
 * Membership Repository
 */
import BaseRepository from './BaseRepository.js';
import MemberMembership from '../models/MemberMembership.js';

console.log('Initializing MemberMembershipRepository...');

class MemberMembershipRepository extends BaseRepository {
  constructor() {
    console.log('MemberMembershipRepository constructor called, Member:', MemberMembership);
    super(MemberMembership);
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
}

// Create and export an instance of the repository
console.log('Creating MemberMembershipRepository instance...');
const repository = new MemberMembershipRepository();
console.log('MemberMembershipRepository instance created:', repository);
export default repository;