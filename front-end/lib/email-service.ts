import { Notification, NotificationType } from './types'

/**
 * Email/Notification Service
 * In a production environment, this would integrate with a service like SendGrid, Mailgun, or Supabase Email.
 * For now, we'll use console logging for demo purposes.
 */

interface EmailData {
  to: string
  subject: string
  body: string
  html?: string
}

/**
 * Send email notification
 * Production: Replace with actual email service integration
 */
export async function sendEmail(data: EmailData): Promise<void> {
  try {
    console.log('[EMAIL SERVICE] Sending email:', {
      to: data.to,
      subject: data.subject,
      timestamp: new Date().toISOString()
    })

    // In production, integrate with email service here
    // Example: await sendgrid.send({ to: data.to, subject: data.subject, html: data.html })

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (error) {
    console.error('[EMAIL SERVICE] Failed to send email:', error)
    throw error
  }
}

/**
 * Send deadline reminder email
 */
export async function sendDeadlineReminder(
  email: string,
  opportunityTitle: string,
  deadline: string,
  daysUntil: number
): Promise<void> {
  const subject = `Reminder: ${opportunityTitle} deadline in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`

  const body = `
Hi,

This is a friendly reminder that the deadline for "${opportunityTitle}" is coming up on ${new Date(deadline).toLocaleDateString()}.

Don't miss this opportunity! Submit your application now.

Best regards,
TrackIt Team
  `.trim()

  return sendEmail({
    to: email,
    subject,
    body
  })
}

/**
 * Send application status update email
 */
export async function sendStatusUpdateEmail(
  email: string,
  opportunityTitle: string,
  newStatus: string
): Promise<void> {
  const subject = `Application Status Update: ${opportunityTitle}`

  const body = `
Hi,

Your application status for "${opportunityTitle}" has been updated to: ${newStatus}

Log in to TrackIt to view more details.

Best regards,
TrackIt Team
  `.trim()

  return sendEmail({
    to: email,
    subject,
    body
  })
}

/**
 * Send opportunity verification email to student
 */
export async function sendVerificationNotificationEmail(
  email: string,
  opportunityTitle: string
): Promise<void> {
  const subject = `${opportunityTitle} has been verified`

  const body = `
Hi,

Good news! The opportunity "${opportunityTitle}" has been verified by an instructor, confirming it's legitimate and valuable.

Check it out now on TrackIt!

Best regards,
TrackIt Team
  `.trim()

  return sendEmail({
    to: email,
    subject,
    body
  })
}

/**
 * Format days until deadline
 * Returns a human-readable string
 */
export function formatDaysUntilDeadline(deadline: string): string {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Deadline passed'
  if (diffDays === 0) return 'Deadline today'
  if (diffDays === 1) return '1 day left'
  if (diffDays <= 7) return `${diffDays} days left`
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`
  return `${Math.ceil(diffDays / 30)} months left`
}

/**
 * Check if should send reminder
 * Returns true if reminder should be sent (7 days, 2 days, or 1 day before deadline)
 */
export function shouldSendReminder(deadline: string): boolean {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Send reminders at 7 days, 2 days, and 1 day before deadline
  return diffDays === 7 || diffDays === 2 || diffDays === 1
}

/**
 * Generate notification message
 */
export function generateNotificationMessage(
  type: NotificationType,
  data: Record<string, any>
): { title: string; message: string } {
  switch (type) {
    case 'deadline_reminder':
      return {
        title: `Deadline Reminder: ${data.opportunityTitle}`,
        message: `The deadline for "${data.opportunityTitle}" is coming up on ${new Date(data.deadline).toLocaleDateString()}.`
      }

    case 'status_update':
      return {
        title: `Application Status Updated`,
        message: `Your application for "${data.opportunityTitle}" is now ${data.newStatus}.`
      }

    case 'application_received':
      return {
        title: `Application Received`,
        message: `We received your application for "${data.opportunityTitle}". We'll review it and get back to you soon.`
      }

    case 'opportunity_verified':
      return {
        title: `Opportunity Verified`,
        message: `"${data.opportunityTitle}" has been verified by an instructor.`
      }

    default:
      return {
        title: 'Notification',
        message: 'You have a new notification.'
      }
  }
}
