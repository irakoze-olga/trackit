import Application from "../models/application.model.js";
import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import { notifyUser } from "../services/notification.service.ts";

const populateApplication = (query) =>
  query
    .populate("event", "title category provider deadline link imageUrl audience")
    .populate("applicant", "firstname lastname email role institution fieldOfStudy");

const isTeacherOwner = async (teacherId, application) => {
  const event = await Event.findById(application.event).select("postedBy");
  return !!event && String(event.postedBy) === String(teacherId);
};

export const getAllApplications = async (req, res, next) => {
  try {
    const filters = {};

    if (req.user.role === "student") {
      filters.applicant = req.user.id;
    } else if (req.user.role === "teacher" && req.query.mine === "true") {
      const teacherEvents = await Event.find({ postedBy: req.user.id }).select("_id");
      filters.event = { $in: teacherEvents.map((event) => event._id) };
    } else if (req.query.studentId) {
      filters.applicant = req.query.studentId;
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.eventId || req.query.opportunityId) {
      filters.event = req.query.eventId || req.query.opportunityId;
    }

    const applications = await populateApplication(
      Application.find(filters).sort({ deadline: 1, createdAt: -1 })
    );

    return res.status(200).json({
      message: "Applications retrieved successfully",
      total: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req, res, next) => {
  try {
    const {
      event: eventId,
      eventId: alternateEventId,
      applicant,
      status,
      notes,
      submissionLink,
      coverLetter,
    } = req.body;

    const selectedEventId = eventId || alternateEventId;

    if (!selectedEventId) {
      return res.status(400).json({ message: "Opportunity is required" });
    }

    const event = await Event.findById(selectedEventId);

    if (!event) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    if (event.status !== "active" || event.approvalStatus !== "approved") {
      return res.status(403).json({ message: "This opportunity is waiting for admin approval" });
    }

    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can apply to opportunities" });
    }

    const applicantId = req.user.id;

    if (!applicantId) {
      return res.status(400).json({ message: "Applicant is required" });
    }

    const application = await Application.create({
      event: event._id,
      applicant: applicantId,
      status,
      notes,
      submissionLink,
      coverLetter,
      deadline: event.deadline,
    });

    const populatedApplication = await populateApplication(
      Application.findById(application._id)
    );

    if (String(event.postedBy) !== String(applicantId)) {
      const owner = await User.findById(event.postedBy).select("firstname lastname email slackUserId");
      if (owner) {
        await notifyUser(owner, {
          type: "application_received",
          title: "New application received",
          message: `A new application was submitted for "${event.title}".`,
          eventId: String(event._id),
        });
      }
    }

    return res.status(201).json({
      message: "Application created successfully",
      application: populatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const application = await populateApplication(Application.findById(req.params.id));

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (req.user.role === "student" && String(application.applicant._id) !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (req.user.role === "teacher" && !(await isTeacherOwner(req.user.id, application))) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json({
      message: "Application retrieved successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (req.user.role === "student" && String(application.applicant) !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (req.user.role === "teacher" && !(await isTeacherOwner(req.user.id, application))) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const allowedUpdates =
      req.user.role === "student"
        ? ["notes", "submissionLink", "reminderSent", "coverLetter"]
        : ["status", "notes", "submissionLink", "reminderSent", "deadline", "coverLetter"];

    const previousStatus = application.status;

    Object.entries(req.body).forEach(([key, value]) => {
      if (allowedUpdates.includes(key)) {
        application[key] = value;
      }
    });

    await application.save();

    const populatedApplication = await populateApplication(
      Application.findById(application._id)
    );

    if (
      req.user.role !== "student" &&
      req.body.status &&
      req.body.status !== previousStatus
    ) {
      const relatedEvent = await Event.findById(application.event).select("title");
      const applicantUser = await User.findById(application.applicant).select(
        "firstname lastname email slackUserId"
      );
      if (applicantUser) {
        await notifyUser(applicantUser, {
          type: "status_update",
          title: "Application status updated",
          message: `Your application for "${relatedEvent?.title || "this opportunity"}" is now ${String(req.body.status).replaceAll("_", " ")}.`,
          eventId: String(application.event),
        });
      }
    }

    return res.status(200).json({
      message: "Application updated successfully",
      application: populatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (req.user.role === "student" && String(application.applicant) !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (req.user.role === "teacher" && !(await isTeacherOwner(req.user.id, application))) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Application.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Application deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationSummary = async (req, res, next) => {
  try {
    const applicantId = req.user.role === "student" ? req.user.id : req.query.studentId;
    const filters = applicantId ? { applicant: applicantId } : {};

    const applications = await Application.find(filters);

    const summary = applications.reduce(
      (accumulator, application) => {
        accumulator.total += 1;
        accumulator.byStatus[application.status] =
          (accumulator.byStatus[application.status] || 0) + 1;

        if (application.deadline >= new Date()) {
          accumulator.upcoming += 1;
        }

        return accumulator;
      },
      {
        total: 0,
        upcoming: 0,
        byStatus: {},
      }
    );

    return res.status(200).json({
      message: "Application summary retrieved successfully",
      summary,
    });
  } catch (error) {
    next(error);
  }
};
