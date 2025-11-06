# Physical.Capital - Interactive Investment Platform

## Project Overview
Physical.Capital is a mobile-first luxury web application showcasing cutting-edge infrastructure investment opportunities through GPU-accelerated 3D visualizations, gyroscope-responsive effects, and AI-powered personalized engagement.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Wouter (routing), TailwindCSS
- **3D Graphics**: Three.js (GPU-accelerated WebGL rendering)
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon) via Drizzle ORM
- **Authentication**: Replit Auth (OIDC)
- **AI**: OpenAI GPT-4 for personalized feedback analysis
- **UI Components**: shadcn/ui (Radix primitives)
- **State Management**: TanStack Query v5

## Application Structure

### Pages
1. **Landing Page** (`/`) - Unauthenticated users
   - Hero section with gyroscope-responsive glimmer effects
   - Project Tavakiev showcase with full 3D solar manufacturing demo
   - Innovation cards (Golden Spike, Vitruvius, Talos, Story Engineering)
   - Project showcase grid with 3D previews (Tabeguache, Venustas, Yádiłhił)
   - CTA buttons throughout for engagement
   - SEO optimization with meta tags, Open Graph, structured data

2. **Home Page** (`/`) - Authenticated users
   - Personalized dashboard with activity metrics
   - Full project exploration with all 3D demos
   - Feedback collection modals
   - AI-powered report generation CTA
   - Social sharing for all projects

3. **Dashboard Page** (`/dashboard`) - Authenticated users
   - Comprehensive feedback history with timeline
   - Activity log showing all interactions
   - AI report generation with email delivery
   - Project statistics and engagement metrics
   - Tabs for organizing feedback vs activity data

### Key Components

#### 3D Visualizations (All with Gyroscope Controls & Click-to-Explore)
- **SolarManufacturing3D**: Full interactive solar panel factory with:
  - 8 animated solar panels in assembly line (clickable with info tooltips)
  - 3 golden robotic workers with articulated arms (clickable)
  - Physics-based movements and rotations
  - Dynamic lighting (gold directional, emerald accent)
  - Gyroscope-responsive camera (pan/tilt with device orientation)
  - Click-to-zoom functionality on all panels and robots

- **TabeguacheResort3D**: Luxury Colorado resort with:
  - 6 prefab luxury cabins (2x3 grid layout)
  - Main lodge building (large central structure)
  - Spa building with glass features
  - Mountain terrain with elevation changes
  - Pine trees and natural landscaping
  - Gyroscope-responsive camera controls

- **VenustasTower3D**: World's tallest skyscraper with:
  - 100-floor tapered tower (narrowing at top)
  - Spiral exterior staircase wrapping around
  - 20 hanging garden platforms
  - Golden spire at top
  - Reflective glass materials
  - Gyroscope camera controls

- **YadilhilOrbital3D**: First orbital apartment complex with:
  - 2 rotating habitat rings (counter-rotating)
  - Central docking hub
  - 8 solar panel arrays
  - Realistic star field background
  - Gyroscope-responsive camera
  - Physics-based ring rotation

#### Interactive Features
- **3D Click-to-Explore** (`use3DInteraction` hook):
  - Raycasting-based object detection (mouse/touch)
  - Automatic camera zoom to clicked objects
  - Interactive info tooltips with component details
  - Hover cursor changes for interactive elements
  - Works seamlessly with gyroscope controls

- **GlimmerEffect**: Gyroscope-responsive particle system
  - 40+ particles (gold, emerald, diamond colors)
  - Device orientation tracking (beta/gamma angles)
  - Smooth parallax movement

- **FeedbackModal**: User engagement collection
  - Expertise level tracking
  - Project interest capture
  - AI analysis preparation

#### UI Components
- **GoldButton**: Primary CTA with two variants (primary, outline)
- **ProjectCard**: Showcases projects with metrics and CTAs
- **TooltipOverlay3D**: Floating tooltips for 3D object information
- **Navigation**: Fixed header with auth state
- **ErrorBoundary**: Graceful error handling

### Database Schema

#### Tables
1. **users**
   - id (varchar, UUID primary key)
   - name, email (from Replit Auth)
   - expertise_level (optional: expert | professional | enthusiast | curious)

2. **feedbacks**
   - id (serial primary key)
   - user_id (references users)
   - project_id (varchar: tavakiev, tabeguache, venustas, yadilhil)
   - expertise_level (required)
   - message (text)
   - created_at (timestamp)

3. **interactions**
   - id (serial primary key)
   - user_id, project_id, interaction_type, metadata, created_at

4. **project_interests**
   - id (serial primary key)
   - user_id, project_id, interest_level (1-10), notes, created_at

### API Routes

#### Authentication
- `GET /api/auth/user` - Get current user (returns 401 if not authenticated)
- `GET /api/auth/login` - Initiate Replit Auth login
- `GET /api/auth/callback` - OAuth callback handler
- `POST /api/auth/logout` - Sign out user

#### Feedback & Interaction
- `POST /api/feedback` - Submit user feedback (requires auth)
- `POST /api/interactions` - Track user interactions
- `GET /api/report/:userId` - Generate AI-powered personalized report

### Design System

#### Color Palette
- **Background**: `hsl(177 54% 11%)` - Deep blue-green (#0a2e2c)
- **Primary**: `hsl(43 68% 53%)` - Metallic gold (#d4af37)
- **Accent**: `hsl(153 48% 49%)` - Emerald (#50c878)
- **Foreground**: Near-white for maximum contrast

#### Typography
- **Headlines**: Playfair Display (serif, luxury)
- **Body/UI**: Inter (sans-serif, modern)

#### Key Features
- Glassmorphism effects (backdrop-blur)
- Golden glow shadows on interactive elements
- Smooth 300ms transitions
- Mobile-first responsive design
- Minimum 44x44px touch targets

## Development

### Running the Application
```bash
npm run dev
```
Starts Express backend (port 5000) + Vite frontend (same port)

### Database Management
```bash
npm run db:push        # Sync schema to database
npm run db:studio      # Open Drizzle Studio
```

### Environment Variables (Auto-configured)
- `DATABASE_URL` - PostgreSQL connection
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
- `SESSION_SECRET` - Express session encryption
- `OPENAI_API_KEY` - AI integration (if configured)

## Project Goals
1. **Showcase Innovation**: GPU-accelerated 3D demos make technology tangible
2. **Engage Users**: Every section has CTAs for feedback collection
3. **Personalize Experience**: AI analyzes user expertise to customize messaging
4. **Mobile-First**: Gyroscope effects create immersive mobile experience
5. **Premium Aesthetic**: Luxury design builds trust and credibility

## Featured Projects

### 1. Project Tavakiev (Primary Focus)
2 GW autonomous solar gigafactory achieving 100x cost reduction through IRA tax credit stacking.

**3D Demo Features**:
- Real-time robotic assembly simulation
- Photorealistic solar panel materials
- Factory floor with grid system
- Dynamic golden and emerald lighting

### 2. The Tabeguache Collection
Luxury Colorado resort acquisition & development with prefab innovation.

### 3. Venustas Tower
World's tallest skyscraper with exterior staircase and hanging gardens.

### 4. Yádiłhił Orbital Complex
First orbital apartment complex, Colorado-manufactured and Starship-launched.

## Testing Strategy

### Manual Testing Checklist
- [ ] Landing page loads with 3D visualizations
- [ ] Glimmer effects respond to device tilt (mobile)
- [ ] All CTAs open modals/navigate correctly
- [ ] Sign in flow with Replit Auth
- [ ] Feedback submission stores in database
- [ ] All 3D scenes render without errors
- [ ] Mobile responsive at 375px, 768px, 1024px, 1920px
- [ ] Error boundary catches React errors gracefully

### Performance Targets
- First Contentful Paint: <1.5s
- Time to Interactive: <3.0s
- 3D rendering: 60fps desktop, 30fps mobile
- Lighthouse Score: >90

## Known Limitations
- Gyroscope effects require device permission (mobile)
- 3D visualizations require WebGL support
- AI report generation requires OpenAI API key configuration

## Future Enhancements
- Advanced 3D interactions (click-to-explore)
- Email delivery of AI reports
- User dashboard with saved interests
- Social sharing of projects
- Additional project 3D demos
