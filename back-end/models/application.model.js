import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event",
      required: [true, "Opportunity is required"],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Applicant is required"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "under_review",
        "saved",
        "interested",
        "in_progress",
        "submitted",
        "reviewed",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      default: "pending",
    },
    coverLetter: {
      type: String,
      trim: true,
      default: "",
      maxlength: [3000, "Cover letter cannot exceed 3000 characters"],
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    submissionLink: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
      default: "",
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    lastReminderAt: {
      type: Date,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ applicant: 1, event: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, status: 1, deadline: 1 });

applicationSchema.pre("validate", function setSubmittedAt() {
  if ((this.status === "submitted" || this.status === "pending") && !this.submittedAt) {
    this.submittedAt = new Date();
  }

  if (this.status !== "submitted" && this.status !== "pending" && this.isModified("status")) {
    this.submittedAt = this.submittedAt || undefined;
  }

  this.lastActivityAt = new Date();
});

const Application = mongoose.model("application", applicationSchema);

export default Application;
