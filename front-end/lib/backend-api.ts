import type {
  Application,
  ApplicationStatus,
  Notification,
  NotificationPreferences,
  Opportunity,
  OpportunityCategory,
  Profile,
  StudentStats,
  TeacherStats,
} from "@/lib/types"
import {
  clearAuthSession,
  getAuthToken,
  getStoredUser,
  setAuthSession,
} from "@/lib/backend-auth"

function normalizeApiBaseUrl(rawValue?: string) {
  if (!rawValue) {
    return null
  }

  const trimmed = rawValue.trim()
  if (!trimmed) {
    return null
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
  const withoutTrailingSlash = withProtocol.replace(/\/+$/, "")

  if (withoutTrailingSlash.endsWith("/api/v1")) {
    return withoutTrailingSlash
  }

  if (withoutTrailingSlash.endsWith("/api")) {
    return `${withoutTrailingSlash}/v1`
  }

  return `${withoutTrailingSlash}/api/v1`
}

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL)

if (!API_BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_URL. Set it in front-end/.env or your deployment environment.")
}

type BackendUser = {
  _id?: string
  id: string
  firstname: string
  lastname: string
  fullName?: string
  email: string
  role: "student" | "teacher" | "admin"
  age?: number
  institution?: string
  fieldOfStudy?: string
  bio?: string
  avatarUrl?: string
  createdAt?: string
  updatedAt?: string
}

type BackendEvent = {
  _id: string
  title: string
  description: string
  category: string
  provider?: string
  location?: string
  mode?: "online" | "onsite" | "hybrid"
  deadline: string
  link?: string
  status?: "draft" | "active" | "closed"
  viewsCount?: number
  createdAt: string
  updatedAt: string
  eligibility?: string
  requirements?: string
  benefits?: string
  postedBy?: BackendUser
  applicationCount?: number
}

type BackendApplication = {
  _id: string
  event: BackendEvent
  applicant: BackendUser
  status: string
  coverLetter?: string
  notes?: string
  submissionLink?: string
  submittedAt?: string
  createdAt: string
  updatedAt: string
}

type BackendSaved = {
  _id: string
  createdAt: string
  event: BackendEvent
}

type BackendNotification = {
  _id: string
  type: Notification["type"]
  title: string
  message: string
  event?: string
  readAt?: string | null
  createdAt: string
}

type ApiErrorPayload = {
  error?: string
  message?: string
}

type TeacherOverviewData = {
  profile: Profile
  opportunities: Opportunity[]
  applications: (Application & {
    opportunities: { title: string }
    profiles: { full_name: string; email: string }
  })[]
  stats: {
    totalOpportunities: number
    activeOpportunities: number
    totalApplications: number
    pendingReview: number
    totalViews: number
  }
}

type StudentOverviewData = {
  profile: Profile
  applications: (Application & { opportunities: Opportunity })[]
  recommended: Opportunity[]
  stats: {
    totalApplications: number
    pending: number
    accepted: number
    savedCount: number
  }
}

type OpportunitiesResponse = {
  opportunities: Opportunity[]
  savedIds: string[]
  appliedIds: string[]
}

export type OpportunityFormInput = {
  title: string
  description: string
  category: OpportunityCategory
  organization: string
  location?: string
  is_remote: boolean
  deadline: string
  eligibility?: string
  requirements?: string
  benefits?: string
  application_url?: string
  status: "draft" | "active"
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const apiPayload = payload as ApiErrorPayload
    return apiPayload.message || apiPayload.error || fallback
  }

  return fallback
}

async function apiRequest<T>(path: string, init: RequestInit = {}, token = getAuthToken()) {
  const headers = new Headers(init.headers)

  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    })
  } catch {
    throw new Error(
      `Unable to reach API (${API_BASE_URL}${path}). Check that the backend is running and NEXT_PUBLIC_API_URL is correct.`
    )
  }

  const payload = (await response.json().catch(() => null)) as T | ApiErrorPayload | null

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession()
    }

    throw new Error(getErrorMessage(payload, "Request failed"))
  }

  return payload as T
}

function normalizeCategory(category?: string): OpportunityCategory {
  const allowed = new Set<OpportunityCategory>([
    "scholarship",
    "internship",
    "job",
    "competition",
    "workshop",
    "grant",
    "fellowship",
    "other",
  ])

  if (category && allowed.has(category as OpportunityCategory)) {
    return category as OpportunityCategory
  }

  return "other"
}

function normalizeApplicationStatus(status: string): ApplicationStatus {
  switch (status) {
    case "accepted":
      return "accepted"
    case "rejected":
      return "rejected"
    case "withdrawn":
      return "withdrawn"
    case "under_review":
    case "reviewed":
      return "under_review"
    default:
      return "pending"
  }
}

function mapUserToProfile(user: BackendUser): Profile {
  const fullName = user.fullName || `${user.firstname} ${user.lastname}`.trim()

  return {
    id: user.id || user._id || "",
    email: user.email,
    name: fullName,
    full_name: fullName,
    role: user.role === "teacher" ? "teacher" : "student",
    institution: user.institution || "",
    field_of_study: user.fieldOfStudy || "",
    bio: user.bio || "",
    avatar_url: user.avatarUrl || "",
    created_at: user.createdAt ?? new Date().toISOString(),
    updated_at: user.updatedAt ?? new Date().toISOString(),
  }
}

function mapEventToOpportunity(event: BackendEvent): Opportunity {
  return {
    id: event._id,
    title: event.title,
    description: event.description,
    category: normalizeCategory(event.category),
    organization: event.provider || "TrackIt",
    location: event.location || "Remote",
    is_remote: event.mode === "online" || event.mode === "hybrid",
    deadline: event.deadline,
    eligibility: event.eligibility || "",
    requirements: event.requirements || "",
    benefits: event.benefits || "",
    application_url: event.link || "",
    posted_by: event.postedBy?.id || event.postedBy?._id,
    status: event.status || (new Date(event.deadline) < new Date() ? "closed" : "active"),
    views_count: event.viewsCount || 0,
    created_at: event.createdAt,
    updated_at: event.updatedAt,
    poster: event.postedBy ? mapUserToProfile(event.postedBy) : undefined,
  }
}

function mapApplicationToJoinedApplication(
  application: BackendApplication
): Application & { opportunities: Opportunity } {
  return {
    id: application._id,
    opportunity_id: application.event._id,
    student_id: application.applicant.id || application.applicant._id || "",
    status: normalizeApplicationStatus(application.status),
    cover_letter: application.coverLetter || "",
    notes: application.notes || "",
    submitted_at: application.submittedAt || application.createdAt,
    updated_at: application.updatedAt,
    opportunities: mapEventToOpportunity(application.event),
    opportunity: mapEventToOpportunity(application.event),
    student: mapUserToProfile(application.applicant),
  }
}

function mapNotification(notification: BackendNotification): Notification {
  return {
    id: notification._id,
    user_id: getStoredUser()?.id || "",
    type: notification.type,
    opportunity_id: notification.event,
    title: notification.title,
    message: notification.message,
    read_at: notification.readAt || undefined,
    created_at: notification.createdAt,
  }
}

function ensureAuthenticatedUser() {
  const user = getStoredUser()
  if (!user) {
    throw new Error("Your session has expired. Please sign in again.")
  }

  return user
}

export async function loginWithBackend(email: string, password: string) {
  const payload = await apiRequest<{
    token: string
    user: BackendUser
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, null)

  setAuthSession(payload.token, {
    id: payload.user.id,
    email: payload.user.email,
    role: payload.user.role === "teacher" ? "teacher" : "student",
  })

  return payload.user
}

export async function signUpWithBackend(input: {
  fullName: string
  email: string
  password: string
  role: "student" | "teacher"
  age?: number
  institution?: string
  fieldOfStudy?: string
}) {
  const nameParts = input.fullName.trim().split(/\s+/)
  const firstname = nameParts.shift() || input.fullName.trim()
  const lastname = nameParts.join(" ") || "User"

  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      firstname,
      lastname,
      email: input.email,
      password: input.password,
      role: input.role,
      age: input.role === "student" ? input.age : undefined,
      institution: input.institution,
      fieldOfStudy: input.fieldOfStudy,
    }),
  }, null)
}

export async function getCurrentUserProfile() {
  const payload = await apiRequest<{ user: BackendUser }>("/auth/me")
  return mapUserToProfile(payload.user)
}

export async function updateCurrentUserProfile(profile: Partial<Profile>) {
  const fullName = profile.full_name || profile.name || ""
  const [firstname, ...rest] = fullName.trim().split(/\s+/)

  const payload = await apiRequest<{ user: BackendUser }>("/user/profile", {
    method: "PATCH",
    body: JSON.stringify({
      firstname: firstname || undefined,
      lastname: rest.join(" ") || undefined,
      institution: profile.institution,
      fieldOfStudy: profile.field_of_study,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
    }),
  })

  return mapUserToProfile(payload.user)
}

export async function getHomePageData(category?: string) {
  const [eventsPayload, metrics] = await Promise.all([
    apiRequest<{ events: BackendEvent[] }>(
      `/event/events?status=active&order=desc${category && category !== "all" ? `&category=${category}` : ""}`,
      {},
      null
    ),
    apiRequest<{
      active_opportunities: number
      registered_users: number
      applications_submitted: number
      success_rate: number
    }>("/analytics/public", {}, null),
  ])

  return {
    opportunities: eventsPayload.events.map(mapEventToOpportunity),
    stats: metrics,
  }
}

export async function listPublicOpportunities(options?: {
  category?: string
  search?: string
  authAware?: boolean
}): Promise<OpportunitiesResponse> {
  const user = getStoredUser()
  const query = new URLSearchParams()
  query.set("status", "active")
  query.set("order", "desc")

  if (options?.category && options.category !== "all") {
    query.set("category", options.category)
  }

  if (options?.search) {
    query.set("q", options.search)
  }

  const eventsPayload = await apiRequest<{ events: BackendEvent[] }>(
    `/event/events?${query.toString()}`,
    {},
    options?.authAware ? getAuthToken() : null
  )

  let savedIds: string[] = []
  let appliedIds: string[] = []

  if (user) {
    if (user.role === "student") {
      const [savedPayload, applicationsPayload] = await Promise.all([
        apiRequest<{ saved: BackendSaved[] }>("/saved"),
        apiRequest<{ applications: BackendApplication[] }>("/application/applications?mine=true"),
      ])
      savedIds = savedPayload.saved.map((item) => item.event._id)
      appliedIds = applicationsPayload.applications.map((item) => item.event._id)
    } else {
      const savedPayload = await apiRequest<{ saved: BackendSaved[] }>("/saved").catch(() => ({
        saved: [],
      }))
      savedIds = savedPayload.saved.map((item) => item.event._id)
    }
  }

  return {
    opportunities: eventsPayload.events.map(mapEventToOpportunity),
    savedIds,
    appliedIds,
  }
}

export async function getOpportunityDetailData(opportunityId: string) {
  const payload = await apiRequest<{ event: BackendEvent }>(`/event/events/${opportunityId}`, {}, null)
  const opportunity = mapEventToOpportunity(payload.event)
  const poster = payload.event.postedBy ? mapUserToProfile(payload.event.postedBy) : null

  let userProfile: Profile | null = null
  let hasApplied = false
  let isSaved = false

  const user = getStoredUser()
  if (user) {
    userProfile = await getCurrentUserProfile().catch(() => null)

    if (user.role === "student") {
      const [savedPayload, applicationsPayload] = await Promise.all([
        apiRequest<{ saved: BackendSaved[] }>("/saved"),
        apiRequest<{ applications: BackendApplication[] }>(
          `/application/applications?mine=true&eventId=${opportunityId}`
        ),
      ])

      hasApplied = applicationsPayload.applications.length > 0
      isSaved = savedPayload.saved.some((item) => item.event._id === opportunityId)
    } else {
      const savedPayload = await apiRequest<{ saved: BackendSaved[] }>("/saved").catch(() => ({
        saved: [],
      }))
      isSaved = savedPayload.saved.some((item) => item.event._id === opportunityId)
    }
  }

  return {
    opportunity,
    poster,
    userProfile,
    hasApplied,
    isSaved,
  }
}

export async function incrementOpportunityView(opportunityId: string) {
  return apiRequest(`/event/events/${opportunityId}/view`, { method: "POST" }, null)
}

export async function saveOpportunity(opportunityId: string) {
  return apiRequest<{ saved: BackendSaved }>("/saved", {
    method: "POST",
    body: JSON.stringify({ eventId: opportunityId }),
  })
}

export async function unsaveOpportunity(opportunityId: string) {
  return apiRequest(`/saved/${opportunityId}`, { method: "DELETE" })
}

export async function createApplication(input: {
  opportunityId: string
  coverLetter?: string
}) {
  const payload = await apiRequest<{ application: BackendApplication }>("/application/applications", {
    method: "POST",
    body: JSON.stringify({
      eventId: input.opportunityId,
      coverLetter: input.coverLetter,
      status: "pending",
    }),
  })

  return mapApplicationToJoinedApplication(payload.application)
}

export async function updateApplication(applicationId: string, body: Record<string, unknown>) {
  const payload = await apiRequest<{ application: BackendApplication }>(
    `/application/applications/${applicationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  )

  return mapApplicationToJoinedApplication(payload.application)
}

export async function getStudentDashboardData(): Promise<StudentOverviewData> {
  const user = ensureAuthenticatedUser()
  if (user.role !== "student") {
    throw new Error("Student access required")
  }

  const [profile, applicationsPayload, savedPayload, opportunitiesPayload] = await Promise.all([
    getCurrentUserProfile(),
    apiRequest<{ applications: BackendApplication[] }>("/application/applications?mine=true"),
    apiRequest<{ saved: BackendSaved[] }>("/saved"),
    apiRequest<{ events: BackendEvent[] }>("/event/events?status=active&order=desc"),
  ])

  const applications = applicationsPayload.applications.map(mapApplicationToJoinedApplication)
  const savedIds = new Set(savedPayload.saved.map((item) => item.event._id))
  const recommended = opportunitiesPayload.events
    .filter((event) => !savedIds.has(event._id))
    .slice(0, 4)
    .map(mapEventToOpportunity)

  return {
    profile,
    applications: applications.map((application) => ({
      ...application,
      opportunities: application.opportunities,
    })),
    recommended,
    stats: {
      totalApplications: applications.length,
      pending: applications.filter((application) =>
        ["pending", "under_review"].includes(application.status)
      ).length,
      accepted: applications.filter((application) => application.status === "accepted").length,
      savedCount: savedPayload.saved.length,
    },
  }
}

export async function getStudentExploreData() {
  const user = ensureAuthenticatedUser()
  const [profile, opportunities] = await Promise.all([
    getCurrentUserProfile(),
    listPublicOpportunities({ authAware: true }),
  ])

  return {
    profile,
    opportunities,
    userId: user.id,
  }
}

export async function getStudentApplicationsData() {
  const [profile, payload] = await Promise.all([
    getCurrentUserProfile(),
    apiRequest<{ applications: BackendApplication[] }>("/application/applications?mine=true"),
  ])

  return {
    profile,
    applications: payload.applications.map(mapApplicationToJoinedApplication),
  }
}

export async function getStudentSavedData() {
  const [profile, payload] = await Promise.all([
    getCurrentUserProfile(),
    apiRequest<{ saved: BackendSaved[] }>("/saved"),
  ])

  return {
    profile,
    opportunities: payload.saved.map((item) => ({
      ...mapEventToOpportunity(item.event),
      saved_id: item._id,
    })),
  }
}

export async function getTeacherOverviewData(): Promise<TeacherOverviewData> {
  const storedUser = ensureAuthenticatedUser()
  if (storedUser.role !== "teacher") {
    throw new Error("Teacher access required")
  }

  const [profile, eventsPayload, applicationsPayload] = await Promise.all([
    getCurrentUserProfile(),
    apiRequest<{ events: BackendEvent[] }>("/event/events?mine=true&sortBy=createdAt&order=desc"),
    apiRequest<{ applications: BackendApplication[] }>("/application/applications?mine=true"),
  ])

  const opportunities = eventsPayload.events.map(mapEventToOpportunity)
  const applications = applicationsPayload.applications.map((application) => ({
    id: application._id,
    opportunity_id: application.event._id,
    student_id: application.applicant.id || application.applicant._id || "",
    status: normalizeApplicationStatus(application.status),
    cover_letter: application.coverLetter || "",
    notes: application.notes || "",
    submitted_at: application.submittedAt || application.createdAt,
    updated_at: application.updatedAt,
    opportunities: {
      title: application.event.title,
    },
    profiles: {
      full_name:
        application.applicant.fullName ||
        `${application.applicant.firstname} ${application.applicant.lastname}`.trim(),
      email: application.applicant.email,
    },
  }))

  return {
    profile,
    opportunities,
    applications,
    stats: {
      totalOpportunities: opportunities.length,
      activeOpportunities: opportunities.filter((opportunity) => opportunity.status === "active")
        .length,
      totalApplications: applications.length,
      pendingReview: applications.filter((application) =>
        ["pending", "under_review"].includes(application.status)
      ).length,
      totalViews: opportunities.reduce(
        (total, opportunity) => total + (opportunity.views_count || 0),
        0
      ),
    },
  }
}

export async function getTeacherOpportunitiesData() {
  const [profile, payload] = await Promise.all([
    getCurrentUserProfile(),
    apiRequest<{ events: BackendEvent[] }>("/event/events?mine=true&sortBy=createdAt&order=desc"),
  ])

  return {
    profile,
    opportunities: payload.events.map((event) => ({
      ...mapEventToOpportunity(event),
      application_count: event.applicationCount || 0,
    })),
  }
}

export async function createOpportunity(input: OpportunityFormInput) {
  const payload = await apiRequest<{ event: BackendEvent }>("/event/events", {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      category: input.category,
      organization: input.organization,
      provider: input.organization,
      location: input.location,
      mode: input.is_remote ? "online" : "onsite",
      deadline: new Date(input.deadline).toISOString(),
      eligibility: input.eligibility,
      requirements: input.requirements,
      benefits: input.benefits,
      application_url: input.application_url,
      status: input.status,
    }),
  })

  return mapEventToOpportunity(payload.event)
}

export async function updateOpportunity(opportunityId: string, input: OpportunityFormInput) {
  const payload = await apiRequest<{ event: BackendEvent }>(`/event/events/${opportunityId}`, {
    method: "PATCH",
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      category: input.category,
      organization: input.organization,
      provider: input.organization,
      location: input.location,
      mode: input.is_remote ? "online" : "onsite",
      deadline: new Date(input.deadline).toISOString(),
      eligibility: input.eligibility,
      requirements: input.requirements,
      benefits: input.benefits,
      application_url: input.application_url,
      status: input.status,
    }),
  })

  return mapEventToOpportunity(payload.event)
}

export async function getOpportunityForEdit(opportunityId: string) {
  const payload = await apiRequest<{ event: BackendEvent }>(`/event/events/${opportunityId}`)
  return mapEventToOpportunity(payload.event)
}

export async function patchOpportunity(opportunityId: string, body: Record<string, unknown>) {
  const payload = await apiRequest<{ event: BackendEvent }>(`/event/events/${opportunityId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })

  return mapEventToOpportunity(payload.event)
}

export async function deleteOpportunity(opportunityId: string) {
  return apiRequest(`/event/events/${opportunityId}`, { method: "DELETE" })
}

export async function getTeacherApplicationsData(filter?: string) {
  const [profile, eventsPayload, applicationsPayload] = await Promise.all([
    getCurrentUserProfile(),
    apiRequest<{ events: BackendEvent[] }>("/event/events?mine=true&sortBy=createdAt&order=desc"),
    apiRequest<{ applications: BackendApplication[] }>(
      `/application/applications?mine=true${filter && filter !== "all" ? `&eventId=${filter}` : ""}`
    ),
  ])

  return {
    profile,
    opportunities: eventsPayload.events.map((event) => ({
      id: event._id,
      title: event.title,
    })),
    applications: applicationsPayload.applications.map((application) => ({
      id: application._id,
      opportunity_id: application.event._id,
      student_id: application.applicant.id || application.applicant._id || "",
      status: normalizeApplicationStatus(application.status),
      cover_letter: application.coverLetter || "",
      notes: application.notes || "",
      submitted_at: application.submittedAt || application.createdAt,
      updated_at: application.updatedAt,
      opportunities: {
        id: application.event._id,
        title: application.event.title,
        category: normalizeCategory(application.event.category),
      },
      profiles: {
        id: application.applicant.id || application.applicant._id || "",
        full_name:
          application.applicant.fullName ||
          `${application.applicant.firstname} ${application.applicant.lastname}`.trim(),
        email: application.applicant.email,
        institution: application.applicant.institution || "",
        field_of_study: application.applicant.fieldOfStudy || "",
      },
    })),
  }
}

export async function getTeacherAnalyticsData() {
  const [profile, analytics, opportunitiesPayload] = await Promise.all([
    getCurrentUserProfile(),
    apiRequest<TeacherStats>("/analytics/teacher"),
    apiRequest<{ events: BackendEvent[] }>("/event/events?mine=true&sortBy=createdAt&order=desc"),
  ])

  const opportunities = opportunitiesPayload.events.map(mapEventToOpportunity)

  return {
    profile,
    opportunities,
    applicationStats: {
      total: analytics.total_applications_received,
      pending: analytics.applications_by_status.pending || 0,
      under_review: analytics.applications_by_status.under_review || 0,
      accepted: analytics.applications_by_status.accepted || 0,
      rejected: analytics.applications_by_status.rejected || 0,
      withdrawn: analytics.applications_by_status.withdrawn || 0,
    },
    totalViews: opportunities.reduce((sum, opportunity) => sum + opportunity.views_count, 0),
    raw: analytics,
  }
}

export async function getStudentAnalyticsData() {
  return apiRequest<StudentStats>("/analytics/student")
}

export async function getTeacherAnalyticsChartData() {
  return apiRequest<TeacherStats>("/analytics/teacher")
}

export async function getNotificationsData() {
  const payload = await apiRequest<{ notifications: BackendNotification[] }>("/notifications")
  return payload.notifications.map(mapNotification)
}

export async function markNotificationAsRead(notificationId: string) {
  return apiRequest(`/notifications/${notificationId}/read`, { method: "PATCH" })
}

export async function deleteNotification(notificationId: string) {
  return apiRequest(`/notifications/${notificationId}`, { method: "DELETE" })
}

export async function getNotificationPreferencesData() {
  const payload = await apiRequest<{ preferences: NotificationPreferences }>("/notifications/preferences")
  return payload.preferences
}

export async function updateNotificationPreferencesData(
  preferences: NotificationPreferences
) {
  const payload = await apiRequest<{ preferences: NotificationPreferences }>(
    "/notifications/preferences",
    {
      method: "PUT",
      body: JSON.stringify({
        deadlineReminders: preferences.deadline_reminders,
        statusUpdates: preferences.status_updates,
        marketing: preferences.marketing,
        reminderFrequency: preferences.reminder_frequency,
      }),
    }
  )

  return payload.preferences
}
