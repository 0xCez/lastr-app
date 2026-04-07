# Lastr' Landing Page Brief

## Overview

**App Name:** Lastr' (with apostrophe)
**Tagline Ideas:**
- "Take control. Last longer."
- "The 90-day transformation program for men"
- "Science-backed training for lasting confidence"

**What It Is:**
A men's sexual health app designed to help users overcome premature ejaculation through science-backed exercises, daily training habits, progress tracking, and personalized programs.

**Target Audience:** Men experiencing premature ejaculation who want a discreet, science-based solution they can do on their own.

---

## Brand Identity

### Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Primary Purple** | `#8B5CF6` | Main accent, buttons, highlights, progress indicators |
| **Primary Light** | `#A78BFA` | Lighter accents, hover states |
| **Primary Dark** | `#7C3AED` | Darker accents, pressed states |
| **Background** | `#0A0A0F` | Main dark background |
| **Secondary BG** | `#111118` | Slightly lighter sections |
| **Card Background** | `#1A1A24` | Card containers |
| **Card Border** | `#2A2A3A` | Subtle borders |
| **White** | `#FFFFFF` | Primary text |
| **Gray Light** | `#9CA3AF` | Secondary text |
| **Gray Muted** | `#6B7280` | Muted text |
| **Success Green** | `#22C55E` | Positive states, completion |
| **Warning Orange** | `#F59E0B` | Caution states |
| **Error Red** | `#EF4444` | Warnings, critical info |
| **Streak Orange** | `#F97316` | Streak tracking accent |

### Gradients

- **Primary Gradient:** `#8B5CF6` → `#6D28D9` (purple to darker purple)
- **Dark Gradient:** `#1A1A24` → `#0A0A0F`
- **Subtle Card Overlay:** `rgba(139, 92, 246, 0.1)` → `rgba(139, 92, 246, 0.05)`

### Typography

- **Primary Font:** Inter (weights: Regular, Medium, SemiBold, Bold)
- **Secondary Font:** DM Sans (weights: Regular, Medium, Bold)
- **Display/Logo Font:** Aeonik or Neue Haas Display (for headings, hero text)

### Design Style

- **Theme:** Dark mode only
- **Aesthetic:** Modern, minimalist, premium
- **Corner Radius:** 16px default (rounded, soft edges)
- **Visual Effects:** Subtle gradients, glows, floating animations
- **Overall Vibe:** Masculine but approachable, clinical but not cold, premium health app

---

## Logo & Assets

- **Logo file:** `assets/images/logo_nobg.png` (logo without background)
- **Alternative:** `assets/images/logo_icon.jpeg`
- **App Icon:** Purple-accented on dark background

---

## Core Value Proposition

**Main Promise:**
A 90-day transformation program combining cognitive exercises, physical training, and progress tracking to give users measurable control and confidence in the bedroom.

**The Problem We Solve:**
- 1 in 3 men experience premature ejaculation
- It creates a vicious cycle of anxiety → poor performance → more anxiety
- It affects relationships, confidence, and mental health
- Most men suffer in silence due to embarrassment

**The Solution:**
- Science-backed exercise program (cognitive + physical)
- Daily micro-training (just minutes per day)
- Progress tracking with measurable improvement
- Personalized based on user's specific concerns
- 100% private and discreet

---

## Key Features

### 1. Personalized 90-Day Program
- Assessment-based personalization
- Adapts to user's primary concern (physical, mental, or both)
- Progressive difficulty over 90 days

### 2. Daily Training Tasks
- 6-7 tasks per day
- Mix of cognitive and physical exercises
- Takes just 10-15 minutes daily
- Checkbox completion with streak tracking

### 3. Control Score Tracking
- 0-100 score measuring progress
- Weekly check-ins to update real progress
- Visual graphs showing improvement over time
- Milestone celebrations at Day 21, 45, 90

### 4. Exercise Library
Two categories:

**Cognitive Exercises:**
- Start-Stop Technique
- Cognitive Reframing
- 4-4-8 Breathing
- Sensate Focus/Mindfulness
- Control Visualization

**Physical Exercises:**
- Basic Kegels
- Reverse Kegels
- Bridge Abduction
- Pelvic Stretching
- And more...

### 5. Progress Milestones
- Streak tracking (current + longest)
- Journey milestones at key days
- Celebration animations on achievements

### 6. Community (Coming Soon)
- Connect with 50K+ men on the same journey
- Anonymous support and motivation

---

## Social Proof & Stats

Use these throughout the landing page:

| Stat | Value |
|------|-------|
| Success Rate | 94% |
| Men Helped | 50,000+ |
| App Rating | 4.8 stars |

### Testimonials

> "I used to struggle with control, but this app completely changed my confidence in bed."

> "I used to feel completely powerless, but now I decide when to finish."

> "Week 2 down. The Kegel exercises are tough but starting to show results."

> "14 days in - the Start-Stop method is a game changer."

> "Two weeks of sticking with the program, and the difference is night and day."

---

## Review Cards Component

### Card Layout
```
┌─────────────────────────────────────────┐
│  ★★★★★                                  │
│                                         │
│  "Review text here..."                  │
│                                         │
│  ┌──┐  Name or Anonymous                │
│  │👤│  Day 45 · Verified ✓              │
│  └──┘                                   │
└─────────────────────────────────────────┘
```

### Card Styling

```css
.review-card {
  background: linear-gradient(135deg, #1A1A24 0%, #111118 100%);
  border: 1px solid #2A2A3A;
  border-radius: 16px;
  padding: 24px;
  min-width: 320px;
  max-width: 400px;
}

.review-card:hover {
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.1);
  transform: translateY(-4px);
  transition: all 0.3s ease;
}

.stars { color: #F59E0B; font-size: 16px; margin-bottom: 16px; }
.review-text { font-size: 16px; color: #FFFFFF; line-height: 1.6; margin-bottom: 20px; }
.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B5CF6, #6D28D9);
}
.reviewer-name { font-size: 14px; font-weight: 600; color: #FFFFFF; }
.reviewer-meta { font-size: 12px; color: #6B7280; }
.verified { color: #22C55E; }
```

### Review Data

```json
[
  {
    "stars": 5,
    "text": "I used to struggle with control, but this app completely changed my confidence in bed. The exercises actually work.",
    "name": "Anonymous",
    "day": 90,
    "verified": true,
    "avatar": "🔒"
  },
  {
    "stars": 5,
    "text": "I used to feel completely powerless, but now I decide when to finish. This program gave me back my confidence.",
    "name": "Marcus T.",
    "day": 67,
    "verified": true,
    "avatar": "M"
  },
  {
    "stars": 5,
    "text": "Week 2 down. The Kegel exercises are tough but starting to show results. Feeling optimistic for the first time.",
    "name": "Anonymous",
    "day": 14,
    "verified": true,
    "avatar": "🔒"
  },
  {
    "stars": 5,
    "text": "14 days in - the Start-Stop method is a game changer. Already noticing improvements I didn't think were possible.",
    "name": "James R.",
    "day": 14,
    "verified": true,
    "avatar": "J"
  },
  {
    "stars": 5,
    "text": "Two weeks of sticking with the program, and the difference is night and day. My relationship has never been better.",
    "name": "Anonymous",
    "day": 21,
    "verified": true,
    "avatar": "🔒"
  },
  {
    "stars": 5,
    "text": "Skeptical at first, but the science-backed approach convinced me. 45 days later, I'm a believer. 3x improvement.",
    "name": "David K.",
    "day": 45,
    "verified": true,
    "avatar": "D"
  },
  {
    "stars": 5,
    "text": "The daily exercises take 10 minutes max. Small commitment, massive results. Wish I found this years ago.",
    "name": "Anonymous",
    "day": 60,
    "verified": true,
    "avatar": "🔒"
  },
  {
    "stars": 4,
    "text": "Progress tracking keeps me accountable. Seeing my control score go up week after week is incredibly motivating.",
    "name": "Chris M.",
    "day": 30,
    "verified": true,
    "avatar": "C"
  }
]
```

### Section Header

```html
<p class="section-label">REAL RESULTS</p>
<h2>Join 50,000+ men transforming their lives</h2>
<p class="section-subtitle">See what users are saying about their Lastr' journey</p>

<!-- Stats row -->
<div class="stats-row">
  <div class="stat"><span class="value">94%</span><span class="label">Success Rate</span></div>
  <div class="stat"><span class="value">4.8</span><span class="label">App Rating</span></div>
  <div class="stat"><span class="value">50K+</span><span class="label">Men Helped</span></div>
</div>
```

### Layout Options

**Horizontal scroll (mobile):**
```css
.reviews-container {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.review-card { scroll-snap-align: start; flex-shrink: 0; }
```

**Grid (desktop):**
```css
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}
```

**Marquee (auto-scroll):** Two rows scrolling opposite directions, pause on hover.

---

## Key Messaging Points

### Education/Problem Awareness

1. **"Not only a bedroom issue"**
   Most men don't realize how deeply PE impacts their daily life and mental health.

2. **"It shatters sex drive"**
   Men with PE are 3x more likely to avoid intimacy altogether.

3. **"It hurts relationships"**
   80% of men believe their partner feels unsatisfied.

4. **"It's a vicious circle"**
   Performance anxiety leads to poor performance, which leads to more anxiety.

5. **"But it can be fixed"**
   With the right training, lasting longer is a learnable skill.

### Solution Messaging

- "Science-backed, not gimmicks"
- "Just minutes a day"
- "Track real progress, see real results"
- "Personalized to your specific needs"
- "100% private and discreet"

---

## Trust Elements

### Guarantees to Display

1. **7-day money-back guarantee**
2. **Secure & encrypted payment**
3. **100% private & discreet** (no embarrassing charges, anonymous app icon option)

### Credibility Markers

- Science-backed methodology
- Based on clinical research
- Exercises recommended by urologists/therapists
- 50K+ men already helped

---

## Pricing Structure

| Plan | Price | Notes |
|------|-------|-------|
| Weekly | $9.99/week | Recurring |
| Lifetime | $79.99 | One-time payment, best value |

**Paywall Features to Highlight:**
- 90-Day Transformation Program
- Progress Tracking
- AI Coaching Support (24/7 personalized guidance)
- Community Access (50K+ men)
- Lifetime Updates (new content weekly)

---

## User Journey Highlights

Show the transformation:

1. **Day 1:** Take assessment, get personalized plan
2. **Week 1:** Learn foundational exercises, build habit
3. **Week 3:** Start seeing measurable improvements
4. **Day 45:** Major milestone, significant control gains
5. **Day 90:** Complete transformation, lasting confidence

---

## App Screenshots to Feature

1. **Dashboard** - Control score ring, progress overview
2. **Today View** - Daily tasks with checkboxes
3. **Exercise Detail** - Step-by-step instructions
4. **Progress Graph** - Improvement visualization
5. **Check-in Modal** - Weekly progress tracking

---

## Call-to-Action Ideas

- "Start Your 90-Day Transformation"
- "Take the Free Assessment"
- "Get Your Personalized Plan"
- "Download Free on iOS"
- "Join 50,000+ Men Already Improving"

---

## Tone of Voice

- **Confident but not cocky**
- **Empathetic but not pitying**
- **Scientific but accessible**
- **Discreet and respectful**
- **Results-focused**
- **Empowering, not shaming**

Avoid:
- Crude or vulgar language
- Shaming or embarrassing copy
- Over-promising ("instant results")
- Medical claims without backing

---

## Technical Notes

- **Platform:** iOS (App Store)
- **Download:** Free to download, premium subscription
- **Requirements:** iPhone with iOS 15+

---

## Landing Page Section Suggestions

1. **Hero** - Bold headline, subheadline, CTA, app mockup
2. **The Problem** - Statistics about PE, relatable pain points
3. **The Solution** - How Lastr' works (3-step process)
4. **Features** - Key app features with visuals
5. **The Science** - Why it works, credibility
6. **Results** - Social proof, testimonials, stats
7. **Pricing** - Plans with feature comparison
8. **FAQ** - Common questions
9. **Final CTA** - Strong closing with guarantees

---

## Files & Resources

- Logo: `/assets/images/logo_nobg.png`
- Colors: `/constants/Colors.ts`
- Typography: `/constants/Typography.ts`
- Exercise data: `/constants/exercises.ts`
- Full app source: This repository

---

## Animated Logo Loader (Recreation Specs)

The app has a custom animated "Lastr'" logo loader. Here's how to recreate it for web:

### Visual Description

The logo displays "Lastr'" where the apostrophe is a **white teardrop/drop shape** rotated -135 degrees (so it looks like a stylized apostrophe). The animation reveals each letter one by one with a subtle bounce.

### Logo Structure

```
L a s t r '
         ↑
    (teardrop icon, not a text apostrophe)
```

### The Drop/Apostrophe SVG

```svg
<svg width="14" height="18" viewBox="0 0 24 30" style="transform: rotate(-135deg)">
  <path d="M12 0C12 0 2 12 2 19C2 24.5 6.5 29 12 29C17.5 29 22 24.5 22 19C22 12 12 0 12 0Z" fill="#FFFFFF"/>
</svg>
```

Scale the SVG to approximately 22% width and 28% height of the font size.

### Typography

- **Font:** Aeonik Black (or fallback: Inter Bold/Black, or any heavy geometric sans-serif)
- **Color:** `#FFFFFF` (white)
- **Letter Spacing:** -1.5px (tight)
- **Base Font Size:** 52px (adjustable)

### Animation Sequence

**Phase 1: Container Fade-In (0-400ms)**
- Entire logo container fades from 0 to 1 opacity
- Scales from 0.85 to 1 with spring easing
- Translates up from 15px to 0 (subtle rise)

**Phase 2: Staggered Letter Reveal (150ms - 650ms)**
Each letter animates individually with 70ms delay between them:

| Element | Start Time | Animation |
|---------|------------|-----------|
| L | 150ms | Fade in + slide up from 14px |
| a | 220ms | Fade in + slide up from 14px |
| s | 290ms | Fade in + slide up from 14px |
| t | 360ms | Fade in + slide up from 14px |
| r | 430ms | Fade in + slide up from 14px |
| ' (drop) | 500ms | Fade in + slide up from 10px + scale from 0.6 to 1 |

- Each letter fade duration: 350ms with ease-out-cubic
- Each letter slide: spring animation (damping: 12, stiffness: 100)

**Phase 3: Loading State (after 900ms, loops forever)**
- Gentle "breathing" scale animation: 1 → 1.025 → 1
- Duration: 1400ms each direction
- Easing: ease-in-out
- Loops infinitely

### Loading Bar (Optional)

A small purple bar appears below the logo during loading:
- **Width:** 50px
- **Height:** 3px
- **Color:** `#8B5CF6`
- **Border Radius:** 1.5px
- **Animation:** Scales horizontally from 0.2 to 1 and back, with opacity varying (0.5 → 1 → 0.8)
- **Duration:** 1000ms each direction, loops infinitely
- **Appears:** After 700ms delay

### CSS/JS Implementation Hints

```css
/* Container */
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Letters container */
.logo-text {
  display: flex;
  align-items: center;
  font-family: 'Aeonik', 'Inter', sans-serif;
  font-weight: 900;
  font-size: 52px;
  color: #FFFFFF;
  letter-spacing: -1.5px;
}

/* Drop icon positioning */
.drop-icon {
  margin-left: 2px;
  margin-top: 15px; /* Aligns to top of letters */
  align-self: flex-start;
}

/* Breathing animation */
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.025); }
}

.logo-container.loading {
  animation: breathe 2.8s ease-in-out infinite;
}

/* Loading bar */
@keyframes loadingBar {
  0%, 100% { transform: scaleX(0.2); opacity: 0.5; }
  50% { transform: scaleX(1); opacity: 1; }
}

.loading-bar {
  width: 50px;
  height: 3px;
  background: #8B5CF6;
  border-radius: 1.5px;
  animation: loadingBar 2s ease-in-out infinite;
}
```

### For GSAP/Framer Motion

Use a timeline with staggered animations:
1. Fade in container (0.4s)
2. Stagger each letter with 0.07s delay, animating opacity and y position
3. Add breathing loop after initial animation completes

### Background

- **Color:** `#0A0A0F` (near black)
- Optional: subtle purple radial glow behind logo using `rgba(139, 92, 246, 0.15)`

---

*Document created for Lastr' landing page development*
