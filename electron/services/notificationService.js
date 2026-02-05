import { Op } from 'sequelize';
import MemberMembership from '../models/MemberMembership.js';
import Notification from '../models/Notification.js';
import Member from '../models/Member.js';

export class NotificationService {
  /**
   * Check for expired member memberships and create notifications for them
   * if they don't already have a notification
   */
  static async checkExpiredMembershipsAndCreateNotifications() {
    try {
      console.log('Checking for expired member memberships...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
      
      // Find all expired member memberships that are not soft deleted
      // A membership is expired if:
      // - Time-based: endDate < today
      // - Training-based: endDate < today OR remainingTrainings === 0
      const expiredMemberships = await MemberMembership.findAll({
        where: {
          deletedAt: null, // Not soft deleted
          [Op.or]: [
            // Time-based expiration (endDate passed)
            {
              endDate: {
                [Op.lt]: today
              }
            },
            // Training-based expiration (trainings depleted)
            {
              remainingTrainings: 0,
              totalTrainings: {
                [Op.not]: null
              }
            }
          ]
        },
        include: [
          {
            model: Notification,
            as: 'notification',
            required: false // LEFT JOIN - include memberships even without notifications
          },
          {
            model: Member,
            as: 'member',
            required: true
          }
        ]
      });

      console.log(`Found ${expiredMemberships.length} expired memberships`);

      let notificationsCreated = 0;

      for (const membership of expiredMemberships) {
        // Check if this membership already has a notification
        if (!membership.notification) {
          // Create notification message with member's name
          const firstName = membership.member.firstName;
          const lastName = membership.member.lastName;

          // Determine expiration reason
          const isTrainingDepleted = membership.remainingTrainings === 0 && membership.totalTrainings !== null;
          const message = isTrainingDepleted
            ? `Изчерпани тренировки за ${firstName} ${lastName}`
            : `Изтекло членство за ${firstName} ${lastName}`;
          
          // Create notification for expired membership
          await Notification.create({
            message: message,
            isRead: false,
            memberMembershipId: membership.id
          });
          notificationsCreated++;
          console.log(`Created notification for expired membership ID: ${membership.id} - ${firstName} ${lastName}`);
        }
      }

      console.log(`Created ${notificationsCreated} new notifications for expired memberships`);
      return { 
        totalExpired: expiredMemberships.length, 
        notificationsCreated 
      };
      
    } catch (error) {
      console.error('Error checking expired memberships:', error);
      throw error;
    }
  }
}