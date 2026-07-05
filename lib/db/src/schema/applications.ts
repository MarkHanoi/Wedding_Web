import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// applications
//
// One row per submitted application. Written by POST /api/apply after both
// Claude calls complete (extraction + personalized ack).
//
// In-memory fallback in apply.ts is the authoritative store during the
// current server session. This table provides durable persistence for the
// admin dashboard (P2-F) and export workflows.
// ---------------------------------------------------------------------------
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey(),
  // P4-A: opaque token for the public applicant portal — separate from the
  // internal UUID so the application ID is never exposed. Stored here so
  // the token→application mapping survives server restarts when DATABASE_URL
  // is configured. Generated at submission time via randomUUID().
  statusToken: text("status_token").unique(),
  email: text("email").notNull(),
  visitorType: text("visitor_type").notNull().default("unknown"),
  portfolioUrl: text("portfolio_url"),
  gdprConsent: boolean("gdpr_consent").notNull(),
  gdprConsentAt: timestamp("gdpr_consent_at", { withTimezone: true }).notNull(),
  fitScore: integer("fit_score"),
  fitRationale: text("fit_rationale"),
  background: text("background"),
  motivations: text("motivations"),
  concernsExpressed: text("concerns_expressed"),
  recommendedFollowUpQuestion: text("recommended_follow_up_question"),
  personalizedAck: text("personalized_ack"),
  admissionsStatus: text("admissions_status", {
    enum: ["received", "reviewed", "accepted", "waitlisted", "declined"],
  })
    .notNull()
    .default("received"),
  status: text("status", {
    enum: ["processing", "complete", "error"],
  })
    .notNull()
    .default("processing"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  createdAt: true,
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

// ---------------------------------------------------------------------------
// application_messages
//
// Individual messages from both conversation phases (qualification +
// application interview), stored alongside the parent application record.
// The `phase` column distinguishes the two segments; role is user|assistant.
//
// This table enables the admin dashboard to replay the full conversation and
// for future fine-tuning pipelines to access structured transcripts.
// ---------------------------------------------------------------------------
export const applicationMessages = pgTable("application_messages", {
  id: serial("id").primaryKey(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  phase: text("phase", { enum: ["qualification", "application"] }).notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertApplicationMessageSchema = createInsertSchema(
  applicationMessages,
).omit({ id: true, createdAt: true });

export type ApplicationMessage = typeof applicationMessages.$inferSelect;
export type InsertApplicationMessage = z.infer<
  typeof insertApplicationMessageSchema
>;
