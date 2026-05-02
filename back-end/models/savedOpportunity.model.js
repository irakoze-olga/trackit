import mongoose from "mongoose";

const savedOpportunitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

savedOpportunitySchema.index({ user: 1, event: 1 }, { unique: true });

const SavedOpportunity = mongoose.model("saved_opportunity", savedOpportunitySchema);

export default SavedOpportunity;
