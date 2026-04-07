# Bet.AI - Graphic Identity & Design System

## Overview

**App Name:** Bet.AI
**Type:** Sports betting analytics app
**Style:** Dark, premium, tech-forward with glass morphism effects
**Primary Accent:** Cyan/Teal (#00D7D7)

---

## Color Palette

### Core Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary (Cyan)** | `#00D7D7` | CTAs, accents, links, highlights, glows |
| **Background** | `#0D0F14` | Main dark background (deep blue-black) |
| **Foreground** | `#F5F8FC` | Primary text (off-white) |
| **Card** | `#161A22` | Card backgrounds, elevated surfaces |
| **Secondary** | `#212733` | Secondary buttons, subtle backgrounds |
| **Muted** | `#272E3A` | Borders, input backgrounds, dividers |
| **Muted Text** | `#7A8BA3` | Secondary text, placeholders |
| **Success** | `#22C55E` | Positive trends, profits, wins |
| **Error** | `#EF4444` | Losses, errors, negative trends |

### Opacity Variants

```css
--primary-10: rgba(0, 215, 215, 0.1);
--primary-15: rgba(0, 215, 215, 0.15);
--primary-20: rgba(0, 215, 215, 0.2);
--primary-25: rgba(0, 215, 215, 0.25);
--primary-30: rgba(0, 215, 215, 0.3);
--glass-bg: rgba(22, 26, 34, 0.8);
--glass-border: rgba(39, 46, 58, 0.5);
```

---

## Typography

### Font Family
**Aeonik** (primary font for everything)
- Light (300)
- Regular (400)
- Medium (500)
- Semibold (600)
- Bold (700)
- Black (900)

**Fallback:** Inter, system sans-serif

### Type Scale

| Token | Size | Usage |
|-------|------|-------|
| xs | 12px | Captions, badges |
| sm | 14px | Secondary text, inputs |
| base | 16px | Body text |
| lg | 18px | Large body |
| xl | 20px | Subheadings |
| 2xl | 24px | Card titles |
| 3xl | 30px | Section headers |
| 4xl | 36px | Stats, large numbers |
| 6xl | 60px | Hero headlines |

### Text Styles

```css
h1 { font-size: 32px; font-weight: 700; line-height: 40px; }
h2 { font-size: 24px; font-weight: 700; line-height: 32px; }
h3 { font-size: 20px; font-weight: 500; line-height: 28px; }
body { font-size: 16px; font-weight: 400; line-height: 24px; }
caption { font-size: 14px; font-weight: 400; line-height: 20px; }
```

---

## Spacing & Layout

### Spacing Scale (4px base)

| Token | Value |
|-------|-------|
| 1 | 4px |
| 2 | 8px |
| 3 | 12px |
| 4 | 16px |
| 5 | 20px |
| 6 | 24px |
| 8 | 32px |
| 10 | 40px |
| 12 | 48px |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 8px | Small buttons |
| md | 10px | Inputs, small cards |
| lg | 12px | Buttons, standard cards |
| xl | 16px | Glass cards, modals |
| full | 9999px | Pills, badges, avatars |

---

## Gradients & Effects

### Glass Morphism (Signature Effect)

```css
.glass-card {
  background: rgba(22, 26, 34, 0.8);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(39, 46, 58, 0.5);
  border-radius: 16px;
}
```

### Hero Background Gradient

```css
.hero-bg {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(0, 194, 224, 0.15) 0%,
    rgba(12, 12, 12, 0) 70%
  );
}
```

### Page Background

```css
body {
  background: linear-gradient(
    to bottom right,
    #0D0F14,
    #0D0F14,
    rgba(0, 215, 215, 0.05)
  );
}
```

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(75deg, #ffffff, #a9a9a9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

### Progress Bar Gradient

```css
.progress-fill {
  background: linear-gradient(90deg, #00DDFF, #0BFF13);
}
```

---

## Shadows & Glows

| Effect | CSS |
|--------|-----|
| **Button Glow** | `0 10px 15px -3px rgba(0, 215, 215, 0.25)` |
| **Intense Glow** | `0 0 40px rgba(0, 215, 255, 0.5)` |
| **Card Hover** | `0 10px 40px rgba(0, 200, 255, 0.1)` |
| **Stat Glow** | `0 0 40px -10px rgba(0, 215, 215, 0.3)` |
| **Navbar CTA** | `0 0 20px rgba(0, 215, 255, 0.15)` |
| **Subtle** | `0 1px 2px rgba(0, 0, 0, 0.05)` |
| **Modal** | `0 25px 50px -12px rgba(0, 0, 0, 0.25)` |

---

## Button Styles

### Primary Button (Cyan CTA)

```css
.btn-primary {
  background: #00D7D7;
  color: #0D0F14;
  font-size: 16px;
  font-weight: 600;
  height: 55px;
  padding: 0 16px;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 215, 215, 0.25);
}

.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: 0 0 40px rgba(0, 215, 255, 0.5);
}

.btn-primary:disabled {
  opacity: 0.5;
}
```

### Secondary Button

```css
.btn-secondary {
  background: #212733;
  color: #F5F8FC;
  font-size: 16px;
  font-weight: 500;
  height: 55px;
  border: 1px solid rgba(39, 46, 58, 0.5);
  border-radius: 12px;
}

.btn-secondary:hover {
  background: rgba(33, 39, 51, 0.8);
}
```

### Outline Button

```css
.btn-outline {
  background: transparent;
  color: #F5F8FC;
  font-size: 14px;
  font-weight: 500;
  height: 55px;
  border: 1px solid #272E3A;
  border-radius: 12px;
}

.btn-outline:hover {
  background: #212733;
}
```

### Pill Button

```css
.btn-pill {
  background: #00D7D7;
  color: #0D0F14;
  font-size: 14px;
  font-weight: 600;
  height: 40px;
  padding: 0 24px;
  border-radius: 9999px;
}
```

---

## Card Styles

### Glass Card

```css
.card-glass {
  background: rgba(22, 26, 34, 0.8);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(39, 46, 58, 0.5);
  border-radius: 16px;
  padding: 24px;
}

.card-glass:hover {
  border-color: rgba(0, 215, 215, 0.3);
  box-shadow: 0 10px 40px rgba(0, 200, 255, 0.1);
  transform: translateY(-8px);
}
```

### Solid Card

```css
.card-solid {
  background: #161A22;
  border: 1px solid rgba(0, 215, 215, 0.1);
  border-radius: 12px;
  padding: 24px;
}
```

---

## Input Fields

```css
.input {
  background: #0D0F14;
  border: 1px solid #272E3A;
  color: #F5F8FC;
  font-size: 16px;
  height: 40px;
  padding: 8px 12px;
  border-radius: 10px;
}

.input::placeholder {
  color: #7A8BA3;
}

.input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #00D7D7;
}
```

---

## Badges & Indicators

### Badge

```css
.badge {
  background: #00D7D7;
  color: #0D0F14;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 9999px;
}

.badge-secondary {
  background: #212733;
  color: #F5F8FC;
}
```

### Trend Indicator

```css
.trend-positive {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 14px;
}

.trend-negative {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 14px;
}
```

---

## Animations

### Transition Defaults

```css
/* Fast (buttons, hovers) */
transition: all 200ms ease-out;

/* Normal (cards, fades) */
transition: all 300ms ease-out;

/* Slow (page transitions) */
transition: all 500ms ease-out;
```

### Fade In Up

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 500ms ease-out forwards;
}
```

### Pulse Glow

```css
@keyframes pulseGlow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}
```

### Shimmer Loading

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  animation: shimmer 2s infinite linear;
}
```

### Interactive States

```css
/* Hover lift */
.hover-lift:hover {
  transform: translateY(-4px);
}

/* Hover scale */
.hover-scale:hover {
  transform: scale(1.02);
}

/* Press effect */
.active:active {
  transform: scale(0.98);
}
```

---

## Modal / Dialog

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.8);
}

.modal-content {
  background: #0D0F14;
  border: 1px solid #272E3A;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 24px;
  max-width: 448px;
}
```

---

## Toggle / Switch

```css
.switch-track {
  width: 44px;
  height: 24px;
  background: #272E3A;
  border-radius: 9999px;
}

.switch-track.active {
  background: #00D7D7;
}

.switch-thumb {
  width: 20px;
  height: 20px;
  background: #0D0F14;
  border-radius: 9999px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

---

## Scrollbar

```css
/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(122, 139, 163, 0.3) transparent;
}

/* Webkit */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(122, 139, 163, 0.3);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(122, 139, 163, 0.5);
}
```

---

## Design Philosophy

1. **Dark Sophistication** - Deep blue-black (#0D0F14) base for premium tech feel
2. **Cyan Accent** - Vibrant teal (#00D7D7) for attention without harshness
3. **Glass Morphism** - Frosted glass effects on cards for depth and modernity
4. **Subtle Gradients** - Cyan fading into backgrounds for atmosphere
5. **Glow Effects** - Cyan glows on interactive elements for visual feedback
6. **Rounded Corners** - 12-16px radius for approachable, modern feel
7. **Smooth Motion** - Quick 200-300ms transitions, ease-out easing
8. **Clean Typography** - Aeonik font with clear size hierarchy

---

## Summary for Recreation

| Element | Key Value |
|---------|-----------|
| **Background** | `#0D0F14` |
| **Primary Accent** | `#00D7D7` (cyan) |
| **Text** | `#F5F8FC` (white) / `#7A8BA3` (gray) |
| **Cards** | `#161A22` with glass effect |
| **Borders** | `#272E3A` |
| **Font** | Aeonik (or Inter fallback) |
| **Radius** | 12-16px |
| **Signature** | Glass morphism + cyan glows |

---

*Document created for portfolio website development*
