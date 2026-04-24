import mongoose from "mongoose";
import openGraphScraper from "open-graph-scraper";
import Event from "../models/event.model.js";
import Application from "../models/application.model.js";

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

  if (["active", "draft", "closed"].includes(query.status)) {
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
      reminderDays,
      isFeatured,
      postedBy: req.user.id,
      eligibility,
      requirements,
      benefits,
      status,
    });

    const populatedEvent = await populateEvent(Event.findById(event._id));

    return res.status(201).json({
      message: "Opportunity created successfully",
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

    const events = await populateEvent(
      Event.find(filters).sort({ [sortBy]: order, createdAt: -1 })
    );

    const eventIds = events.map((event) => event._id);
    const applicationCounts = await Application.aggregate([
      { $match: { event: { $in: eventIds } } },
      { $group: { _id: "$event", count: { $sum: 1 } } },
    ]);
    const countsById = Object.fromEntries(
      applicationCounts.map((count) => [String(count._id), count.count])
    );

    return res.status(200).json({
      message: "Opportunities retrieved successfully",
      total: events.length,
      events: events.map((event) => ({
        ...event.toObject(),
        applicationCount: countsById[String(event._id)] || 0,
      })),
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

    const applicantCount = await Application.countDocuments({ event: event._id });

    return res.status(200).json({
      message: "Opportunity retrieved successfully",
      event,
      applicantCount,
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
