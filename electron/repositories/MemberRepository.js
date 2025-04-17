/**
 * Member Repository
 */
import BaseRepository from './BaseRepository.js';
import Member from '../models/Member.js';

console.log('Initializing MemberRepository...');

class MemberRepository extends BaseRepository {
  constructor() {
    console.log('MemberRepository constructor called, Member:', Member);
    super(Member);
  }

  // Additional methods specific to Member can be added here
  // For example, finding active members (not deleted)
  async findActive(options = {}) {
    const whereClause = options.where || {};
    whereClause.deletedAt = null;
    
    return this.findAll({
      ...options,
      where: whereClause
    });
  }

  // Soft delete a member by setting the deletedAt field
  async softDelete(id) {
    return this.update(
      { deletedAt: new Date() },
      { where: { id } }
    );
  }

  // Restore a soft-deleted member
  async restore(id) {
    return this.update(
      { deletedAt: null },
      { where: { id } }
    );
  }
}

// Create and export an instance of the repository
console.log('Creating MemberRepository instance...');
const repository = new MemberRepository();
console.log('MemberRepository instance created:', repository);
export default repository;