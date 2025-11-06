import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Additional fields for Physical.Capital
  profession: text("profession"),
  expertise: text("expertise"),
  company: text("company"),
  investmentInterests: text("investment_interests").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  biography: text("biography"),
  investmentGoals: text("investment_goals").array(),
  preferredInvestmentRange: text("preferred_investment_range"),
  expertiseTags: text("expertise_tags").array(),
  riskAppetite: text("risk_appetite"),
  personaSegments: text("persona_segments").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feedback entries from users on specific projects
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: text("project_id").notNull(), // e.g., "tavakiev", "tabeguache", "venustas", "yadiłhił"
  feedbackText: text("feedback_text").notNull(),
  expertise: text("expertise"), // What expertise user mentioned they have
  createdAt: timestamp("created_at").defaultNow(),
});

// Page interaction tracking
export const pageInteractions = pgTable("page_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  pagePath: text("page_path").notNull(),
  sectionId: text("section_id"), // e.g., "hero", "project-tavakiev", "innovation-golden-spike"
  interactionType: text("interaction_type").notNull(), // "visit", "scroll", "click", "expand", "3d-interact"
  duration: integer("duration"), // Time spent in seconds
  metadata: jsonb("metadata"), // Additional context like scroll depth, clicked element, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const interactionEvents = pgTable("interaction_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventType: text("event_type").notNull(),
  context: text("context"),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedbackTranscripts = pgTable("feedback_transcripts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  feedbackId: varchar("feedback_id").references(() => feedback.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: text("project_id").notNull(),
  transcript: text("transcript").notNull(),
  audioUrl: text("audio_url"),
  confidence: integer("confidence"),
  language: text("language").default('en'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tavakievSources = pgTable("tavakiev_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug").notNull(),
  heading: text("heading").notNull(),
  summary: text("summary"),
  body: text("body"),
  citation: text("citation"),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Generated personalized reports for users
export const userReports = pgTable("user_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  reportContent: text("report_content").notNull(), // AI-generated markdown report
  recommendedProjects: text("recommended_projects").array(),
  insights: jsonb("insights"), // Structured insights about user engagement
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  feedback: many(feedback),
  interactions: many(pageInteractions),
  interactionEvents: many(interactionEvents),
  reports: many(userReports),
  profiles: many(userProfiles),
  transcripts: many(feedbackTranscripts),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
}));

export const pageInteractionsRelations = relations(pageInteractions, ({ one }) => ({
  user: one(users, {
    fields: [pageInteractions.userId],
    references: [users.id],
  }),
}));

export const interactionEventsRelations = relations(interactionEvents, ({ one }) => ({
  user: one(users, {
    fields: [interactionEvents.userId],
    references: [users.id],
  }),
}));

export const userReportsRelations = relations(userReports, ({ one }) => ({
  user: one(users, {
    fields: [userReports.userId],
    references: [users.id],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const feedbackTranscriptsRelations = relations(feedbackTranscripts, ({ one }) => ({
  user: one(users, {
    fields: [feedbackTranscripts.userId],
    references: [users.id],
  }),
  feedback: one(feedback, {
    fields: [feedbackTranscripts.feedbackId],
    references: [feedback.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const insertPageInteractionSchema = createInsertSchema(pageInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertInteractionEventSchema = createInsertSchema(interactionEvents).omit({
  id: true,
  createdAt: true,
});

export const insertUserReportSchema = createInsertSchema(userReports).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackTranscriptSchema = createInsertSchema(feedbackTranscripts).omit({
  id: true,
  createdAt: true,
});

export const insertTavakievSourceSchema = createInsertSchema(tavakievSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type PageInteraction = typeof pageInteractions.$inferSelect;
export type InsertPageInteraction = z.infer<typeof insertPageInteractionSchema>;
export type InteractionEvent = typeof interactionEvents.$inferSelect;
export type InsertInteractionEvent = z.infer<typeof insertInteractionEventSchema>;

export type UserReport = typeof userReports.$inferSelect;
export type InsertUserReport = z.infer<typeof insertUserReportSchema>;

export type FeedbackTranscript = typeof feedbackTranscripts.$inferSelect;
export type InsertFeedbackTranscript = z.infer<typeof insertFeedbackTranscriptSchema>;

export type TavakievSource = typeof tavakievSources.$inferSelect;
export type InsertTavakievSource = z.infer<typeof insertTavakievSourceSchema>;
