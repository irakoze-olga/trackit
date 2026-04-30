import { z } from "zod";

export const createApplicationSchema = z.object({
  body: z.object({
    eventId: z.string().min(1).optional(),
    event: z.string().min(1).optional(),
    status: z.string().optional(),
    notes: z.string().optional(),
    submissionLink: z.string().url().optional(),
    coverLetter: z.string().optional(),
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

export const updateApplicationSchema = z.object({
  body: z
    .object({
      status: z.string().optional(),
      notes: z.string().optional(),
      submissionLink: z.string().url().optional(),
      reminderSent: z.boolean().optional(),
      deadline: z.union([z.string(), z.date()]).optional(),
      coverLetter: z.string().optional(),
    })
    .partial(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).passthrough(),
});

