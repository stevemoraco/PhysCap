# Design Guidelines for Physical.Capital

## Design Approach
**Custom Luxury Experience**: This project demands a bespoke, premium aesthetic that cannot be templated. Drawing inspiration from high-end investment platforms (Carta, AngelList) combined with luxury brand web experiences (Rolex, Patek Philippe digital showrooms), but with unprecedented 3D interactivity.

## Core Visual Identity

### Color Palette (User-Specified)
- **Primary Background**: Deep blue-green (#0a2e2c to #0f3d3a range)
- **Accent Colors**: 
  - Metallic gold (#d4af37, #ffd700) for interactive elements and borders
  - Emerald highlights (#50c878, #2ecc71) for success states
  - Diamond white (#f8f9fa) for critical text
- **Text Hierarchy**:
  - Primary: White/off-white (#ffffff, #f5f5f5)
  - Secondary: Light gold (#f4e4c1)
  - Tertiary: Muted teal (#7fb3af)

### Typography
- **Headings**: Playfair Display or Cormorant Garamond (luxury serif) - weights 400, 600, 700
- **Body**: Inter or Outfit (modern sans-serif) - weights 300, 400, 500
- **Scale**: 
  - Hero: 3.5rem/4rem (mobile/desktop)
  - H1: 2.5rem/3rem
  - H2: 2rem/2.5rem
  - Body: 1rem/1.125rem
  - Small: 0.875rem

### Spacing System
Use Tailwind units: **4, 8, 12, 16, 24, 32** for consistent rhythm
- Section padding: py-16 md:py-24 lg:py-32
- Component spacing: gap-8 md:gap-12
- Container max-width: max-w-7xl

## Layout Architecture

### Hero Section (Full Viewport)
- Full-screen 3D canvas background with animated golden cairn tree logo
- Gyroscope-responsive parallax: logo and gold particles shift subtly with device movement
- Centered content overlay with blur backdrop (backdrop-blur-md bg-blue-green/40)
- Headline + subheadline + primary CTA
- Scroll indicator with golden animation

### Project Showcase Sections
Each project gets dedicated section with:
- **Left Column** (md:w-1/2): 3D interactive canvas showing project visualization
  - Solar: Animated manufacturing assembly line with robot arms
  - Tower: Rotating 3D building model with glowing golden accents
  - Resort: Image carousel with leather texture overlays
  - Orbital: Space station with Earth background, gyroscope rotation
- **Right Column** (md:w-1/2): Content with gold-bordered cards
  - Project title with gold underline animation
  - Description in 2-3 paragraphs
  - Key metrics in 3-column grid with emerald icons
  - Dual CTAs: "Learn More" (outlined gold) + "Express Interest" (filled gold)

### Innovation Sections (Golden Spike, Vitruvius, Talos, Story Engineering)
- 2-column grid (stack on mobile)
- Icon with golden glow effect
- Title + brief description
- Leather texture background cards with gold borders

## Component Library

### CTA Buttons (Critical - Every Section)
- **Primary**: Gold gradient background, white text, shadow-lg, rounded-lg px-8 py-4
- **Secondary**: Gold border, gold text, backdrop-blur
- **Hover**: Scale transform + increased glow
- Always include icon (arrow, sparkle, or custom)

### Cards
- Dark blue-green background (slightly lighter than page bg)
- 1px gold border with glow on hover
- Rounded corners (rounded-xl)
- Padding: p-8
- Optional: Leather texture overlay at 10% opacity

### 3D Canvas Containers
- Aspect ratio 16:9 on desktop, 4:3 on mobile
- Rounded borders with gold outline
- Loading state: Animated golden spinner with "Rendering..." text

## Interactive Elements & Animations

### Gyroscope Effects (Mobile-First)
- Golden particles/dust that shift based on device orientation
- Logo rotates subtly with tilt
- 3D models respond to gyroscope for natural exploration
- Caustic light patterns that move with device angle

### Scroll Animations (Minimal, Strategic)
- Fade-in on scroll for section headers only
- Gold underline draw-in for headings
- NO continuous animations that drain battery

### 3D Rendering Specifications
- Three.js for all 3D visualizations
- Materials: Use MeshStandardMaterial with metalness: 0.9, roughness: 0.2 for gold
- Lighting: Directional light simulating sunlight + ambient for fill
- Post-processing: Bloom effect on golden elements only

## Images
- **Hero**: NO background image - use 3D canvas instead
- **Leather Textures**: Overlay on innovation cards, subtle (10-20% opacity)
- **Project Thumbnails**: Use as fallback during 3D load, aspect ratio 16:9

## Navigation
- Fixed top bar with blur background
- Golden cairn logo (left)
- Menu items in light gold, white on hover
- Mobile: Hamburger menu with full-screen dark overlay

## Accessibility & Performance
- Maintain 4.5:1 contrast for body text on dark backgrounds
- Offer "Reduce Motion" toggle for users with vestibular issues (disables gyroscope)
- Lazy load 3D canvases below fold
- Preload critical golden textures/materials

## Critical Differentiators
1. Every section has actionable CTA
2. Gyroscope interactivity creates tangible "glimmer" effect
3. GPU rendering makes demonstrations immediate and impressive
4. Personalization layer modifies CTAs based on user profile post-login