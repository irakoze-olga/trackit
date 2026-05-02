import mongoose from "mongoose";

const opportunityEngagementSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    interested: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    lastReminderAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

opportunityEngagementSchema.index({ user: 1, event: 1 }, { unique: true });
opportunityEngagementSchema.index({ event: 1, interested: 1, rating: 1 });

const OpportunityEngagement = mongoose.model(
  "opportunity_engagement",
  opportunityEngagementSchema
);

export default OpportunityEngagement;
