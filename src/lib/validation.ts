import { z } from "zod";

export const JOB_TYPES = ["INTERNSHIP", "FULL_TIME", "PART_TIME"] as const;
export const STATUSES = ["APPLIED", "INTERVIEWING", "OFFER", "REJECTED"] as const;

export const jobTypeSchema = z.enum(JOB_TYPES);
export const statusSchema = z.enum(STATUSES);

export type JobType = (typeof JOB_TYPES)[number];
export type Status = (typeof STATUSES)[number];

const dateString = z
  .string()
  .min(1, "Applied date is required")
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid date" });

export const createApplicationSchema = z.object({
  companyName: z.string().trim().min(2, "Company name must be at least 2 characters"),
  jobTitle: z.string().trim().min(1, "Job title is required"),
  jobType: jobTypeSchema,
  status: statusSchema,
  appliedDate: dateString,
  notes: z
    .string()
    .trim()
    .max(5000, "Notes must be 5000 characters or fewer")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const listQuerySchema = z.object({
  status: statusSchema.optional(),
  search: z.string().trim().min(1).optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
