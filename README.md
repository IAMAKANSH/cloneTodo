# Microsoft To Do Clone

A full-featured Microsoft To Do clone with AI-powered task management, Microsoft 365 integration, and a standalone CLI agent.

Built with React 19, TypeScript, Vite, and Tailwind CSS.

## Features

**Task Management**
- Create, edit, delete, and organize tasks
- My Day, Important, Planned, and custom lists
- Subtasks, categories, recurrence, reminders
- Drag-and-drop reordering
- Dark mode and theme customization

**Microsoft 365 Integration**
- Outlook email (flagged emails as task suggestions)
- Outlook calendar (upcoming events)
- Planner tasks (work/school accounts)
- Teams messages (work/school accounts)
- Auto-sync every 5 minutes

**AI Chat Assistant**
- In-app floating chat bot (sparkle button, bottom-right)
- Natural language task management ("add task buy groceries", "what's on my plate?")
- Supports NVIDIA NIM (free) and Anthropic Claude
- Smart suggestions from Microsoft 365 data

**Standalone CLI Agent**
- Global `todo` command — manage tasks from any terminal
- AI-powered natural language understanding
- REST API server for web app sync
- Tasks sync bidirectionally with the web app

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start the web app

```bash
npm run dev
```

Open **http://localhost:5173**

### 3. Set up the CLI agent (optional)

```bash
cd agent
npm link
```

Create `agent/.env`:
```
NVIDIA_API_KEY=your-nvidia-api-key-here
PORT=3001
```

Then from any terminal:
```bash
todo
```

## Microsoft 365 Setup

To connect Outlook, Calendar, and Teams:

1. Go to [Azure Portal](https://portal.azure.com) > **App registrations** > **New registration**
2. Set:
   - Name: `Microsoft To Do Clone`
   - Supported account types: **Any Entra ID Tenant + Personal Microsoft accounts**
   - Redirect URI: **Single-page application (SPA)** > `http://localhost:5173`
3. Under **API permissions**, add (Microsoft Graph, Delegated):
   - `User.Read`, `Mail.Read`, `Calendars.Read`, `Tasks.Read`, `Tasks.ReadWrite`, `Team.ReadBasic.All`, `Chat.Read`
4. Under **Authentication**, enable **Access tokens** and **ID tokens**
5. Update `src/lib/msalConfig.ts` with your **Client ID**

Then click **Sign in with Microsoft** in the app sidebar.

## AI Chat Setup

### NVIDIA NIM (Free)

1. Go to [build.nvidia.com](https://build.nvidia.com)
2. Sign up and get a free API key
3. In the app, click the sparkle button (bottom-right) > gear icon > paste key

### Anthropic Claude (Paid)

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. In the chat settings, switch to **Claude** provider and paste key

## CLI Agent Commands

```
todo                          # Start the agent
todo ❯ add task buy groceries # Create a task
todo ❯ tasks                  # List all tasks (instant, no AI)
todo ❯ myday                  # Show My Day tasks
todo ❯ important              # Show important tasks
todo ❯ quit                   # Exit
```

Or type anything naturally — the AI figures out the rest:
```
todo ❯ I need to prepare slides for Monday's meeting
todo ❯ mark the groceries thing as done
todo ❯ what meetings do I have this week?
todo ❯ star the PR review task
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 + CSS custom properties |
| State | Zustand |
| Database | Dexie (IndexedDB) |
| Animations | Framer Motion |
| UI Components | Radix UI |
| Drag & Drop | dnd-kit |
| Icons | Lucide React |
| Auth | MSAL Browser (Azure AD) |
| Graph API | Microsoft Graph REST API |
| AI | NVIDIA NIM / Anthropic Claude |

## Project Structure

```
src/
  components/       # React components
    layout/         # AppLayout, Sidebar, TaskListPanel, TaskDetailPanel
    tasks/          # TaskItem, TaskInput, TaskCheckbox
    chatbot/        # AI chat panel
    auth/           # Microsoft sign-in button
    outlook/        # Flagged emails list
    calendar/       # Calendar events
    teams/          # Teams messages, Planner tasks
    myday/          # Smart suggestions
    search/         # Search overlay
    settings/       # Settings dialog
  stores/           # Zustand state stores
  hooks/            # Custom React hooks
  services/         # Microsoft Graph API services
  lib/              # Utilities, constants, AI chatbot logic
  db/               # Dexie database schema and seed
  types/            # TypeScript type definitions
agent/
  todo.js           # CLI agent + REST API server
  .env              # NVIDIA API key (not committed)
```

## License

MIT
