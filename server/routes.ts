// API routes for Physical.Capital
import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import { generatePersonalizedReport } from "./openai";
import { sendInvestmentReport } from "./email";
import { insertFeedbackSchema, insertPageInteractionSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  // Get current authenticated user - Required for Replit Auth
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const dbUser = await storage.getUser(user.claims.sub);
      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(dbUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Submit feedback
  app.post("/api/feedback", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertFeedbackSchema.parse({
        ...req.body,
        userId: user.claims.sub,
      });

      const newFeedback = await storage.createFeedback(data);
      res.json(newFeedback);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user's feedback
  app.get("/api/feedback/:userId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      // Only allow users to access their own feedback
      if (req.params.userId !== user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const feedbackList = await storage.getUserFeedback(req.params.userId);
      res.json(feedbackList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Track page interaction
  app.post("/api/interactions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertPageInteractionSchema.parse({
        ...req.body,
        userId: user.claims.sub,
      });

      const interaction = await storage.createInteraction(data);
      res.json(interaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user's interactions
  app.get("/api/interactions/:userId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      // Only allow users to access their own interactions
      if (req.params.userId !== user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const interactions = await storage.getUserInteractions(req.params.userId);
      res.json(interactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate personalized AI report
  app.post("/api/reports/generate", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;

      // Get user profile, feedback, and interactions
      const [userProfile, feedbackList, interactionsList] = await Promise.all([
        storage.getUser(userId),
        storage.getUserFeedback(userId),
        storage.getUserInteractions(userId),
      ]);

      if (!userProfile) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate AI report
      const { report, recommendedProjects, insights } = await generatePersonalizedReport(
        {
          profession: userProfile.profession,
          expertise: userProfile.expertise,
          email: userProfile.email,
        },
        feedbackList.map(f => ({
          projectId: f.projectId,
          feedbackText: f.feedbackText,
          expertise: f.expertise,
        })),
        interactionsList.map(i => ({
          pagePath: i.pagePath,
          sectionId: i.sectionId,
          interactionType: i.interactionType,
          duration: i.duration,
        }))
      );

      // Save report to database
      const newReport = await storage.createReport({
        userId,
        reportContent: report,
        recommendedProjects,
        insights,
        emailSent: false,
      });

      // Send investment report email
      if (!userProfile.email) {
        return res.status(400).json({ message: "User email not found" });
      }
      
      const userName = [userProfile.firstName, userProfile.lastName]
        .filter(Boolean)
        .join(' ') || 'Investor';
      
      const emailSent = await sendInvestmentReport({
        to: userProfile.email,
        userName,
        reportContent: report,
        expertise: userProfile.expertise || 'general',
        projectsInterested: feedbackList.map(f => f.projectId),
      });

      // Update email sent status
      if (emailSent) {
        await storage.updateReportEmailStatus(newReport.id, true);
      }

      res.json({ ...newReport, emailSent });
    } catch (error: any) {
      console.error('Report generation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get latest report for user
  app.get("/api/reports/latest/:userId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      // Only allow users to access their own reports
      if (req.params.userId !== user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const report = await storage.getLatestReport(req.params.userId);
      res.json(report || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all reports for user
  app.get("/api/reports/:userId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      // Only allow users to access their own reports
      if (req.params.userId !== user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const reports = await storage.getUserReports(req.params.userId);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}
