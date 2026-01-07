# Lastr UX Roadmap

## Current State Assessment

The app has a **beautifully designed conversion funnel** with solid psychological principles. The onboarding is impressive - personalization, social proof, and emotional journey are well-crafted.

**Core Problem:** The app is optimized for **conversion**, not **retention**. After Day 3, users get:
- 6 static tasks per day
- A control score that never meaningfully changes
- A streak counter
- Text-based exercise instructions

No journey. No progression. No reason to open the app on Day 47.

---

## Priority 1: Real Progress Tracking (THE 10x FEATURE)

### The Problem

The control score is calculated once during onboarding and never updates meaningfully. Users have no evidence the app works. They'll churn.

### The Solution

Make the control score a **living metric** that reflects real progress.

#### Weekly Check-ins

Prompt users weekly (or after intimacy events) with simple questions:

```
"How did this week go?"

1. How long did you last on average?
   - Less than 1 minute
   - 1-2 minutes
   - 2-5 minutes
   - 5-10 minutes
   - 10-15 minutes
   - 15+ minutes

2. How in control did you feel? (1-10 slider)

3. How confident are you feeling? (1-10 slider)
```

#### Score Update Algorithm

The control score should update based on:
- **Duration improvement** (primary metric, weighted 50%)
- **Perceived control** (weighted 25%)
- **Confidence** (weighted 25%)
- **Consistency bonus** (streak multiplier)

#### Progress Visualization

- **Trend graph**: Line chart showing score over weeks
- **Milestone markers**: "You've improved 40% since starting!"
- **Before/After comparison**: Week 1 stats vs. current stats

#### Celebration Moments

- Score increases → Confetti animation + haptic
- Hit milestones (50, 60, 70, 80, 90) → Achievement unlocked
- Reach "target" score → Major celebration screen

### Implementation Scope

1. Add `progressHistory` array to userStore (date, score, duration, control, confidence)
2. Create weekly check-in modal component
3. Build progress graph component (react-native-chart-kit or victory-native)
4. Add score recalculation logic
5. Create milestone/achievement system
6. Update dashboard to show trend, not just current score

---

## Priority 2: Urgency Events ("Quick Prep" Mode)

### The Problem

Users need the app most **before intimacy**. Currently, there's nothing for that critical moment. The app is only useful during "training time," not when it matters most.

### The Solution

A dedicated **"Quick Prep"** feature for pre-intimacy moments.

#### Quick Prep Flow

**Entry Point:** Prominent button on dashboard or dedicated tab

**The Routine (3-5 minutes):**

1. **Breathing Reset** (90 seconds)
   - Guided 4-4-8 breathing with audio/visual cues
   - Calms nervous system, reduces anxiety
   - Simple animation: expanding/contracting circle

2. **Control Visualization** (60 seconds)
   - Guided mental rehearsal
   - "Imagine yourself in control..."
   - Calm, confident voiceover (or text with timing)

3. **Quick Kegels** (60 seconds)
   - 10 quick contractions
   - Activates PC muscle awareness
   - Simple timer with "squeeze... release" prompts

4. **Confidence Affirmation** (30 seconds)
   - 3 affirmations displayed
   - "You've trained for this"
   - "You are in control"
   - "Take your time, enjoy the moment"

**Exit Screen:**
- "You're ready. Go enjoy yourself."
- Option: "Log how it went later" (sets reminder)

#### Post-Intimacy Logging

After using Quick Prep, prompt user (next app open or notification):

```
"How did it go?"

Duration: [slider or options]
Control level: [1-10]
Notes: [optional text]

→ This feeds directly into Progress Tracking
```

#### Quick Prep Variations

- **"I have 1 minute"** → Just breathing
- **"I have 3 minutes"** → Breathing + visualization
- **"I have 5 minutes"** → Full routine

### Implementation Scope

1. Create `/quick-prep` screen with guided flow
2. Build breathing animation component (expanding circle)
3. Add visualization/affirmation screens with timed transitions
4. Create post-session logging modal
5. Add "Quick Prep" button to dashboard
6. Connect logs to progress tracking system

---

## Future Priorities (Not Now)

### Priority 3: Difficulty Progression

Tasks should get harder as user advances through 90 days:
- Week 1-2: Basic kegels (3 sets × 10 reps, 3 sec hold)
- Week 3-4: Intermediate (3 sets × 15 reps, 5 sec hold)
- Week 5+: Advanced (3 sets × 20 reps, 10 sec hold)

### Priority 4: Guided Audio Exercises

Voice-guided workouts instead of text instructions:
- Timer with audio cues for kegels
- Guided breathing with calming voice
- Background music/ambient sounds

### Priority 5: Push Notifications

- Daily training reminders
- Streak warning ("Don't lose your streak!")
- Weekly check-in prompts
- Milestone celebrations

### Priority 6: Partner Mode

- Communication scripts for talking to partners
- Partner exercises (sensate focus framing)
- Optional progress sharing

### Priority 7: Community Interactivity

- Real posts, replies, upvotes
- Success story submissions
- Anonymous Q&A

---

## Success Metrics

### Retention
- Day 7 retention: Target 60%+
- Day 30 retention: Target 40%+
- Day 90 completion: Target 25%+

### Engagement
- Weekly check-in completion: Target 70%+
- Quick Prep usage: Target 2x/week average
- Daily task completion: Target 80%+

### Outcomes
- Average score improvement: Target +30 points over 90 days
- User-reported duration improvement: Target 3x baseline
- App Store rating: Target 4.8+

---

## Implementation Order

### Phase 1: Progress Tracking (Start Here)
1. ✅ Add progress history to store
2. ✅ Build weekly check-in modal
3. ✅ Create score update algorithm
4. ✅ Build progress graph component
5. ✅ Add milestone system
6. ✅ Update dashboard with trends

### Phase 2: Quick Prep Mode
1. Create Quick Prep screen
2. Build breathing animation
3. Add visualization flow
4. Create post-session logger
5. Connect to progress tracking

---

*Last updated: January 2025*
