import type { JobType, Status } from "./validation";

export type Application = {
  id: string;
  companyName: string;
  jobTitle: string;
  jobType: JobType;
  status: Status;
  appliedDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
