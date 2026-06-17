import type { JobType, Status } from "./validation";

export const STATUS_LABEL: Record<Status, string> = {
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

export const JOB_TYPE_LABEL: Record<JobType, string> = {
  INTERNSHIP: "Internship",
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
};

export const STATUS_BADGE: Record<Status, string> = {
  APPLIED: "bg-blue-100 text-blue-800 ring-blue-200",
  INTERVIEWING: "bg-amber-100 text-amber-800 ring-amber-200",
  OFFER: "bg-green-100 text-green-800 ring-green-200",
  REJECTED: "bg-red-100 text-red-800 ring-red-200",
};
