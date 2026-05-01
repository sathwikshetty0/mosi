<div align="center">

```
███╗   ███╗ ██████╗ ███████╗██╗
████╗ ████║██╔═══██╗██╔════╝██║
██╔████╔██║██║   ██║███████╗██║
██║╚██╔╝██║██║   ██║╚════██║██║
██║ ╚═╝ ██║╚██████╔╝███████║██║
╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝
```

**Meeting · Opportunity · Strategic · Intelligence**

*Turn stakeholder conversations into strategic artifacts — in real time.*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

</div>

---

## What is MOSI?

MOSI is a **stakeholder interview intelligence platform** built for researchers who need more than a recording. It captures live interviews through the proprietary **CEED Framework**, transcribes and synthesizes them with AI, and delivers polished executive reports — all in a single workflow.

```
Interview  ──►  Capture  ──►  Synthesize  ──►  Publish
  (Live)         (CEED)         (GPT-4o)       (Report)
```

---

## The CEED Framework

Every discovery session is structured around four strategic quadrants:

| Quadrant | Focus |
|---|---|
| **C** — Core | Foundational diagnostics, current product state, immediate pain points |
| **E** — Efficiency | Systemic bottlenecks, resource waste, operational drag |
| **E** — Expansion | Adjacent growth vectors, partnership opportunities, market gaps |
| **D** — Disrupt | High-stakes innovation threats, industry-shifting signals |

The live interface surfaces context-aware questions dynamically as you switch quadrants during the interview.

---

## Features

### Live Discovery Engine
- Real-time interview capture with waveform visualizer and elapsed timer
- Dynamic CEED quadrant selector with auto-updating question prompts
- One-tap logging of opportunities tagged to the exact moment in the recording
- Evidence capture — images, videos, links, and files attached inline

### AI Synthesis Workspace
- Automatic audio transcription via OpenAI Whisper / ElevenLabs Scribe
- GPT-4o generated executive summaries from raw transcripts
- Opportunity scoring across 4 dimensions: Clarity · Awareness · Attempts · Intensity
- Paragraph-level transcript status control (Approved / Hidden / Pending)

### Executive Reporting Portal
- Stakeholder-facing preview with item-level approve/reject gates
- PRD auto-drafting directly from the discovery feed
- Shareable links with published session archives

### Admin Command Center
- Global session repository with full team visibility
- Researcher activity analytics and contribution tracking
- Stakeholder registry (customer database with deduplication)
- Session assignment and bulk management

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router + Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + Framer Motion |
| State | Zustand 5 with localStorage persistence |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password + OAuth) |
| Storage | Supabase Storage (audio recordings) |
| AI | OpenAI GPT-4o + Whisper-1 / ElevenLabs Scribe |
| UI Primitives | Radix UI + Lucide React |
| Validation | Zod |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project (database, auth, storage)
- An [OpenAI](https://platform.openai.com/) API key

### Setup

```bash
# 1. Clone
git clone https://github.com/sathwikshetty0/mosi.git
cd mosi

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key   # optional, for ElevenLabs transcription
```

```bash
# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start your first session.

---

## Project Structure

```
src/
├── app/
│   ├── interview/live/   # Live recording interface
│   ├── review/           # AI synthesis workspace
│   ├── preview/          # Stakeholder report portal
│   ├── admin/            # Admin command center
│   ├── setup/            # Session + stakeholder setup
│   └── api/              # Serverless API routes
├── lib/
│   ├── store.ts          # Zustand store (local + Supabase sync)
│   ├── supabase.ts       # Supabase client config
│   └── auth-context.tsx  # Auth state provider
└── components/           # Shared UI components
```

---

## Security

- **Row Level Security (RLS)** enforced on all Supabase tables — users only see their own data
- **JWT via httpOnly cookies** — tokens never exposed to JavaScript
- **Role-based access control** — admin routes server-verified
- **Environment variables** — all secrets stay server-side, never bundled to the client

> Never commit `.env.local` to version control.

---

## License

Copyright © 2026 MOSI Intelligence (Sathwik Shetty ). All rights reserved.
