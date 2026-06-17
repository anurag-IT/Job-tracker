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
  APPLIED:      "bg-blue-500 text-white ring-blue-400",
  INTERVIEWING: "bg-amber-400 text-amber-950 ring-amber-300",
  OFFER:        "bg-emerald-500 text-white ring-emerald-400",
  REJECTED:     "bg-red-500 text-white ring-red-400",
};
