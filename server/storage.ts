// Database storage implementation using PostgreSQL
import {
  users,
  feedback,
  pageInteractions,
  userReports,
  type User,
  type UpsertUser,
  type Feedback,
  type InsertFeedback,
  type PageInteraction,
  type InsertPageInteraction,
  type UserReport,
  type InsertUserReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getUserFeedback(userId: string): Promise<Feedback[]>;
  
  // Interaction tracking
  createInteraction(interaction: InsertPageInteraction): Promise<PageInteraction>;
  getUserInteractions(userId: string): Promise<PageInteraction[]>;
  
  // Reports
  createReport(report: InsertUserReport): Promise<UserReport>;
  getUserReports(userId: string): Promise<UserReport[]>;
  getLatestReport(userId: string): Promise<UserReport | undefined>;
  updateReportEmailStatus(reportId: string, sent: boolean): Promise<void>;
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
}

export const storage = new DatabaseStorage();
