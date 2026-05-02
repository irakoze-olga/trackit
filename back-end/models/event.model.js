import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [600, "Description cannot exceed 600 characters"],
    },
    provider: {
      type: String,
      trim: true,
      default: "External opportunity",
    },
    eligibility: {
      type: String,
      trim: true,
      default: "",
    },
    requirements: {
      type: String,
      trim: true,
      default: "",
    },
    benefits: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "scholarship",
        "internship",
        "competition",
        "fellowship",
        "job",
        "conference",
        "workshop",
        "grant",
        "bootcamp",
        "other",
      ],
      default: "other",
    },
    audience: {
      type: String,
      enum: ["students", "teachers", "all"],
      default: "students",
    },
    age: {
      type: String,
      enum: ["18 and above", "18 and under", "all ages"],
      default: "all ages",
    },
    mode: {
      type: String,
      enum: ["online", "onsite", "hybrid"],
      default: "online",
    },
    location: {
      type: String,
      trim: true,
      default: "Remote",
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    reminderDays: {
      type: [Number],
      default: [7, 3, 1],
    },
    tags: {
      type: [String],
      default: [],
    },
    link: {
      type: String,
      required: [true, "Opportunity link is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "active",
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/dsgj2kl7r/image/upload/f_auto,q_auto/96cabaa4-9b9c-4738-8728-f80d4872675d_g97jr2",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Posted by is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.index({ deadline: 1, category: 1, audience: 1 });
eventSchema.index({ title: "text", description: "text", provider: "text", tags: "text" });

eventSchema.virtual("deadlineStatus").get(function deadlineStatus() {
  const now = new Date();
  const diffInDays = Math.ceil((this.deadline - now) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return "closed";
  }

  if (diffInDays <= 3) {
    return "closing-soon";
  }

  return "open";
});

eventSchema.pre("validate", function validateEvent() {
  if (this.deadline && this.deadline < new Date() && !this.isModified("status")) {
    throw new Error("Deadline cannot be in the past");
  }

  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    throw new Error("End date cannot be before start date");
  }

  if (this.startDate && this.deadline && this.startDate > this.deadline) {
    throw new Error("Start date cannot be after the deadline");
  }

  this.tags = [...new Set((this.tags || []).map((tag) => String(tag).trim()).filter(Boolean))];

  if (this.status !== "draft" && this.deadline && this.deadline < new Date()) {
    this.status = "closed";
  }
});

const Event = mongoose.model("event", eventSchema);

export default Event;
