import mongoose from "mongoose";
import openGraphScraper from "open-graph-scraper";
import Event from "../models/event.model.js";
import Application from "../models/application.model.js";
<<<<<<< HEAD
import notificationService from "../services/notification.service.js";
=======
import User from "../models/user.model.js";
import OpportunityEngagement from "../models/opportunityEngagement.model.js";
import Notification from "../models/notification.model.js";
import { notifyUser } from "../services/notification.service.ts";
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183

const defaultImageUrl =
  "https://res.cloudinary.com/dsgj2kl7r/image/upload/f_auto,q_auto/96cabaa4-9b9c-4738-8728-f80d4872675d_g97jr2";

const buildEventFilters = (query) => {
  const filters = {};

  if (query.category) {
    filters.category = query.category;
  }

  if (query.postedBy) {
    filters.postedBy = query.postedBy;
  }

  if (query.audience) {
    filters.audience = query.audience;
  }

  if (query.age) {
    filters.age = query.age;
  }

  if (query.mode) {
    filters.mode = query.mode;
  }

  if (query.featured !== undefined) {
    filters.isFeatured = query.featured === "true";
  }

  if (query.status === "open") {
    const future = filters.deadline || {};
    future.$gte = future.$gte || new Date();
    filters.deadline = future;
  }

<<<<<<< HEAD
  if (["active", "draft", "closed"].includes(query.status)) {
=======
  if (["active", "draft", "closed", "pending_approval", "rejected"].includes(query.status)) {
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
    filters.status = query.status;
  }

  if (query.status === "closing-soon") {
    const now = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    filters.deadline = {
      ...(filters.deadline || {}),
      $gte: now,
      $lte: soon,
    };
  }

  if (query.status === "closed") {
    filters.deadline = {
      ...(filters.deadline || {}),
      $lt: new Date(),
    };
  }

  if (query.q) {
    filters.$text = { $search: query.q };
  }

  const dateFilters = {};

  if (query.from) {
    dateFilters.$gte = new Date(query.from);
  }

  if (query.to) {
    dateFilters.$lte = new Date(query.to);
  }

  if (Object.keys(dateFilters).length) {
    filters.deadline = dateFilters;
  }

  return filters;
};

const sanitizeText = (value, maxLength) =>
  String(value || "")
    .replace(/\n/g, ". ")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const scrapeOpportunityDetails = async (link) => {
  try {
    const data = await openGraphScraper({
      url: link,
      fetchOptions: {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
    });

    if (data.error) {
      return {};
    }

    return {
      title: sanitizeText(data.result.ogTitle, 120),
      description: sanitizeText(data.result.ogDescription, 300),
      imageUrl: data.result.ogImage?.[0]?.url || defaultImageUrl,
<<<<<<< HEAD
=======
      previewTitle: sanitizeText(data.result.ogTitle, 120),
      previewDescription: sanitizeText(data.result.ogDescription, 300),
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
    };
  } catch (error) {
    return {};
  }
};

const populateEvent = (query) =>
  query.populate("postedBy", "firstname lastname email role");

const ensureEventAccess = (event, user) =>
  user?.role === "admin" || String(event.postedBy?._id || event.postedBy) === String(user?.id);

export const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      deadline,
      age,
      link,
      category,
      provider,
      organization,
      audience,
      mode,
      location,
      startDate,
      endDate,
      tags,
      imageUrl,
      reminderDays,
      isFeatured,
      eligibility,
      requirements,
      benefits,
      application_url,
      applicationUrl,
      status,
    } = req.body || {};

    if (!deadline) {
      return res.status(400).json({ message: "Deadline is required" });
    }

    const externalLink = link || application_url || applicationUrl || "https://trackit.app/opportunity";
    const scrapedDetails =
      !title || !description || !imageUrl ? await scrapeOpportunityDetails(externalLink) : {};

<<<<<<< HEAD
=======
    const isAdmin = req.user.role === "admin";
    const desiredStatus = status === "draft" ? "draft" : isAdmin ? "active" : "pending_approval";
    const approvalStatus = desiredStatus === "active" ? "approved" : desiredStatus === "draft" ? "pending" : "pending";

>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
    const event = await Event.create({
      title: title || scrapedDetails.title || "Untitled opportunity",
      description:
        description ||
        scrapedDetails.description ||
        "A new opportunity has been shared on TrackIt.",
      deadline,
      age,
      link: externalLink,
      category,
      provider: provider || organization,
      audience,
      mode,
      location,
      startDate,
      endDate,
      tags,
      imageUrl: imageUrl || scrapedDetails.imageUrl || defaultImageUrl,
<<<<<<< HEAD
=======
      previewTitle: scrapedDetails.previewTitle,
      previewDescription: scrapedDetails.previewDescription,
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
      reminderDays,
      isFeatured,
      postedBy: req.user.id,
      eligibility,
      requirements,
      benefits,
<<<<<<< HEAD
      status,
=======
      status: desiredStatus,
      approvalStatus,
      approvedBy: desiredStatus === "active" ? req.user.id : null,
      approvedAt: desiredStatus === "active" ? new Date() : null,
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
    });

    const populatedEvent = await populateEvent(Event.findById(event._id));

<<<<<<< HEAD
    // Notify users about the new opportunity
    if (status === "active") {
      await notificationService.notifyNewOpportunity(event);
    }

    return res.status(201).json({
      message: "Opportunity created successfully",
=======
    return res.status(201).json({
      message:
        desiredStatus === "active"
          ? "Opportunity created successfully"
          : "Opportunity submitted for admin approval",
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
      event: populatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const filters = buildEventFilters(req.query);
    const sortBy = req.query.sortBy || "deadline";
    const order = req.query.order === "desc" ? -1 : 1;

    if (req.query.mine === "true" && req.user?.id) {
      filters.postedBy = req.user.id;
    }

<<<<<<< HEAD
    const events = await populateEvent(
=======
    if ((!req.user || req.user.role !== "admin") && req.query.mine !== "true") {
      filters.approvalStatus = "approved";
    }

    let events = await populateEvent(
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
      Event.find(filters).sort({ [sortBy]: order, createdAt: -1 })
    );

    const eventIds = events.map((event) => event._id);
<<<<<<< HEAD
    const applicationCounts = await Application.aggregate([
      { $match: { event: { $in: eventIds } } },
      { $group: { _id: "$event", count: { $sum: 1 } } },
=======
    const [applicationCounts, engagementCounts] = await Promise.all([
      Application.aggregate([
      { $match: { event: { $in: eventIds } } },
      { $group: { _id: "$event", count: { $sum: 1 } } },
      ]),
      OpportunityEngagement.aggregate([
        { $match: { event: { $in: eventIds } } },
        {
          $group: {
            _id: "$event",
            interestedCount: { $sum: { $cond: ["$interested", 1, 0] } },
            ratingCount: { $sum: { $cond: [{ $gt: ["$rating", 0] }, 1, 0] } },
            averageRating: { $avg: "$rating" },
          },
        },
      ]),
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
    ]);
    const countsById = Object.fromEntries(
      applicationCounts.map((count) => [String(count._id), count.count])
    );
<<<<<<< HEAD
=======
    const engagementById = Object.fromEntries(
      engagementCounts.map((count) => [String(count._id), count])
    );

    const mappedEvents = events.map((event) => {
      const engagement = engagementById[String(event._id)] || {};
      const applicationCount = countsById[String(event._id)] || 0;
      return {
        ...event.toObject(),
        applicationCount,
        interestedCount: engagement.interestedCount || 0,
        ratingCount: engagement.ratingCount || 0,
        averageRating: Number((engagement.averageRating || 0).toFixed(1)),
        popularityScore:
          applicationCount * 3 +
          (engagement.interestedCount || 0) * 2 +
          (engagement.averageRating || 0),
      };
    });

    if (req.query.sortBy === "popular") {
      mappedEvents.sort((a, b) => b.popularityScore - a.popularityScore);
    }
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183

    return res.status(200).json({
      message: "Opportunities retrieved successfully",
      total: events.length,
<<<<<<< HEAD
      events: events.map((event) => ({
        ...event.toObject(),
        applicationCount: countsById[String(event._id)] || 0,
      })),
=======
      events: mappedEvents,
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await populateEvent(Event.findById(req.params.id));

    if (!event) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

<<<<<<< HEAD
    const applicantCount = await Application.countDocuments({ event: event._id });
=======
    const [applicantCount, engagement] = await Promise.all([
      Application.countDocuments({ event: event._id }),
      OpportunityEngagement.aggregate([
        { $match: { event: event._id } },
        {
          $group: {
            _id: "$event",
            interestedCount: { $sum: { $cond: ["$interested", 1, 0] } },
            ratingCount: { $sum: { $cond: [{ $gt: ["$rating", 0] }, 1, 0] } },
            averageRating: { $avg: "$rating" },
          },
        },
      ]),
    ]);
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183

    return res.status(200).json({
      message: "Opportunity retrieved successfully",
      event,
      applicantCount,
<<<<<<< HEAD
=======
      engagement: engagement[0] || { interestedCount: 0, ratingCount: 0, averageRating: 0 },
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
    });
  } catch (error) {
    next(error);
  }
};

export const getEventsByAge = async (req, res, next) => {
  try {
    const events = await populateEvent(
      Event.find({ age: req.params.age }).sort({ deadline: 1 })
    );

    return res.status(200).json({
      message: "Age-filtered opportunities retrieved successfully",
      total: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEventById = async (req, res, next) => {
  try {
    const existingEvent = await Event.findById(req.params.id);

    if (!existingEvent) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    if (!ensureEventAccess(existingEvent, req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatePayload = {
      ...req.body,
      provider: req.body.provider || req.body.organization,
      link:
        req.body.link ||
        req.body.application_url ||
        req.body.applicationUrl ||
        existingEvent.link,
    };

<<<<<<< HEAD
=======
    if (req.user.role !== "admin" && req.body.status === "active") {
      updatePayload.status = "pending_approval";
      updatePayload.approvalStatus = "pending";
    }

>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
    const event = await Event.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    }).populate("postedBy", "firstname lastname email role");

    if (req.body.deadline) {
      await Application.updateMany(
        { event: event._id, status: { $in: ["saved", "interested", "in_progress"] } },
        { $set: { deadline: event.deadline } }
      );
    }

    return res.status(200).json({
      message: "Opportunity updated successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

<<<<<<< HEAD
=======
export const approveEventById = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: "active",
        approvalStatus: "approved",
        approvedBy: req.user.id,
        approvedAt: new Date(),
        rejectionReason: "",
      },
      { new: true, runValidators: true }
    ).populate("postedBy", "firstname lastname email role");

    if (!event) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    const students = await User.find({ role: "student", isActive: true }).select(
      "firstname email slackUserId"
    );
    await Promise.all(
      students.map(async (student) => {
        await notifyUser(student, {
          type: "opportunity_posted",
          title: "New opportunity approved",
          message: `"${event.title}" is now available on RCA TrackIt.`,
          eventId: String(event._id),
        });
      })
    );

    return res.status(200).json({ message: "Opportunity approved successfully", event });
  } catch (error) {
    next(error);
  }
};

export const rejectEventById = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        approvalStatus: "rejected",
        rejectionReason: req.body?.reason || "Rejected by admin",
      },
      { new: true, runValidators: true }
    ).populate("postedBy", "firstname lastname email role");

    if (!event) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    return res.status(200).json({ message: "Opportunity rejected", event });
  } catch (error) {
    next(error);
  }
};

export const upsertEventEngagement = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can rate or mark interest" });
    }

    const event = await Event.findOne({
      _id: req.params.id,
      approvalStatus: "approved",
      status: "active",
    });

    if (!event) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    const update = {};
    if (typeof req.body.interested === "boolean") update.interested = req.body.interested;
    if (req.body.rating !== undefined) update.rating = Number(req.body.rating);

    const engagement = await OpportunityEngagement.findOneAndUpdate(
      { event: event._id, user: req.user.id },
      { $set: update },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: "Opportunity engagement saved",
      engagement,
    });
  } catch (error) {
    next(error);
  }
};

>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
export const deleteEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    if (!ensureEventAccess(event, req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Event.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ event: event._id });

    return res.status(200).json({
      message: "Opportunity deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const incrementEventViews = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    return res.status(200).json({
      message: "Opportunity view tracked successfully",
      viewsCount: event.viewsCount,
    });
  } catch (error) {
    next(error);
  }
};

export const getCalendarSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    const [totalOpen, closingSoon, thisMonth, featured] = await Promise.all([
      Event.countDocuments({ deadline: { $gte: now } }),
      Event.countDocuments({ deadline: { $gte: now, $lte: nextWeek } }),
      Event.countDocuments({ deadline: { $gte: now, $lte: nextMonth } }),
      Event.countDocuments({ deadline: { $gte: now }, isFeatured: true }),
    ]);

    let myApplications = 0;
    let mySubmitted = 0;

    if (req.user?.role === "student" && mongoose.Types.ObjectId.isValid(req.user.id)) {
      [myApplications, mySubmitted] = await Promise.all([
        Application.countDocuments({ applicant: req.user.id }),
        Application.countDocuments({
          applicant: req.user.id,
          status: "submitted",
        }),
      ]);
    }

    return res.status(200).json({
      message: "Calendar summary retrieved successfully",
      summary: {
        totalOpen,
        closingSoon,
        thisMonth,
        featured,
        myApplications,
        mySubmitted,
      },
    });
  } catch (error) {
    next(error);
  }
};
