# MOSI — Feature Guide & User Flows

> **MOSI** stands for **Meeting · Opportunity · Strategic · Intelligence**
> A platform that turns stakeholder conversations into strategic, actionable reports.

---

## Table of Contents

1. [What MOSI Does](#what-mosi-does)
2. [User Roles](#user-roles)
3. [Getting Started](#getting-started)
4. [Core Workflow](#core-workflow)
5. [Features in Detail](#features-in-detail)
6. [Admin Portal](#admin-portal)
7. [Team Collaboration](#team-collaboration)
8. [AI Pipeline](#ai-pipeline)
9. [Data & Export](#data--export)

---

## What MOSI Does

MOSI helps researchers conduct stakeholder discovery interviews and turn them into structured business intelligence. Instead of just recording a meeting and forgetting about it, MOSI:

- Guides you through structured questions during the interview (CEED framework)
- Records the audio
- Transcribes it automatically (supports Kannada, Hindi, English, and 29+ languages)
- Generates a structured English summary using AI
- Lets you review, edit, and publish a final report
- Shares it with stakeholders and your team

---

## User Roles

| Role | Access |
|------|--------|
| **Researcher** (normal) | Record interviews, manage stakeholders, review & publish sessions, team collaboration |
| **Admin** | Everything above + admin dashboard, user management, team oversight, analytics, bulk operations |

---

## Getting Started

### First-time user:
1. Sign up at `/signup` (email + password or Google OAuth)
2. You land on the **Dashboard** — it's empty at first
3. Two ways to start:
   - **Quick Record** — Jump straight into recording, fill details later
   - **New Session** — Full setup wizard with stakeholder details first

### Returning user:
1. Login → Dashboard shows your sessions, stats, and recent activity
2. If you're in a team, you'll see your teammates' sessions too

---

## Core Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Quick Record  ──►  Live Recording  ──►  Review Page       │
│        OR                                     │             │
│   Setup Wizard  ──►  Live Recording  ──►  Review Page       │
│                                               │             │
│                                        Fill stakeholder     │
│                                        Edit transcript      │
│                                        Edit summary         │
│                                        Add notes            │
│                                               │             │
│                                        Publish Report       │
│                                               │             │
│                                        Preview Page         │
│                                        (Share / PDF / Email)│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Flow A: Quick Record (fastest)
1. Click **Quick Record** from dashboard or sidebar
2. Microphone permission is requested
3. Hit the blue Play button to start recording
4. Use CEED quadrant buttons to switch interview topics
5. Tap **Log** to capture key moments with timestamps
6. Hit the red Stop button when done
7. Session saves automatically → redirected to Review page
8. Fill in stakeholder details (name, company, etc.) at your own pace

### Flow B: Full Setup
1. Click **New Session** → Setup wizard opens
2. Step 1: Enter stakeholder details (name, role, phone, email)
3. Step 2: Enter company details (company name, sector, size)
4. Step 3: Configure settings + customize CEED questions
5. Click **Start Discovery** → Live recording begins
6. Same recording flow as above

---

## Features in Detail

### Dashboard (`/`)
- Stats overview: Sessions, Insights, Stakeholders, In Review
- Team badge (if you're in a team)
- Recent sessions list with status indicators
- Quick Record + New Session buttons

### Live Recording (`/interview/live`)
- Real-time audio recording with waveform visualizer
- CEED quadrant selector (Core / Efficiency / Expansion / Disrupt)
- Dynamic question prompts that update per quadrant
- Mark questions as answered (auto-advances to next)
- **Capture Log** — one-tap to save a timestamped highlight
- **Attach Evidence** — add images, videos, links, or files during the interview
- Pause/Resume support
- Timer showing elapsed time

### Review Page (`/review`)
- **Stakeholder Details** — Collapsible section to add/edit details after recording
- **Audio Player** — Play back the recording with skip controls
- **Interview Timeline** — All captured logs shown with timestamps, quadrant tags
- **Edit Highlights** — Click any log entry to edit title, description, skills, timeline
- **Evidence Gallery** — View all attached files/images
- **Transcript** — Word-for-word transcription (editable)
- **Executive Summary** — AI-generated structured summary (editable)
- **Session Notes** — Personal notes field
- **Generate Transcript & Summary** button — sends audio to AI pipeline
- **Publish Final Report** — runs through a checklist then generates the report

### Preview/Published Report (`/preview`)
- Clean stakeholder-facing view of the final report
- Opportunity cards with approve/reject gates
- Audio playback
- **Share** — Copy link to clipboard
- **PDF Export** — Download formatted PDF report
- **Email** — Send briefing email to stakeholder
- **Edit** — Go back to review page to make changes
- Guest access — stakeholders can view without logging in

### Interviews Archive (`/interviews`)
- Grid/list of all sessions
- Search by name or company
- Filter by status (All / Review / Published)
- **Load More** pagination (12 per page)
- **CSV Export** — Download all sessions as spreadsheet
- New Stakeholder button

### Stakeholder Registry (`/stakeholders`)
- All your stakeholders in one place
- Search by name, company, sector, or role
- **Add New** — Create stakeholders independently (no interview required)
- **Edit** — Full edit modal with company autocomplete
- **Share** — Share stakeholder details via native share or clipboard
- **Delete** — Remove stakeholder and associated data
- Shows interview count per stakeholder

### Schedule / Chronology (`/schedule`)
- Interactive calendar with real month navigation
- Highlights days that have sessions
- Upcoming vs Completed toggle
- Session list with date, stakeholder, company, location
- Schedule new sessions via setup wizard

### Profile (`/profile`)
- View and edit your name, role, department, bio
- Avatar selection (DiceBear presets)
- Contact details (email, phone, LinkedIn)
- Stats: total sessions, insights, published reports
- Sign out

### Settings (`/settings`)
- **General** — Interface language preference
- **AI Models** — Choose summary model (NVIDIA Nemotron / None)
- **Recording** — Audio quality (low/medium/high)
- **Notifications** — Toggle alerts for publish and assignment
- All preferences saved to localStorage

---

## Admin Portal

Accessible at `/admin` (requires admin role).

### Dashboard Tab
- KPI cards: Total Sessions, Insights, Stakeholders, Published, In Review, Users
- Platform Flow: Publish ratio, Review velocity, Session saturation
- Teams Overview: Users count, Teams count, Pending sessions
- **Analytics Panel:**
  - Sessions over time (8-week bar chart)
  - CEED framework distribution (which quadrants are used most)
  - Average duration, publish rate, recordings count, transcribed count
  - Top stakeholders (most interviewed)
  - Incomplete sessions alert (missing data)
  - System health (API connections status)
  - Export all data as CSV

### Sessions Tab
- Full list of ALL sessions across all users
- Search + status filter
- Multi-select checkboxes for bulk operations
- **Bulk Assign** — Assign multiple sessions to a user
- Session detail panel with full stakeholder dossier, opportunities, evidence, audio
- Publish / Delete / Reassign individual sessions

### Stakeholders Tab
- All stakeholders across the platform
- Expandable cards with contact info, company details, session history

### Companies Tab
- Aggregated view by company
- Shows session count, stakeholder count, insight count per company

### Users Tab
- All registered users with expandable profile cards
- Session count, insight count, published count per user
- Professional details, LinkedIn, bio

### Teams Tab
- **Team Management:**
  - Invite researchers (by email)
  - Change roles (admin/normal)
  - Deactivate accounts
  - Workload balancer (flags overloaded/underloaded users)
- **All Teams view:**
  - Team stats (total teams, total members, average size)
  - Each team with members listed
- **Activity Log:**
  - Recent actions (who created/completed/published what)
  - Scrollable feed with timestamps

---

## Team Collaboration

### How Teams Work
1. Any user can create a team from `/team`
2. The creator becomes the team **owner**
3. Owner can add members by email (they must have an account)
4. Owner can remove members
5. Members can leave voluntarily

### What's Shared
Once you're in a team, you automatically see:
- All team members' sessions on your dashboard and archive
- All team members' stakeholders in your registry
- All team members' organizations

This happens transparently — no extra steps needed. The data merges into your existing views.

### Team Page (`/team`)
- Create new teams
- View your teams and members
- Add/remove members (owner only)
- Leave teams (member)
- Delete teams (owner)

---

## AI Pipeline

### Transcription (ElevenLabs Scribe)
- Supports 29+ languages including Kannada, Hindi, Tamil, English
- Auto-detects the language — no configuration needed
- Returns word-for-word transcript
- The transcript is editable after generation

### Summarization (NVIDIA Nemotron)
- Takes the transcript (any language) and generates English summary
- Structured output with sections:
  - Meeting Overview
  - Key Discussion Points
  - Opportunities Identified (mapped to CEED)
  - Action Items & Next Steps
  - Notable Quotes (translated to English)
- The summary is editable after generation
- Can skip summary generation (settings → AI Models → None)

### How to Trigger
- Go to the Review page for any session
- Click **"Generate Transcript & Summary"**
- Wait ~15-30 seconds
- Both transcript and summary populate in their respective fields
- Toast notification confirms success

---

## Data & Export

### PDF Export
- Available on the Preview page after publishing
- Generates a formatted PDF with:
  - Header + date
  - Stakeholder info
  - Session metadata (duration, status)
  - Executive summary
  - Full transcript
  - All opportunities with details
- Downloads as `MOSI_Report_{name}_{date}.pdf`

### CSV Export
- Available on the Interviews archive page
- Exports all sessions with columns:
  - Date, Stakeholder, Company, Sector, Status, Duration, Opportunities, Summary
- Downloads as `mosi_sessions_export.csv`
- Admin can also export from the admin dashboard

### JSON Export
- Available programmatically for individual sessions
- Full session data structure

---

## Keyboard Shortcuts & Tips

- **During recording:** The question list auto-advances when you mark one as answered
- **Review page:** Transcript and summary auto-save when you click away (blur)
- **Stakeholder form:** Company field has autocomplete from existing records
- **Mobile:** Use the hamburger menu to access sidebar navigation
- **iOS users:** Record in Chrome or Safari — audio saves as MP4 format for compatibility

---

## Technical Notes (for developers)

- Built with Next.js 16 + TypeScript + Tailwind CSS
- State management: Zustand with localStorage persistence
- Database: Supabase (PostgreSQL + Row Level Security)
- Auth: Supabase Auth (email/password + Google OAuth)
- Storage: Supabase Storage (recordings + evidence buckets)
- Transcription: ElevenLabs Scribe API
- Summarization: NVIDIA Nemotron (Llama 3.3 Super 49B) via OpenAI SDK
- PDF: jsPDF (client-side generation)
- Animations: Framer Motion
- Icons: Lucide React

---

*Last updated: June 2025*
