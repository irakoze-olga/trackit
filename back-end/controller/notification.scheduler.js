import cron from 'node-cron';
import notificationService from '../services/notification.service.js';

class NotificationScheduler {
  constructor() {
    this.initializeSchedulers();
  }

  initializeSchedulers() {
    // Run deadline reminders every day at 9 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('🔔 Running daily deadline reminder check...');
      await notificationService.notifyDeadlineReminders();
    }, {
      timezone: 'Africa/Kigali'
    });

    // Run weekly digest every Monday at 8 AM
    cron.schedule('0 8 * * 1', async () => {
      console.log('📧 Running weekly opportunity digest...');
      await notificationService.notifyWeeklyOpportunities();
    }, {
      timezone: 'Africa/Kigali'
    });

    // Run urgent deadline check every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      console.log('⚡ Running urgent deadline check...');
      await notificationService.notifyDeadlineReminders();
    }, {
      timezone: 'Africa/Kigali'
    });

    console.log('✅ Notification scheduler initialized');
    console.log('📅 Daily deadline reminders: 9:00 AM');
    console.log('📅 Weekly digest: Monday 8:00 AM');
    console.log('📅 Urgent checks: Every 6 hours');
  }

  async sendTestNotifications() {
    console.log('🧪 Sending test notifications...');
    
    // Test deadline reminder
    await notificationService.notifyDeadlineReminders();
    
    // Test weekly digest
    await notificationService.notifyWeeklyOpportunities();
    
    console.log('✅ Test notifications sent');
  }
}

export default new NotificationScheduler();
