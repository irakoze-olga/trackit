import Notification from "../models/notification.model.js";
import Application from "../models/application.model.js";
import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import { sendOpportunityNotificationEmail } from "../controller/email.controller.js";

class NotificationService {
  async notifyNewOpportunity(event) {
    try {
      // Get all users who should be notified about new opportunities
      const users = await User.find({
        $or: [
          { role: "student" },
          { "notificationPreferences.marketing": true }
        ]
      });

      const notifications = users.map(user => ({
        user: user._id,
        type: "new_opportunity",
        title: `New ${event.category} Opportunity: ${event.title}`,
        message: `${event.provider} is offering a ${event.category}. ${event.description.substring(0, 100)}...`,
        event: event._id,
        category: event.category,
        deadline: event.deadline
      }));

      await Notification.insertMany(notifications);

      // Send email notifications to users
      for (const user of users) {
        try {
          await sendOpportunityNotificationEmail(
            user.email,
            user.firstname,
            event,
            'new_opportunity'
          );
        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
        }
      }

      console.log(`✅ Notified ${users.length} users about new opportunity: ${event.title}`);
    } catch (error) {
      console.error("❌ Failed to notify users about new opportunity:", error);
    }
  }

  async notifyDeadlineReminders() {
    try {
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find opportunities with deadlines in 3 days or 1 day
      const upcomingDeadlines = await Event.find({
        deadline: {
          $gte: now,
          $lte: threeDaysFromNow
        },
        status: "active"
      });

      for (const opportunity of upcomingDeadlines) {
        const daysUntilDeadline = Math.ceil((opportunity.deadline - now) / (1000 * 60 * 60 * 24));

        // Get users who have saved or applied to this opportunity
        const applications = await Application.find({
          event: opportunity._id
        }).populate('applicant');

        const notifiedUsers = new Set();

        // Notify applicants
        applications.forEach(app => {
          if (app.applicant && !notifiedUsers.has(app.applicant._id.toString())) {
            notifiedUsers.add(app.applicant._id.toString());
            this.createDeadlineNotification(app.applicant._id, opportunity, daysUntilDeadline);
          }
        });

        // Also notify all students about high-priority deadlines (1 day or less)
        if (daysUntilDeadline <= 1) {
          const allStudents = await User.find({ role: "student" });
          allStudents.forEach(student => {
            if (!notifiedUsers.has(student._id.toString())) {
              this.createDeadlineNotification(student._id, opportunity, daysUntilDeadline, true);
            }
          });
        }
      }

      console.log(`✅ Processed deadline reminders for ${upcomingDeadlines.length} opportunities`);
    } catch (error) {
      console.error("❌ Failed to process deadline reminders:", error);
    }
  }

  async createDeadlineNotification(userId, opportunity, daysUntilDeadline, isUrgent = false) {
    const timeText = daysUntilDeadline === 0 ? "today" :
      daysUntilDeadline === 1 ? "tomorrow" :
        `in ${daysUntilDeadline} days`;

    const urgencyPrefix = isUrgent ? "URGENT: " : "";

    const notification = await Notification.create({
      user: userId,
      type: "deadline_reminder",
      title: `${urgencyPrefix}Deadline ${timeText}: ${opportunity.title}`,
      message: `The ${opportunity.category} opportunity from ${opportunity.provider} has a deadline ${timeText}. Don't miss out!`,
      event: opportunity._id,
      category: opportunity.category,
      deadline: opportunity.deadline,
      priority: daysUntilDeadline <= 1 ? "high" : "medium"
    });

    // Send email notification for deadline reminder
    try {
      const user = await User.findById(userId);
      if (user) {
        await sendOpportunityNotificationEmail(
          user.email,
          user.firstname,
          opportunity,
          'deadline_reminder'
        );
      }
    } catch (emailError) {
      console.error(`Failed to send deadline reminder email:`, emailError);
    }
  }

  async notifyApplicationStatusUpdate(application, newStatus) {
    try {
      const statusMessages = {
        "submitted": "Your application has been submitted successfully",
        "under_review": "Your application is under review",
        "accepted": "Congratulations! Your application has been accepted",
        "rejected": "Your application was not successful",
        "shortlisted": "You have been shortlisted for this opportunity"
      };

      const message = statusMessages[newStatus] || `Your application status has been updated to: ${newStatus}`;

      await Notification.create({
        user: application.applicant,
        type: "application_update",
        title: `Application Update: ${application.event?.title || "Opportunity"}`,
        message: message,
        event: application.event,
        application: application._id,
        priority: newStatus === "accepted" ? "high" : "medium"
      });

      console.log(`✅ Notified user about application status update: ${newStatus}`);
    } catch (error) {
      console.error("❌ Failed to notify about application status update:", error);
    }
  }

  async notifyWeeklyOpportunities() {
    try {
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Get new opportunities from the past week
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const newOpportunities = await Event.find({
        createdAt: { $gte: oneWeekAgo },
        status: "active"
      }).sort({ createdAt: -1 }).limit(10);

      if (newOpportunities.length === 0) return;

      // Get all students
      const students = await User.find({ role: "student" });

      for (const student of students) {
        const opportunityList = newOpportunities.map(opp =>
          `• ${opp.title} (${opp.category})`
        ).join('\n');

        await Notification.create({
          user: student._id,
          type: "weekly_digest",
          title: "Weekly Opportunity Digest",
          message: `Here are the top ${newOpportunities.length} opportunities from this week:\n\n${opportunityList}`,
          priority: "low"
        });
      }

      console.log(`✅ Sent weekly digest to ${students.length} students with ${newOpportunities.length} opportunities`);
    } catch (error) {
      console.error("❌ Failed to send weekly digest:", error);
    }
  }

  async createCustomNotification(userId, title, message, type = "general", priority = "medium") {
    try {
      await Notification.create({
        user: userId,
        type,
        title,
        message,
        priority
      });
      console.log(`✅ Created custom notification for user ${userId}`);
    } catch (error) {
      console.error("❌ Failed to create custom notification:", error);
    }
  }
}

export default new NotificationService();
