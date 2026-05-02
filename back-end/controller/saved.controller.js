import Event from "../models/event.model.js";
import SavedOpportunity from "../models/savedOpportunity.model.js";

const populateSaved = (query) =>
  query
    .populate("event", "title description provider category location mode deadline link status viewsCount eligibility requirements benefits createdAt updatedAt")
    .populate("user", "firstname lastname email role");

export const getSavedOpportunities = async (req, res, next) => {
  try {
    const savedItems = await populateSaved(
      SavedOpportunity.find({ user: req.user.id }).sort({ createdAt: -1 })
    );

    return res.status(200).json({
      message: "Saved opportunities retrieved successfully",
      total: savedItems.length,
      saved: savedItems,
    });
  } catch (error) {
    next(error);
  }
};

export const saveOpportunity = async (req, res, next) => {
  try {
    const eventId = req.body.eventId || req.body.opportunityId;

    if (!eventId) {
      return res.status(400).json({ message: "Opportunity is required" });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    const saved = await SavedOpportunity.findOneAndUpdate(
      { user: req.user.id, event: event._id },
      { user: req.user.id, event: event._id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const populatedSaved = await populateSaved(SavedOpportunity.findById(saved._id));

    return res.status(201).json({
      message: "Opportunity saved successfully",
      saved: populatedSaved,
    });
  } catch (error) {
    next(error);
  }
};

export const removeSavedOpportunity = async (req, res, next) => {
  try {
    const saved = await SavedOpportunity.findOneAndDelete({
      user: req.user.id,
      event: req.params.eventId,
    });

    if (!saved) {
      return res.status(404).json({ message: "Saved opportunity not found" });
    }

    return res.status(200).json({
      message: "Saved opportunity removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
