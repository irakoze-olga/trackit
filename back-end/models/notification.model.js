import mongoose from "mongoose";

const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    deadlineReminders: {
      type: Boolean,
      default: true,
    },
    statusUpdates: {
      type: Boolean,
      default: true,
    },
    marketing: {
      type: Boolean,
      default: false,
    },
    reminderFrequency: {
      type: String,
      enum: ["daily", "weekly", "never"],
      default: "weekly",
    },
  },
  {
    timestamps: true,
  }
);

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
<<<<<<< HEAD
      enum: ["deadline_reminder", "status_update", "application_received", "opportunity_verified"],
=======
      enum: ["deadline_reminder", "status_update", "application_received", "opportunity_verified", "opportunity_posted", "security_alert"],
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event",
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export const NotificationPreference = mongoose.model(
  "notification_preference",
  notificationPreferenceSchema
);

const Notification = mongoose.model("notification", notificationSchema);

export default Notification;
