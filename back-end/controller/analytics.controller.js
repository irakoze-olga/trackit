import Application from "../models/application.model.js";
import Event from "../models/event.model.js";
import User from "../models/user.model.js";

const emptyCategoryCounts = {
  scholarship: 0,
  internship: 0,
  job: 0,
  competition: 0,
  workshop: 0,
  grant: 0,
  fellowship: 0,
  other: 0,
};

const normalizeCategory = (category) => {
  if (Object.hasOwn(emptyCategoryCounts, category)) {
    return category;
  }

  return "other";
};

const normalizeApplicationStatus = (status) => {
  switch (status) {
    case "accepted":
      return "accepted";
    case "rejected":
    case "withdrawn":
      return "rejected";
    case "reviewed":
    case "under_review":
      return "under_review";
    default:
      return "pending";
  }
};

export const getStudentAnalytics = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate("event", "title category")
      .sort({ submittedAt: 1, createdAt: 1 });

    const stats = {
      user_id: req.user.id,
      total_applications: applications.length,
      accepted_count: 0,
      rejected_count: 0,
      pending_count: 0,
      success_rate: 0,
      applications_by_category: { ...emptyCategoryCounts },
      applications_over_time: [],
    };

    const timeGroups = new Map();

    applications.forEach((application) => {
      const normalizedStatus = normalizeApplicationStatus(application.status);

      if (normalizedStatus === "accepted") stats.accepted_count += 1;
      if (normalizedStatus === "rejected") stats.rejected_count += 1;
      if (normalizedStatus === "pending" || normalizedStatus === "under_review") {
        stats.pending_count += 1;
      }

      const category = normalizeCategory(application.event?.category);
      stats.applications_by_category[category] += 1;

      const sourceDate = application.submittedAt || application.createdAt;
      const monthKey = new Date(sourceDate).toISOString().slice(0, 7);
      timeGroups.set(monthKey, (timeGroups.get(monthKey) || 0) + 1);
    });

    stats.success_rate =
      stats.total_applications > 0
        ? Math.round((stats.accepted_count / stats.total_applications) * 100)
        : 0;

    stats.applications_over_time = Array.from(timeGroups.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

export const getTeacherAnalytics = async (req, res, next) => {
  try {
    const events = await Event.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    const eventIds = events.map((event) => event._id);
    const applications = eventIds.length
      ? await Application.find({ event: { $in: eventIds } }).populate("event", "title")
      : [];

    const applicationsByStatus = {
      pending: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
    };

    const applicationCounts = new Map();

    applications.forEach((application) => {
      const status = normalizeApplicationStatus(application.status);
      applicationsByStatus[status] += 1;

      const eventId = String(application.event?._id || application.event);
      const current = applicationCounts.get(eventId) || {
        id: eventId,
        title: application.event?.title || "Untitled opportunity",
        application_count: 0,
      };
      current.application_count += 1;
      applicationCounts.set(eventId, current);
    });

    const totalViews = events.reduce((sum, event) => sum + (event.viewsCount || 0), 0);
    const avgApplications = events.length ? applications.length / events.length : 0;
    const avgViews = events.length ? totalViews / events.length : 0;
    const engagementScore = Math.min(
      10,
      Number(((avgApplications / 5) * 6 + (avgViews / 100) * 4).toFixed(1))
    );

    return res.status(200).json({
      user_id: req.user.id,
      opportunities_created: events.length,
      total_applications_received: applications.length,
      applications_by_status: applicationsByStatus,
      most_popular_opportunities: Array.from(applicationCounts.values())
        .sort((a, b) => b.application_count - a.application_count)
        .slice(0, 5),
      student_engagement_score: engagementScore,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicMetrics = async (req, res, next) => {
  try {
    const now = new Date();
    const [activeOpportunities, registeredUsers, applications, acceptedApplications] =
      await Promise.all([
<<<<<<< HEAD
        Event.countDocuments({ status: "active", deadline: { $gte: now } }),
        User.countDocuments({ role: { $ne: "admin" } }),
=======
        Event.countDocuments({ status: "active", approvalStatus: "approved", deadline: { $gte: now } }),
        User.countDocuments({ role: "student", isActive: true }),
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
        Application.countDocuments(),
        Application.countDocuments({ status: "accepted" }),
      ]);

    return res.status(200).json({
      active_opportunities: activeOpportunities,
      registered_users: registeredUsers,
      applications_submitted: applications,
      success_rate: applications ? Math.round((acceptedApplications / applications) * 100) : 0,
    });
  } catch (error) {
    next(error);
  }
<<<<<<< HEAD
};
=======
};
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
