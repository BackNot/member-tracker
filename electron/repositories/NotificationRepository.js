/**
 * Notification Repository
 */
import BaseRepository from './BaseRepository.js';
import Notification from '../models/Notification.js';

console.log('Initializing NotificationRepository...');

class NotificationRepository extends BaseRepository {
  constructor() {
    console.log('NotificationRepository constructor called, Notification:', Notification);
    super(Notification);
  }

  // Additional methods specific to Notification can be added here
  // For example, finding active notifications (not deleted)
  async findActive(options = {}) {
    const whereClause = options.where || {};
    whereClause.deletedAt = null;
    
    return this.findAll({
      ...options,
      where: whereClause
    });
  }

  // Find unread notifications
  async findUnread(options = {}) {
    const whereClause = options.where || {};
    whereClause.isRead = false;
    whereClause.deletedAt = null;
    
    return this.findAll({
      ...options,
      where: whereClause
    });
  }

  // Mark notification as read
  async markAsRead(id) {
    return this.update(
      { isRead: true },
      { where: { id } }
    );
  }

  // Mark all notifications as read for a specific member membership
  async markAllAsRead(memberMembershipId = null) {
    const whereClause = { isRead: false, deletedAt: null };
    if (memberMembershipId) {
      whereClause.memberMembershipId = memberMembershipId;
    }
    
    return this.update(
      { isRead: true },
      { where: whereClause }
    );
  }

  // Find notifications by member membership
  async findByMemberMembership(memberMembershipId, options = {}) {
    const whereClause = options.where || {};
    whereClause.memberMembershipId = memberMembershipId;
    whereClause.deletedAt = null;
    
    return this.findAll({
      ...options,
      where: whereClause
    });
  }

  // Soft delete a notification by setting the deletedAt field
  async softDelete(id) {
    return this.update(
      { deletedAt: new Date() },
      { where: { id } }
    );
  }

  // Restore a soft-deleted notification
  async restore(id) {
    return this.update(
      { deletedAt: null },
      { where: { id } }
    );
  }
}

// Create and export an instance of the repository
console.log('Creating NotificationRepository instance...');
const repository = new NotificationRepository();
console.log('NotificationRepository instance created:', repository);
export default repository;