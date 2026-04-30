import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    ip: {
      type: String,
      trim: true,
      default: "",
    },
    userAgent: {
      type: String,
      trim: true,
      default: "",
    },
    lastActive: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

sessionSchema.index({ userId: 1, ip: 1, userAgent: 1 }, { unique: true });

const Session = mongoose.model("session", sessionSchema);

export default Session;

