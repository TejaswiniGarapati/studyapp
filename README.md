# FocusMate

> **"Your goals. Your time. Your balance."**

FocusMate is an AI-powered student productivity and life-management platform. It helps students balance university courses, competitive examinations (such as GATE 2027), campus placements, coding/DSA sessions, household chores, meals, personal commitments, and restorative sleep.

---

## 🌟 Key Features

- **Personalized Dashboard**: Greeting based on the time of day, active date indicators, completion trackers, daily study target gauges, weekly productivity bar charts, and quick-add tasks.
- **Dynamic Daily & Monthly Calendar**: Automatically syncs with the current day, date, month, and year (using the `Asia/Kolkata` IST timezone by default). Supports full previous/next day navigation, weekly matrix view, and dynamic month rendering without hardcoded dates.
- **Smart Timetable Maker**: Add, edit, and delete time blocks with category tags (College, GATE, Placements, DSA, Coding, Meals, Chores, Sleep) and real-time conflict detection alerts.
- **AI Study Planner & Rebalancing**: Powered by Gemini 3.8 Flash via secure server-side proxy routes (`/api/gemini/plan`). Intelligent rebalancing protects fixed commitments (college, meals, and sleep) while adjusting study blocks.
- **24/7 AI Study Assistant**: Interactive contextual coaching (`/api/gemini/chat`) with actionable revision timelines and non-judgmental advice.
- **Habit Tracker**: Daily streak counters, 7-day completion matrices, and confetti celebrations.
- **Exams & Goals Management**: Syllabus progress checklists, countdown clocks, and target metrics.
- **Custom Profile Picture**: Device gallery image picker supporting JPG, PNG, and WEBP formats with size validation (<4MB), circular avatar cropping, and persistence.
- **Multi-Account Partitioning & Demo Mode**: Complete data isolation between registered user accounts and one-click demo student exploration.

---

## 🏗️ Architecture & Project Structure

```
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore patterns for production
├── index.html                # HTML entry point with typography
├── metadata.json             # AI Studio applet capabilities
├── package.json              # Dependencies and build scripts
├── server.ts                 # Express fullstack server with Gemini API proxy
├── tsconfig.json             # TypeScript compiler configuration
├── vercel.json               # Vercel SPA routing configuration
├── vite.config.ts            # Vite build configuration
└── src/
    ├── App.tsx               # Root application shell
    ├── main.tsx              # React DOM mounting
    ├── index.css             # Tailwind CSS & warm aesthetic variables
    ├── types/
    │   └── index.ts          # Core TypeScript models (Task, Activity, Goal, etc.)
    ├── data/
    │   └── initialData.ts    # Clean demo templates and category themes
    ├── context/
    │   └── AppContext.tsx    # Global state, auth, and partitioned persistence
    └── components/
        ├── ai/               # AI Planner view
        ├── analytics/        # Analytics and performance charts
        ├── assistant/        # AI Study Assistant chat view
        ├── auth/             # User registration, login, and demo modals
        ├── common/           # Printable timetable and profile photo modals
        ├── dashboard/        # Main dashboard and mini calendar
        ├── exams/            # Exams and syllabus tracker
        ├── habits/           # Habit tracker view
        ├── layout/           # Top Header and Sidebar pod
        ├── schedule/         # Timetable maker (daily, weekly, monthly)
        ├── settings/         # Student profile preferences and backup tools
        └── tasks/            # Tasks management view
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm, yarn, or pnpm
- Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/focusmate.git
   cd focusmate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🔒 Security & Privacy

- **Server-Side API Proxying**: The Gemini API key is never bundled into client JavaScript. All AI requests pass through `/api/gemini/plan` and `/api/gemini/chat` in `server.ts`.
- **Defensive Error Handling**: When external APIs or networks are temporarily unavailable, FocusMate uses built-in rule-based academic balance engines to provide uninterrupted planning.
- **Account Isolation**: Each user account is stored in an isolated data partition (`focusmate_<uid>_*`), preventing cross-account contamination.

---

## 📦 Production Build & Deployment

### Build

```bash
npm run build
```
This produces an optimized production bundle in the `dist/` directory.

### Deploying to Vercel

1. Push your repository to GitHub.
2. Import the project into the [Vercel Dashboard](https://vercel.com/).
3. Add `GEMINI_API_KEY` in the Vercel Environment Variables settings.
4. Deploy using the included `vercel.json` configuration.

### Deploying Fullstack (Cloud Run / Node.js Host)

```bash
npm run build
npm start
```
The server will automatically serve the static bundle from `dist/` and expose the API proxy endpoints on the configured `PORT`.

---

## 📄 License

Licensed under the Apache License, Version 2.0.
