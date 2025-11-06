# Physical.Capital Design System

## Overview
Physical.Capital embodies luxury, innovation, and sophistication through a carefully crafted design system inspired by high-end investment platforms and premium brand experiences. The aesthetic combines deep blue-green tones reminiscent of precious minerals with metallic gold accents suggesting wealth and exclusivity.

## Design Philosophy
- **Luxurious & Professional**: Evoke trust and premium quality through refined aesthetics
- **Mobile-First & Interactive**: Gyroscope-responsive effects create immersive experiences
- **Physics-Based**: GPU-accelerated 3D visualizations demonstrate technological sophistication
- **Tactile & Responsive**: Every interaction feels premium and intentional

---

## Color Palette

### Primary Colors
- **Dark Blue-Green Background**: `hsl(177 54% 11%)` - #0a2e2c
  - Deep, mineral-like foundation suggesting stability and depth
  - Evokes precious stones like emeralds and aquamarines
  
- **Metallic Gold Primary**: `hsl(43 68% 53%)` - #d4af37
  - The signature accent color representing value and prestige
  - Used for CTAs, highlights, and interactive elements
  - Creates contrast against dark backgrounds

- **Emerald Accent**: `hsl(153 48% 49%)` - #50c878
  - Secondary accent for variety and vibrancy
  - Represents growth, innovation, and sustainability
  
- **Diamond White Foreground**: `hsl(0 0% 98%)` - Near-white
  - Clear, crisp text that pops against dark backgrounds
  - Maximum readability while maintaining elegance

### Surface Colors
- **Card Background**: `hsl(177 48% 13%)` - Slightly elevated from base
- **Muted Backgrounds**: `hsl(177 32% 18%)` - For secondary containers
- **Borders**: `hsl(177 28% 22%)` - Subtle separation

### Text Hierarchy
- **Default Text**: `hsl(0 0% 98%)` - Primary content
- **Secondary Text**: `hsl(177 15% 62%)` - Supporting information
- **Muted Text**: `hsl(177 25% 45%)` - Tertiary details

---

## Typography

### Font Families
```css
--font-serif: 'Playfair Display', serif;  /* Headlines, luxury touch */
--font-sans: 'Inter', sans-serif;         /* Body text, UI elements */
```

### Type Scale
- **Hero Headlines**: 3.5rem (56px) desktop, 2.5rem (40px) mobile
  - Font: Playfair Display Bold
  - Line height: 1.1
  - Letter spacing: -0.02em
  
- **Section Headings**: 2.5-3rem (40-48px)
  - Font: Playfair Display Semibold
  - Used for major section breaks
  
- **Card Titles**: 1.5-2rem (24-32px)
  - Font: Playfair Display Bold
  - Creates hierarchy within cards

- **Body Text**: 1rem (16px) base, 1.125rem (18px) for emphasis
  - Font: Inter Regular
  - Line height: 1.6 for readability

- **Small Text**: 0.875rem (14px)
  - Font: Inter Medium
  - UI elements, labels, captions

### Typography Rules
- Headlines use Playfair Display for elegance and sophistication
- All UI and body text uses Inter for clarity and modern feel
- Maintain generous line-height (1.5-1.7) for readability
- Use letter-spacing sparingly, only for headlines

---

## Spacing & Layout

### Spacing Scale
```css
--spacing: 0.25rem; /* 4px base unit */
```
- Small spacing: 0.5-1rem (8-16px) - Compact elements
- Medium spacing: 1.5-2rem (24-32px) - Section padding
- Large spacing: 3-4rem (48-64px) - Major section breaks
- XL spacing: 6rem+ (96px+) - Hero sections

### Layout Principles
- **Container Width**: max-width: 1200px with auto margins
- **Grid Systems**: 12-column grid with responsive breakpoints
- **Card Padding**: 2rem (32px) for luxurious spaciousness
- **Mobile**: Reduce spacing by 25-30% for compact mobile layouts

---

## Components

### GoldButton
Primary CTA component with two variants:
- **Primary**: Gradient gold background with glow effect
- **Outline**: Transparent with gold border and backdrop blur

**Usage:**
```tsx
<GoldButton icon="arrow" size="lg">
  Explore Projects
</GoldButton>
```

**Animations:**
- Hover: Scale 1.05, enhanced glow shadow
- Active: Slight press effect
- Gradient animation on hover

### ProjectCard
Showcases individual infrastructure projects with metrics and CTAs.

**Features:**
- Elevated card background with backdrop blur
- Gold accent line at top
- Metric display grid
- Dual CTA buttons (Learn More + Express Interest)
- Hover elevation effect

### Navigation
Fixed header with glassmorphism effect:
- 80% background opacity with backdrop blur
- Gold logo icon (Gem)
- Responsive auth state (Sign In / Sign Out)
- Mobile-optimized with hidden text on small screens

### FeedbackModal
Dialog for collecting user expertise and project interest:
- Clean form layout with labeled inputs
- Textarea for detailed feedback
- Loading states during submission
- Success/error toast notifications

---

## Interactive Effects

### Hover & Active States
```css
.hover-elevate:hover {
  background: rgba(212, 175, 55, 0.05); /* Gold tint */
}

.active-elevate-2:active {
  background: rgba(212, 175, 55, 0.12); /* Stronger gold tint */
}
```

### Shadows & Glows
All shadows use gold tint for brand consistency:
```css
--shadow-lg: 0px 10px 20px 0px rgba(212, 175, 55, 0.20);
--shadow-xl: 0px 16px 32px 0px rgba(212, 175, 55, 0.24);
```

### Custom Animations
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

---

## Mobile Experience

### Gyroscope Effects
All glimmer particles respond to device tilt:
- **Beta** (front-back): Controls Y-axis parallax
- **Gamma** (left-right): Controls X-axis parallax
- Smooth transitions (0.3s ease-out) prevent jarring movements

### Touch Optimization
- Minimum touch target: 44x44px
- Increased tap padding on mobile buttons
- Disabled pinch-zoom for controlled experience
- Smooth scrolling with scroll-snap on sections

### Responsive Breakpoints
- Mobile: 0-640px
- Tablet: 641-1024px
- Desktop: 1025px+

**Mobile Adjustments:**
- Hero text: 40% size reduction
- Grid columns: Stack to single column
- Navigation: Hide text labels, show icons only
- Spacing: Reduce by 30%

---

## 3D Visualizations

### Technical Specifications
- **Renderer**: Three.js WebGL with GPU acceleration
- **Performance**: High-performance mode, pixel ratio capped at 2
- **Shadows**: PCF soft shadows for realism
- **Anti-aliasing**: Enabled for smooth edges

### Project Tavakiev Solar Manufacturing
**Scene Composition:**
- 8 solar panels in circular assembly line
- 3 golden humanoid robots with animated arms
- Factory floor with grid helper
- Dynamic camera orbit around scene

**Materials:**
- Panel frame: Metallic dark (#2a2a2a), high metalness
- Solar cells: Deep blue (#1a3c5a) with subtle emission
- Glass: Transmission 0.9 for realistic transparency
- Robots: Gold (#d4af37) with emissive glow

**Lighting:**
- Ambient: 40% white for base illumination
- Main directional: 80% golden light with shadows
- Accent point: Emerald light pulsing for atmosphere

**Animation:**
- Camera: Slow orbit (0.2 rad/s) around scene
- Panels: Rising/falling with rotation
- Robots: Working motion with arm articulation
- Lights: Pulsing emerald accent creates dynamism

---

## Accessibility

### Color Contrast
- Text on background: Minimum 7:1 contrast ratio
- Gold on dark blue-green: 4.8:1 (AA compliant for large text)
- Interactive elements: Clear focus states with gold outline

### Keyboard Navigation
- All interactive elements accessible via Tab
- Focus indicators visible and consistent
- Enter/Space activate buttons
- Escape closes modals

### Screen Readers
- Semantic HTML throughout
- ARIA labels on interactive elements
- Alt text on all images
- Proper heading hierarchy (h1 → h2 → h3)

---

## Brand Voice

### Tone
- **Professional yet Visionary**: Grounded in reality while inspiring
- **Confident but not Arrogant**: Expertise without condescension
- **Technical yet Accessible**: Explain complexity clearly

### Messaging Principles
- Lead with impact and scale
- Quantify whenever possible (2 GW, 100x cost reduction)
- Emphasize innovation and cutting-edge technology
- Build credibility through specifics

### Example Copy
✅ Good: "2 GW autonomous gigafactory achieving 100x cost reduction through IRA tax credit stacking"
❌ Bad: "Really big solar panel factory that's going to be super cheap"

---

## Performance Guidelines

### Images
- Use WebP format with PNG fallback
- Lazy load images below fold
- Optimize hero images to <200KB
- Use srcset for responsive images

### 3D Rendering
- Cap pixel ratio at 2 for performance
- Use geometry instancing for repeated objects
- Dispose resources on cleanup
- Throttle animation frame rate on mobile

### Animations
- Use CSS transforms (GPU-accelerated)
- Avoid animating expensive properties (layout)
- Use will-change sparingly
- Prefer requestAnimationFrame over setInterval

---

## Implementation Checklist

### Every Page Must Include:
- [ ] Navigation with auth state
- [ ] GlimmerEffect for luxury feel
- [ ] Proper meta tags (title, description)
- [ ] Responsive breakpoints
- [ ] Loading states
- [ ] Error boundaries

### Every Interactive Element:
- [ ] Hover state with elevation
- [ ] Active state with stronger elevation
- [ ] Focus state for keyboard navigation
- [ ] data-testid for testing
- [ ] Appropriate cursor (pointer, default)
- [ ] Disabled state styling if applicable

### Every Form:
- [ ] Validation with zod
- [ ] Error messages
- [ ] Loading states
- [ ] Success feedback (toast)
- [ ] Proper labels and placeholders
- [ ] Clear CTA buttons

---

## Luxury Details That Matter

1. **Golden Glow**: Every card and button has subtle gold shadow
2. **Backdrop Blur**: Glassmorphism effect on overlays
3. **Smooth Transitions**: 300ms duration, ease-in-out timing
4. **Micro-interactions**: Pulse animations on key elements
5. **Premium Spacing**: Never cramped, always room to breathe
6. **Quality Typography**: Proper kerning, leading, hierarchy
7. **Thoughtful Loading**: Elegant skeleton states, not jarring spinners
8. **Particle Systems**: Glimmer effects respond to gyroscope

---

## Testing Guidelines

### Visual Quality Assurance
- Test on multiple devices (phone, tablet, desktop)
- Verify gyroscope effects on mobile
- Check 3D rendering performance
- Confirm all colors match brand palette
- Validate typography scaling

### Interaction Testing
- All CTAs trigger correct actions
- Modals open/close properly
- Forms validate and submit correctly
- Navigation routes work
- Auth flow completes successfully

### Performance Targets
- First Contentful Paint: <1.5s
- Time to Interactive: <3.0s
- Lighthouse Score: >90
- 60fps animations on desktop
- 30fps minimum on mobile

---

## Design Evolution

This design system is living and will evolve as Physical.Capital grows. Key principles remain constant:
- Luxury through restraint
- Innovation through interaction
- Professionalism through clarity
- Aspiration through vision

Every design decision should ask: "Does this feel like a premium, trustworthy, cutting-edge investment platform?"
