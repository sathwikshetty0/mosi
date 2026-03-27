# MOSI | Interview Intelligence Engine

**Advanced discovery framework for strategic stakeholder synthesis.**

![Premium Interface Preview](https://img.shields.io/badge/UI-Premium--Minimalist-blue?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-Next.js%2015%20%7C%20Supabase%20%7C%20Zustand-black?style=for-the-badge)
![Responsiveness](https://img.shields.io/badge/Mobile-Fully--Optimized-emerald?style=for-the-badge)
![AI Capability](https://img.shields.io/badge/AI-Whisper--4o--Synthesis-purple?style=for-the-badge)

MOSI (Meeting Opportunity & Strategic Insight) is a high-performance web discovery platform designed to convert raw stakeholder dialogues into structured, actionable strategic artifacts. Built on the proprietary **CEED Framework**, MOSI enables elite researchers to capture, synthesize, and publish professional-grade intelligence archives with absolute precision across any device format.

---

## 🧭 The CEED Methodology

MOSI's core architecture is built around four proprietary discovery quadrants:

*   **CORE**: Foundational diagnostics, current product status, and immediate operational challenges.
*   **EFFICIENCY**: Identification of systemic bottlenecks and high-impact resource optimization targets.
*   **EXPANSION**: Uncovering market-adjacent growth vectors and strategic partnership opportunities.
*   **DISRUPT**: Forensic analysis of high-stakes innovation threats and industry-shifting vectors.

---

## ⚡ Key Intelligence Modules

### 1. Adaptive Live Discovery Engine
A real-time interview interface that scales seamlessly from desktop command stations to mobile field-capture:
*   **Dynamic Viewport Tracking**: Optimized `100dvh` layout with full support for safe-area insets on notched mobile devices.
*   **Active Question Stream**: Real-time prompt guidance tailored dynamically to the selected CEED quadrant.
*   **Instant Synthesis**: One-tap logging for strategic opportunities and evidence (Images, Documents, Links, Video).
*   **Chronology Tracker**: A visual timeline for tracking discovery momentum and session duration.

### 2. AI-Powered Synthesis Workspace
The bridge between raw forensic data and high-impact executive reporting:
*   **Automated Transcription**: Seamless conversion of session audio into hyper-accurate, searchable transcripts via OpenAI Whisper.
*   **Executive Summation**: AI-distilled high-level summaries that extract the essential strategic pillars from hours of dialogue.
*   **Opportunity Tuning**: A granular register to refine, score, and categorize findings before publication.

### 3. Unified Admin Command Center
Elite-level oversight and architectural data management:
*   **Global Insight Repository**: Centralized access to all research sessions, artifacts, and stakeholder histories.
*   **Researcher Performance Analytics**: Real-time activity monitoring and contribution tracking for the entire discovery team.
*   **Stakeholder Registry**: A comprehensive database for maintaining a unified customer and stakeholder network.
*   **High-Density Dashboard**: A dedicated administrative interface optimized for platform-level oversight.

### 4. Executive Preview & Validation
Secure reporting portals designed for professional impact:
*   **Secure Stakeholder Gates**: Item-level verification where participants can approve, hide, or refine findings.
*   **PRD Auto-Drafting**: Instant technical requirement generation directly from the discovery feed.
*   **Elite Branding**: Consistent, high-contrast industrial aesthetics that command professional authority.

---

## 🛠 Enterprise Tech Stack

*   **Logic Hub**: [Next.js 15](https://nextjs.org/) (App Router & Turbopack)
*   **Infrastructure**: [Supabase](https://supabase.com/) (PostgreSQL + RLS + Storage + Auth)
*   **Persistence**: [Zustand](https://github.com/pmndrs/zustand) (Persistent Local-to-Cloud Store)
*   **Aesthetics**: Vanilla CSS + Tailwind Utility Overlays + Framer Motion
*   **Cognition**: OpenAI (GPT-4o & Whisper-1)
*   **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   Supabase Account (for Database, Auth, and Storage)
*   OpenAI API Key (for Synthesis & Transcription)

### Installation

1. **Clone the Infrastructure**:
   ```bash
   git clone https://github.com/sathwikshetty0/mosi.git
   cd mosi
   ```

2. **Initialize Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Launch Discovery Console**:
   ```bash
   npm run dev
   ```

5. **Initiate First Session**:
   Navigate to [http://localhost:3000](http://localhost:3000) to start your first CEED discovery flight.

---

## 🛡 Security & Privacy
MOSI utilizes a **Cloud-Synced Secure Buffer** architecture powered by Supabase. All stakeholder dialogues are protected by Row Level Security (RLS) and encrypted transport layers, ensuring that sensitive strategic intelligence remains private and compliant throughout the synthesis cycle.

---

## 📝 License
Copyright © 2026 MOSI Intelligence Team. All Rights Reserved. For professional discovery and strategic synthesis only.
