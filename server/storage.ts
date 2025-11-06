// Database storage implementation using PostgreSQL
import {
  users,
  userProfiles,
  feedback,
  pageInteractions,
  interactionEvents,
  feedbackTranscripts,
  tavakievSources,
  userReports,
  type User,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type Feedback,
  type InsertFeedback,
  type PageInteraction,
  type InsertPageInteraction,
  type InteractionEvent,
  type InsertInteractionEvent,
  type FeedbackTranscript,
  type InsertFeedbackTranscript,
  type TavakievSource,
  type InsertTavakievSource,
  type UserReport,
  type InsertUserReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  
  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getUserFeedback(userId: string): Promise<Feedback[]>;
  createFeedbackTranscript(transcript: InsertFeedbackTranscript): Promise<FeedbackTranscript>;
  getFeedbackTranscriptsByUser(userId: string): Promise<FeedbackTranscript[]>;
  getFeedbackTranscriptsByFeedback(feedbackId: string): Promise<FeedbackTranscript[]>;
  
  // Interaction tracking
  createInteraction(interaction: InsertPageInteraction): Promise<PageInteraction>;
  getUserInteractions(userId: string): Promise<PageInteraction[]>;
  createInteractionEvent(event: InsertInteractionEvent): Promise<InteractionEvent>;
  createInteractionEvents(events: InsertInteractionEvent[]): Promise<InteractionEvent[]>;
  getUserInteractionEvents(userId: string): Promise<InteractionEvent[]>;
  
  // Reports
  createReport(report: InsertUserReport): Promise<UserReport>;
  getUserReports(userId: string): Promise<UserReport[]>;
  getLatestReport(userId: string): Promise<UserReport | undefined>;
  updateReportEmailStatus(reportId: string, sent: boolean): Promise<void>;

  // Knowledge sources
  getTavakievSources(): Promise<TavakievSource[]>;
  getTavakievSourceBySlug(slug: string): Promise<TavakievSource | undefined>;
  upsertTavakievSources(sources: InsertTavakievSource[]): Promise<TavakievSource[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations - Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    return profile;
  }

  async upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const existing = await this.getUserProfile(profile.userId);

    if (existing) {
      const [record] = await db
        .update(userProfiles)
        .set({
          ...profile,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, profile.userId))
        .returning();
      return record;
    }

    const [created] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return created;
  }

  // Feedback operations
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();
    return newFeedback;
  }

  async getUserFeedback(userId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(desc(feedback.createdAt));
  }

  async createFeedbackTranscript(
    transcriptData: InsertFeedbackTranscript,
  ): Promise<FeedbackTranscript> {
    const [transcript] = await db
      .insert(feedbackTranscripts)
      .values(transcriptData)
      .returning();
    return transcript;
  }

  async getFeedbackTranscriptsByUser(userId: string): Promise<FeedbackTranscript[]> {
    return await db
      .select()
      .from(feedbackTranscripts)
      .where(eq(feedbackTranscripts.userId, userId))
      .orderBy(desc(feedbackTranscripts.createdAt));
  }

  async getFeedbackTranscriptsByFeedback(
    feedbackId: string,
  ): Promise<FeedbackTranscript[]> {
    return await db
      .select()
      .from(feedbackTranscripts)
      .where(eq(feedbackTranscripts.feedbackId, feedbackId))
      .orderBy(desc(feedbackTranscripts.createdAt));
  }

  // Interaction tracking
  async createInteraction(interactionData: InsertPageInteraction): Promise<PageInteraction> {
    const [interaction] = await db
      .insert(pageInteractions)
      .values(interactionData)
      .returning();
    return interaction;
  }

  async getUserInteractions(userId: string): Promise<PageInteraction[]> {
    return await db
      .select()
      .from(pageInteractions)
      .where(eq(pageInteractions.userId, userId))
      .orderBy(desc(pageInteractions.createdAt));
  }

  async createInteractionEvent(
    eventData: InsertInteractionEvent,
  ): Promise<InteractionEvent> {
    const [event] = await db
      .insert(interactionEvents)
      .values(eventData)
      .returning();
    return event;
  }

  async createInteractionEvents(
    events: InsertInteractionEvent[],
  ): Promise<InteractionEvent[]> {
    if (events.length === 0) return [];

    const inserted = await db
      .insert(interactionEvents)
      .values(events)
      .returning();

    return inserted;
  }

  async getUserInteractionEvents(userId: string): Promise<InteractionEvent[]> {
    return await db
      .select()
      .from(interactionEvents)
      .where(eq(interactionEvents.userId, userId))
      .orderBy(desc(interactionEvents.createdAt));
  }

  // Reports
  async createReport(reportData: InsertUserReport): Promise<UserReport> {
    const [report] = await db
      .insert(userReports)
      .values(reportData)
      .returning();
    return report;
  }

  async getUserReports(userId: string): Promise<UserReport[]> {
    return await db
      .select()
      .from(userReports)
      .where(eq(userReports.userId, userId))
      .orderBy(desc(userReports.createdAt));
  }

  async getLatestReport(userId: string): Promise<UserReport | undefined> {
    const [report] = await db
      .select()
      .from(userReports)
      .where(eq(userReports.userId, userId))
      .orderBy(desc(userReports.createdAt))
      .limit(1);
    return report;
  }

  async updateReportEmailStatus(reportId: string, sent: boolean): Promise<void> {
    await db
      .update(userReports)
      .set({
        emailSent: sent,
        emailSentAt: sent ? new Date() : null,
      })
      .where(eq(userReports.id, reportId));
  }

  // Knowledge sources
  async getTavakievSources(): Promise<TavakievSource[]> {
    return await db
      .select()
      .from(tavakievSources)
      .orderBy(desc(tavakievSources.updatedAt));
  }

  async getTavakievSourceBySlug(
    slug: string,
  ): Promise<TavakievSource | undefined> {
    const [source] = await db
      .select()
      .from(tavakievSources)
      .where(eq(tavakievSources.slug, slug))
      .limit(1);

    return source;
  }

  async upsertTavakievSources(
    sources: InsertTavakievSource[],
  ): Promise<TavakievSource[]> {
    if (sources.length === 0) return [];

    const results = await Promise.all(
      sources.map(async (source) => {
        const [record] = await db
          .insert(tavakievSources)
          .values(source)
          .onConflictDoUpdate({
            target: tavakievSources.slug,
            set: {
              heading: source.heading,
              summary: source.summary,
              body: source.body,
              citation: source.citation,
              data: source.data,
              updatedAt: new Date(),
            },
          })
          .returning();

        return record;
      }),
    );

    return results;
  }
}

export const storage = new DatabaseStorage();
