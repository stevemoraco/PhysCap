// API routes for Physical.Capital
import type { Express } from "express";
import multer from "multer";
import { isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import { generatePersonalizedReport } from "./openai";
import { sendInvestmentReport } from "./email";
import { insertFeedbackSchema, insertPageInteractionSchema, insertInteractionEventSchema, insertUserProfileSchema } from "@shared/schema";
import { generatePersonalizedReport as generateReport } from "./services/reportGenerator";
import { processVoiceFeedback } from "./services/voiceTranscription";
import { generatePersonalizedContent, generateUserCopyBundle } from "./services/personalizationService";

// Configure multer for file uploads
const upload = multer({ dest: '/tmp/uploads/' });

export function registerRoutes(app: Express) {
  app.get("/api/tavakiev/sections", async (_req, res) => {
    try {
      const sections = await storage.getTavakievSources();
      res.json(sections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

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

  app.get("/api/interaction-events/:userId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (req.params.userId !== user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const events = await storage.getUserInteractionEvents(req.params.userId);
      res.json(events);
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

  // User Profile Management
  app.get("/api/users/profile/:userId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (req.params.userId !== user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const profile = await storage.getUserProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/users/profile", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;

      // Update basic user info
      await storage.upsertUser({
        id: userId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        company: req.body.company,
        profession: req.body.profession,
        email: user.claims.email,
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/users/profile/detailed", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertUserProfileSchema.parse(req.body);

      // Ensure userId matches authenticated user
      if (data.userId !== user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const profile = await storage.upsertUserProfile(data);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Batch interaction events
  app.post("/api/interactions/batch", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      const { events } = req.body;

      if (!Array.isArray(events)) {
        return res.status(400).json({ message: "Events must be an array" });
      }

      const eventsWithUser = events.map(e => ({
        ...e,
        userId,
      }));

      await storage.createInteractionEvents(eventsWithUser);

      res.json({ success: true, count: events.length });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Voice feedback with Whisper transcription
  app.post("/api/feedback/voice", isAuthenticated, upload.single('audio'), async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      const { projectId } = req.body;
      const audioFile = req.file;

      if (!audioFile) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      // Process voice feedback (transcribe + extract expertise)
      const { transcript, expertise, summary } = await processVoiceFeedback(audioFile.path);

      // Store transcript
      const feedbackTranscript = await storage.createFeedbackTranscript({
        userId,
        projectId,
        transcript,
        audioUrl: audioFile.path,
        language: 'en',
      });

      // Store feedback
      await storage.createFeedback({
        userId,
        projectId,
        feedbackText: summary || transcript,
        expertise: expertise.keywords.join(', '),
      });

      res.json({
        success: true,
        transcript,
        expertise: expertise.keywords,
      });
    } catch (error: any) {
      console.error('Voice feedback error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Personalization endpoints
  app.post("/api/personalization/generate", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      const { baseContent, context, projectId } = req.body;

      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.json({ personalizedContent: baseContent });
      }

      const personalizedContent = await generatePersonalizedContent(
        baseContent,
        profile,
        context,
        projectId
      );

      res.json({ personalizedContent });
    } catch (error: any) {
      console.error('Personalization error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/personalization/copy/:userId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (req.params.userId !== user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const profile = await storage.getUserProfile(req.params.userId);
      if (!profile) {
        return res.json({});
      }

      const copyBundle = await generateUserCopyBundle(req.params.userId, profile);
      res.json(copyBundle);
    } catch (error: any) {
      console.error('Copy bundle error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Enhanced report generation
  app.post("/api/reports/generate-v2", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;

      const { reportContent, recommendedProjects, insights } = await generateReport(userId);

      // Save report to database
      const newReport = await storage.createReport({
        userId,
        reportContent,
        recommendedProjects,
        insights,
        emailSent: false,
      });

      // Send email
      const dbUser = await storage.getUser(userId);
      if (dbUser?.email) {
        const userName = [dbUser.firstName, dbUser.lastName]
          .filter(Boolean)
          .join(' ') || 'Investor';

        await sendInvestmentReport({
          to: dbUser.email,
          userName,
          reportContent,
          expertise: insights.behavioralInsights.expertiseShared.join(', ') || 'general',
          projectsInterested: recommendedProjects,
        });

        await storage.updateReportEmailStatus(newReport.id, true);
      }

      res.json({ ...newReport, emailSent: true });
    } catch (error: any) {
      console.error('Report generation v2 error:', error);
      res.status(500).json({ message: error.message });
    }
  });
}
