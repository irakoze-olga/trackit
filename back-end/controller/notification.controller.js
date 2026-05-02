import Notification, { NotificationPreference } from "../models/notification.model.js";

const mapPreference = (preference) => ({
  id: preference._id,
  user_id: preference.user,
  deadline_reminders: preference.deadlineReminders,
  status_updates: preference.statusUpdates,
  marketing: preference.marketing,
  reminder_frequency: preference.reminderFrequency,
  created_at: preference.createdAt,
  updated_at: preference.updatedAt,
});

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      message: "Notifications retrieved successfully",
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { userId, type, title, message, eventId, opportunityId } = req.body || {};

    if (!userId || !type || !title || !message) {
      return res.status(400).json({ message: "Missing required notification fields" });
    }

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      event: eventId || opportunityId,
    });

    return res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationPreferences = async (req, res, next) => {
  try {
    let preferences = await NotificationPreference.findOne({ user: req.user.id });

    if (!preferences) {
      preferences = await NotificationPreference.create({ user: req.user.id });
    }

    return res.status(200).json({
      message: "Notification preferences retrieved successfully",
      preferences: mapPreference(preferences),
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationPreferences = async (req, res, next) => {
  try {
    const preferences = await NotificationPreference.findOneAndUpdate(
      { user: req.user.id },
      {
        deadlineReminders: req.body.deadlineReminders,
        statusUpdates: req.body.statusUpdates,
        marketing: req.body.marketing,
        reminderFrequency: req.body.reminderFrequency,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: "Notification preferences updated successfully",
      preferences: mapPreference(preferences),
    });
  } catch (error) {
    next(error);
  }
};
