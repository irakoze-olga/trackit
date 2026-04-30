import { z } from "zod";

const eventIdParams = z.object({
  id: z.string().min(1),
});

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    deadline: z.union([z.string().min(1), z.date()]),
    link: z.string().url().optional(),
    application_url: z.string().url().optional(),
    applicationUrl: z.string().url().optional(),
    category: z.string().optional(),
    provider: z.string().optional(),
    organization: z.string().optional(),
    audience: z.string().optional(),
    mode: z.string().optional(),
    location: z.string().optional(),
    startDate: z.union([z.string(), z.date()]).optional(),
    endDate: z.union([z.string(), z.date()]).optional(),
    tags: z.array(z.string()).optional(),
    imageUrl: z.string().url().optional(),
    reminderDays: z.array(z.number().int().min(0).max(365)).optional(),
    isFeatured: z.boolean().optional(),
    eligibility: z.string().optional(),
    requirements: z.string().optional(),
    benefits: z.string().optional(),
    status: z.enum(["draft", "active"]).optional(),
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

export const updateEventSchema = z.object({
  body: z
    .object({
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      deadline: z.union([z.string().min(1), z.date()]).optional(),
      link: z.string().url().optional(),
      application_url: z.string().url().optional(),
      applicationUrl: z.string().url().optional(),
      category: z.string().optional(),
      provider: z.string().optional(),
      organization: z.string().optional(),
      audience: z.string().optional(),
      mode: z.string().optional(),
      location: z.string().optional(),
      startDate: z.union([z.string(), z.date()]).optional(),
      endDate: z.union([z.string(), z.date()]).optional(),
      tags: z.array(z.string()).optional(),
      imageUrl: z.string().url().optional(),
      reminderDays: z.array(z.number().int().min(0).max(365)).optional(),
      isFeatured: z.boolean().optional(),
      eligibility: z.string().optional(),
      requirements: z.string().optional(),
      benefits: z.string().optional(),
      status: z.enum(["draft", "pending_approval", "active", "closed", "rejected"]).optional(),
      approvalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
      reason: z.string().optional(),
      interested: z.boolean().optional(),
      rating: z.number().min(0).max(5).optional(),
    })
    .strict()
    .partial(),
  params: eventIdParams,
  query: z.object({}).passthrough(),
});

export const approveRejectParamsSchema = z.object({
  body: z.object({ reason: z.string().optional() }).passthrough(),
  params: eventIdParams,
  query: z.object({}).passthrough(),
});

export const engagementSchema = z.object({
  body: z.object({
    interested: z.boolean().optional(),
    rating: z.number().min(1).max(5).optional(),
  }),
  params: eventIdParams,
  query: z.object({}).passthrough(),
});

