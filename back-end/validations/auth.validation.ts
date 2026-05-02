import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

export const teacherInviteRegistrationSchema = z.object({
  body: z.object({
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    institution: z.string().optional(),
    bio: z.string().optional(),
    avatarUrl: z.string().url().optional(),
    inviteToken: z.string().min(1),
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

