# Microsoft To Do Clone — Project Plan

## Overview

A premium Microsoft To Do clone that goes beyond the original — featuring AI-powered task management, Microsoft 365 deep integration, and a standalone CLI agent for managing tasks without opening the app.

---

## Phase 1: Core To Do App

**Status: Complete**

### Task Management
- [x] Create, edit, delete tasks
- [x] Task completion with animated checkbox
- [x] Star/unstar tasks (importance)
- [x] My Day — daily focus list that resets
- [x] Planned — tasks with due dates
- [x] Assigned — tasks assigned to users
- [x] Custom lists with color themes
- [x] Subtasks (steps) with progress tracking
- [x] Task notes
- [x] Categories/tags with pill badges
- [x] Recurrence rules (daily, weekly, monthly, yearly, weekdays)
- [x] Reminders with notification system
- [x] Due dates with overdue detection
- [x] Drag-and-drop task reordering (dnd-kit)
- [x] Right-click context menus (Radix UI)
- [x] Move/copy tasks between lists
- [x] Completed tasks section (collapsible)
- [x] Global search overlay (Ctrl+F)
- [x] Keyboard shortcuts (Ctrl+B sidebar, Ctrl+F search)

### Data Layer
- [x] IndexedDB via Dexie for offline-first storage
- [x] Reactive queries with `useLiveQuery`
- [x] Database seeding with default list
- [x] Auto-recovery from schema version conflicts

### Settings
- [x] Theme mode: Light / Dark / System
- [x] My Day background gradients (6 options)
- [x] Completion sound toggle
- [x] Confirm before delete toggle
- [x] Move completed to bottom toggle
- [x] New task position (top/bottom)
- [x] Smart list visibility toggles
- [x] Persistent settings via Zustand + localStorage

---

## Phase 2: Premium UI Overhaul

**Status: Complete**

### Glassmorphism & 3D Design
- [x] Animated mesh gradient background (floating purple/blue/indigo)
- [x] Glassmorphism sidebar with backdrop blur
- [x] Glass panels for detail panel, dialogs, context menus
- [x] 3D task cards — lift on hover with colored shadows
- [x] Selected task glow border effect
- [x] Glow effect on focused inputs

### Animations
- [x] Framer Motion spring physics on panels
- [x] Staggered fadeInUp for task list entry
- [x] Animated checkbox with pulse ring glow
- [x] Smooth expand/collapse for completed section
- [x] Spring-animated toggle switches in settings
- [x] Search overlay scale-in animation
- [x] Floating empty state icons
- [x] Shimmer loading skeletons
- [x] Sidebar items slide on hover

### Visual Design
- [x] Segoe UI Variable font (Microsoft's typeface)
- [x] Blue-tinted colored shadows
- [x] Premium dark mode (deep navy/indigo tones)
- [x] Gradient active indicators in sidebar
- [x] Count badges with pill styling
- [x] Gradient dividers
- [x] Modern rounded corners (12-20px)

---

## Phase 3: Microsoft 365 Integration

**Status: Complete**

### Authentication
- [x] MSAL Browser (Azure AD) integration
- [x] Redirect-based login flow (no popup issues)
- [x] Personal + work/school Microsoft accounts
- [x] Token management with silent refresh
- [x] Account button in sidebar with user avatar
- [x] Auto-detect personal vs work account

### Outlook Mail
- [x] Fetch flagged emails via Graph API
- [x] Fallback query for personal accounts (client-side filter)
- [x] Email cards with subject, sender, preview
- [x] "Create task" from email
- [x] "Open in Outlook" link
- [x] Cached in IndexedDB for offline access

### Outlook Calendar
- [x] Fetch upcoming events (7-day window)
- [x] Events grouped by date
- [x] Time, location, organizer display
- [x] "Create task" from event
- [x] All-day event support

### Planner Tasks (work/school accounts only)
- [x] Fetch assigned Planner tasks
- [x] Progress ring visualization
- [x] "Add to my tasks" action
- [x] Skipped for personal accounts (no API errors)

### Teams (work/school accounts only)
- [x] Recent chat messages
- [x] Sender name and preview
- [x] "Create task" from message
- [x] Skipped for personal accounts

### Smart Suggestions
- [x] Combined suggestions from local tasks + Microsoft 365
- [x] Flagged emails → task suggestions
- [x] Today's calendar events → My Day suggestions
- [x] Planner tasks → suggestions
- [x] Teams mentions → suggestions
- [x] Source icons and color coding
- [x] "Create task & add to My Day" action

### Sync
- [x] Auto-sync every 5 minutes
- [x] Per-source sync status tracking
- [x] Manual sync button
- [x] Integration data cached in IndexedDB
- [x] Graceful error handling per source

---

## Phase 4: AI Chat Assistant

**Status: Complete**

### In-App Chat Bot
- [x] Floating sparkle button (bottom-right)
- [x] Glass panel with gradient header
- [x] Bot avatar with sparkle icon
- [x] Animated typing indicator (bouncing dots)
- [x] Message bubbles (user = purple gradient, bot = surface)
- [x] Rich data cards for tasks, calendar, emails
- [x] Suggestion pills for quick starts
- [x] Chat history persisted in localStorage
- [x] Clear history button

### AI Providers
- [x] **NVIDIA NIM** (free) — Llama 3.1 70B via build.nvidia.com
- [x] **Anthropic Claude** (paid) — Claude Sonnet via API
- [x] Provider toggle in chat settings
- [x] API key management (save/remove)
- [x] Vite proxy for CORS (both providers)

### Natural Language Understanding
- [x] Prompt-based JSON action extraction (NVIDIA NIM)
- [x] Native tool calling (Anthropic Claude)
- [x] Fallback regex command parser (no API key needed)
- [x] Fuzzy task name matching (trigram similarity)
- [x] Context-aware system prompt (includes current task list)
- [x] Conversational follow-up with tool results

### Supported Actions via Chat
- [x] Add task (with importance, My Day, due date)
- [x] Show tasks (all, My Day, important, completed, planned)
- [x] Complete task
- [x] Delete task
- [x] Star/unstar task
- [x] Add to My Day
- [x] Search tasks
- [x] Show calendar events
- [x] Show flagged emails

---

## Phase 5: Standalone CLI Agent

**Status: Complete**

### CLI Features
- [x] Global `todo` command (npm link)
- [x] Interactive AI-powered chat in terminal
- [x] Colored terminal output (task status, stars, sun icons)
- [x] Quick commands: `tasks`, `ls`, `myday`, `important` (instant, no AI)
- [x] Task banner on startup
- [x] `.env` configuration for API key

### REST API Server
- [x] Runs on port 3001 alongside CLI
- [x] CORS enabled for web app access
- [x] Endpoints: GET/POST tasks, complete, delete, star, myday, update, search, import
- [x] Generic action endpoint for AI
- [x] Health check endpoint

### Task Actions
- [x] Add task (with due date, importance, My Day)
- [x] Show tasks (all, My Day, important, completed)
- [x] Complete task (fuzzy name matching)
- [x] Delete task
- [x] Star/unstar task
- [x] Add to My Day
- [x] Update task (due date, importance, rename, My Day)
- [x] Search tasks
- [x] Bulk import/export

### Web App Sync
- [x] Bidirectional sync between CLI and web app
- [x] 15-second polling interval
- [x] Hash-based change detection (skip if unchanged)
- [x] New tasks imported, existing tasks updated
- [x] Silent when agent not running (no console errors)
- [x] Shared JSON file storage

---

## Future Plans

### Teams Bot Integration
- [ ] Azure Bot Service registration
- [ ] Bot Framework SDK integration
- [ ] Webhook endpoint for Teams
- [ ] Manage tasks directly from Teams chat
- [ ] Proactive notifications for due tasks

### Advanced Features
- [ ] Task attachments (file upload)
- [ ] Shared lists (collaboration)
- [ ] Task comments
- [ ] Activity log / audit trail
- [ ] Export to CSV/PDF
- [ ] Mobile responsive design
- [ ] PWA (Progressive Web App) support
- [ ] Voice commands (Whisper integration)

### AI Enhancements
- [ ] Auto-categorize tasks based on content
- [ ] Smart due date suggestions
- [ ] Priority scoring based on patterns
- [ ] Natural language due dates ("next Tuesday", "end of month")
- [ ] Multi-step task planning ("plan a birthday party")
- [ ] Daily summary email/notification

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Web App (React)                    │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │
│  │ Zustand   │ │ Dexie    │ │ Microsoft Graph   │   │
│  │ Stores    │ │ IndexedDB│ │ (Outlook/Teams)   │   │
│  └──────────┘ └──────────┘ └───────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │         AI Chat (NVIDIA NIM / Claude)         │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────┘
                  │ Sync (HTTP, 15s interval)
┌─────────────────┴───────────────────────────────────┐
│               CLI Agent (Node.js)                    │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │
│  │ REPL     │ │ REST API │ │ NVIDIA NIM AI     │   │
│  │ Terminal │ │ :3001    │ │ (Llama 3.1 70B)   │   │
│  └──────────┘ └──────────┘ └───────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │           tasks.json (shared storage)         │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```
