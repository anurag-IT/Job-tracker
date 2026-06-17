import { describe, expect, it } from "vitest";
import {
  createApplicationSchema,
  updateApplicationSchema,
  listQuerySchema,
} from "./validation";

describe("createApplicationSchema", () => {
  const valid = {
    companyName: "Acme",
    jobTitle: "Software Engineer Intern",
    jobType: "INTERNSHIP",
    status: "APPLIED",
    appliedDate: "2026-06-01",
    notes: "Referred by Alice.",
  };

  it("accepts a valid payload", () => {
    const result = createApplicationSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("trims whitespace from companyName and jobTitle", () => {
    const result = createApplicationSchema.parse({
      ...valid,
      companyName: "  Acme  ",
      jobTitle: "  Engineer  ",
    });
    expect(result.companyName).toBe("Acme");
    expect(result.jobTitle).toBe("Engineer");
  });

  it("treats empty notes as undefined", () => {
    const result = createApplicationSchema.parse({ ...valid, notes: "" });
    expect(result.notes).toBeUndefined();
  });

  it("rejects companyName shorter than 2 characters", () => {
    const result = createApplicationSchema.safeParse({ ...valid, companyName: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.companyName?.[0]).toMatch(/2 characters/i);
    }
  });

  it("rejects empty jobTitle", () => {
    const result = createApplicationSchema.safeParse({ ...valid, jobTitle: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid jobType", () => {
    const result = createApplicationSchema.safeParse({ ...valid, jobType: "CONTRACT" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = createApplicationSchema.safeParse({ ...valid, status: "PENDING" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid appliedDate", () => {
    const result = createApplicationSchema.safeParse({ ...valid, appliedDate: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("rejects missing appliedDate", () => {
    const result = createApplicationSchema.safeParse({ ...valid, appliedDate: "" });
    expect(result.success).toBe(false);
  });
});

describe("updateApplicationSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    expect(updateApplicationSchema.safeParse({}).success).toBe(true);
  });

  it("accepts a single field update", () => {
    const result = updateApplicationSchema.safeParse({ status: "OFFER" });
    expect(result.success).toBe(true);
  });

  it("still validates provided fields", () => {
    const result = updateApplicationSchema.safeParse({ companyName: "A" });
    expect(result.success).toBe(false);
  });
});

describe("listQuerySchema", () => {
  it("accepts empty query", () => {
    expect(listQuerySchema.safeParse({}).success).toBe(true);
  });

  it("accepts a valid status", () => {
    expect(listQuerySchema.safeParse({ status: "REJECTED" }).success).toBe(true);
  });

  it("rejects unknown status", () => {
    expect(listQuerySchema.safeParse({ status: "GHOSTED" }).success).toBe(false);
  });
});
