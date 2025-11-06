/**
 * Mock data for E2E tests
 * Provides consistent test data for user profiles, feedback, interactions, etc.
 */

export const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  profileImageUrl: 'https://example.com/avatar.jpg',
};

export const mockProfile = {
  id: 'profile-123',
  userId: 'test-user-123',
  firstName: 'Test',
  lastName: 'User',
  company: 'Test Corporation',
  profession: 'Investor',
  expertiseTags: ['Solar Energy', 'Finance', 'Manufacturing'],
  investmentGoals: ['Direct Equity Investment', 'Tax Credit Monetization'],
  riskAppetite: 'moderate',
  preferredInvestmentRange: '$2M - $10M',
  personaSegments: ['FinTech Investor', 'Clean Energy Advocate'],
  completedAt: new Date().toISOString(),
};

export const mockFeedback = {
  id: 'feedback-123',
  userId: 'test-user-123',
  projectId: 'tavakiev',
  feedbackText: 'This is a test feedback transcript about solar manufacturing and investment opportunities.',
  expertise: 'Solar Energy, Manufacturing, Finance',
  sentiment: 'positive',
  createdAt: new Date().toISOString(),
};

export const mockInteractions = [
  {
    id: 'int-1',
    userId: 'test-user-123',
    eventType: 'section_view',
    context: 'hero',
    payload: { duration: 45, scrollDepth: 80 },
    timestamp: Date.now(),
  },
  {
    id: 'int-2',
    userId: 'test-user-123',
    eventType: '3d_interaction',
    context: 'solar-panel-1',
    payload: { action: 'click', position: { x: 200, y: 200 } },
    timestamp: Date.now(),
  },
  {
    id: 'int-3',
    userId: 'test-user-123',
    eventType: 'voice_feedback_recorded',
    context: 'project-tavakiev',
    payload: { duration: 35, wordCount: 150 },
    timestamp: Date.now(),
  },
];

export const mockProjects = [
  {
    id: 'tavakiev',
    name: 'Project Tavakiev',
    slug: 'tavakiev',
    title: 'Tavakiev Solar Panel Manufacturing Facility',
    description: 'Vertically integrated solar panel manufacturing in Central Asia',
    location: 'Bishkek, Kyrgyz Republic',
    capacity: '2 GW annually',
    has3D: true,
  },
  {
    id: 'tabeguache',
    name: 'Project Tabeguache',
    slug: 'tabeguache',
    title: 'Tabeguache Peak Ski Resort',
    description: 'High-altitude ski resort development',
    location: 'Colorado, USA',
    has3D: true,
  },
  {
    id: 'venustas',
    name: 'Project Venustas',
    slug: 'venustas',
    title: 'Venustas Tower',
    description: 'Mixed-use urban development',
    location: 'Miami, Florida',
    has3D: true,
  },
  {
    id: 'yadilhil',
    name: 'Project Yadilhil',
    slug: 'yadilhil',
    title: 'Yadilhil Orbital Platform',
    description: 'Space infrastructure project',
    location: 'Low Earth Orbit',
    has3D: true,
  },
];

export const mockInnovations = [
  {
    id: 'golden-spike',
    slug: 'golden-spike',
    title: 'Golden Spike',
    description: 'Peak experience modeling methodology',
  },
  {
    id: 'vitruvius',
    slug: 'vitruvius',
    title: 'Vitruvius',
    description: 'Architectural design system',
  },
  {
    id: 'talos',
    slug: 'talos',
    title: 'Talos',
    description: 'Autonomous construction robotics',
  },
  {
    id: 'story-engineering',
    slug: 'story-engineering',
    title: 'Story Engineering',
    description: 'Narrative-driven design approach',
  },
];

export const mockReportRequest = {
  id: 'report-123',
  userId: 'test-user-123',
  projectId: 'tavakiev',
  requestedAt: new Date().toISOString(),
  status: 'pending',
  email: 'test@example.com',
};

/**
 * Helper function to mock getUserMedia for voice recording tests
 */
export const mockGetUserMedia = () => {
  return `
    navigator.mediaDevices.getUserMedia = async () => {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const destination = audioContext.createMediaStreamDestination();
      oscillator.connect(destination);
      oscillator.start();
      return destination.stream;
    };
  `;
};

/**
 * Helper function to mock device orientation for gyroscope tests
 */
export const mockDeviceOrientation = (alpha = 0, beta = 30, gamma = 20) => {
  return `
    const event = new DeviceOrientationEvent('deviceorientation', {
      alpha: ${alpha},
      beta: ${beta},
      gamma: ${gamma},
      absolute: true,
    });
    window.dispatchEvent(event);
  `;
};

/**
 * Helper function to disable WebGPU for fallback tests
 */
export const disableWebGPU = () => {
  return `
    Object.defineProperty(navigator, 'gpu', {
      get: () => undefined,
      configurable: true,
    });
  `;
};

/**
 * Helper function to disable WebGL for fallback tests
 */
export const disableWebGL = () => {
  return `
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(contextType, ...args) {
      if (contextType === 'webgl' || contextType === 'webgl2') {
        return null;
      }
      return originalGetContext.call(this, contextType, ...args);
    };
  `;
};

/**
 * Helper function to simulate low-end device
 */
export const simulateLowEndDevice = () => {
  return `
    Object.defineProperty(navigator, 'gpu', {
      get: () => undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => 2,
      configurable: true,
    });
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => 2,
      configurable: true,
    });
  `;
};
