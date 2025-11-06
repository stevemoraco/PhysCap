import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import { registerRoutes } from '@/../server/routes';

// Mock dependencies
vi.mock('@/../server/replitAuth', () => ({
  isAuthenticated: (req: any, res: any, next: any) => {
    req.user = {
      claims: { sub: 'test-user-123' },
    };
    next();
  },
}));

vi.mock('@/../server/storage', () => ({
  storage: {
    getUser: vi.fn(() =>
      Promise.resolve({
        id: 'test-user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        profession: 'Engineer',
        expertise: 'Solar Energy',
      })
    ),
    createFeedback: vi.fn((data) =>
      Promise.resolve({
        id: 'feedback-1',
        ...data,
        createdAt: new Date(),
      })
    ),
    getUserFeedback: vi.fn(() => Promise.resolve([])),
    createInteraction: vi.fn((data) =>
      Promise.resolve({
        id: 'interaction-1',
        ...data,
        timestamp: new Date(),
      })
    ),
    getUserInteractions: vi.fn(() => Promise.resolve([])),
    createReport: vi.fn((data) =>
      Promise.resolve({
        id: 'report-1',
        ...data,
        createdAt: new Date(),
      })
    ),
    getLatestReport: vi.fn(() => Promise.resolve(null)),
    getUserReports: vi.fn(() => Promise.resolve([])),
    updateReportEmailStatus: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('@/../server/openai', () => ({
  generatePersonalizedReport: vi.fn(() =>
    Promise.resolve({
      report: 'Personalized investment report',
      recommendedProjects: ['tavakiev', 'tabeguache'],
      insights: ['High ROI potential', 'Tax credit benefits'],
    })
  ),
}));

vi.mock('@/../server/email', () => ({
  sendInvestmentReport: vi.fn(() => Promise.resolve(true)),
}));

describe('API Routes Integration Tests', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    registerRoutes(app);
    vi.clearAllMocks();
  });

  describe('GET /api/auth/user', () => {
    it('returns authenticated user', async () => {
      const response = await request(app).get('/api/auth/user');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'test-user-123');
      expect(response.body).toHaveProperty('email');
    });
  });

  describe('POST /api/feedback', () => {
    it('creates feedback successfully', async () => {
      const feedbackData = {
        projectId: 'tavakiev',
        feedbackText: 'Great project!',
        expertise: 'Solar Energy',
      };

      const response = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.projectId).toBe('tavakiev');
    });

    it('validates feedback data', async () => {
      const invalidData = {
        projectId: 123, // Should be string
      };

      const response = await request(app)
        .post('/api/feedback')
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/feedback/:userId', () => {
    it('returns user feedback', async () => {
      const response = await request(app).get('/api/feedback/test-user-123');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('forbids access to other users feedback', async () => {
      const response = await request(app).get('/api/feedback/other-user');

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/interactions', () => {
    it('tracks interaction successfully', async () => {
      const interactionData = {
        pagePath: '/project/tavakiev',
        interactionType: 'click',
        sectionId: 'solar-panel',
        duration: 30,
      };

      const response = await request(app)
        .post('/api/interactions')
        .send(interactionData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /api/interactions/:userId', () => {
    it('returns user interactions', async () => {
      const response = await request(app).get('/api/interactions/test-user-123');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('forbids access to other users interactions', async () => {
      const response = await request(app).get('/api/interactions/other-user');

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/reports/generate', () => {
    it('generates personalized report', async () => {
      const response = await request(app).post('/api/reports/generate');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reportContent');
      expect(response.body).toHaveProperty('recommendedProjects');
      expect(response.body).toHaveProperty('emailSent');
    });
  });

  describe('GET /api/reports/latest/:userId', () => {
    it('returns latest report', async () => {
      const response = await request(app).get('/api/reports/latest/test-user-123');

      expect(response.status).toBe(200);
    });

    it('forbids access to other users reports', async () => {
      const response = await request(app).get('/api/reports/latest/other-user');

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/reports/:userId', () => {
    it('returns all user reports', async () => {
      const response = await request(app).get('/api/reports/test-user-123');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
