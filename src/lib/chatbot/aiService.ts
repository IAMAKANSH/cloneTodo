import { db } from '../../db/database';
import { taskActions } from '../../stores/taskStore';
import { useAuthStore } from '../../stores/authStore';
import { getTodayString } from '../dates';
import type { ChatMessage, ChatResponseData } from '../../types/chat';

// Storage keys
const NVIDIA_KEY_STORAGE = 'todo_nvidia_api_key';
const ANTHROPIC_KEY_STORAGE = 'todo_anthropic_api_key';
const PROVIDER_STORAGE = 'todo_ai_provider';

export type AIProvider = 'nvidia' | 'anthropic';

export function getProvider(): AIProvider {
  return (localStorage.getItem(PROVIDER_STORAGE) as AIProvider) || 'nvidia';
}
export function setProvider(p: AIProvider) { localStorage.setItem(PROVIDER_STORAGE, p); }

export function getNvidiaKey(): string | null { return localStorage.getItem(NVIDIA_KEY_STORAGE); }
export function setNvidiaKey(k: string) { localStorage.setItem(NVIDIA_KEY_STORAGE, k); }
export function clearNvidiaKey() { localStorage.removeItem(NVIDIA_KEY_STORAGE); }

export function getAnthropicKey(): string | null { return localStorage.getItem(ANTHROPIC_KEY_STORAGE); }
export function setAnthropicKey(k: string) { localStorage.setItem(ANTHROPIC_KEY_STORAGE, k); }
export function clearAnthropicKey() { localStorage.removeItem(ANTHROPIC_KEY_STORAGE); }

export function getApiKey(): string | null {
  return getProvider() === 'nvidia' ? getNvidiaKey() : getAnthropicKey();
}
export function setApiKey(k: string) {
  if (getProvider() === 'nvidia') setNvidiaKey(k); else setAnthropicKey(k);
}
export function clearApiKey() {
  if (getProvider() === 'nvidia') clearNvidiaKey(); else clearAnthropicKey();
}

// OpenAI-format tool definitions (for NVIDIA NIM)
const openaiTools = [
  {
    type: 'function' as const,
    function: {
      name: 'add_task',
      description: 'Create a new task',
      parameters: {
        type: 'object', properties: {
          title: { type: 'string', description: 'Task title' },
          important: { type: 'boolean', description: 'Mark as important' },
          add_to_myday: { type: 'boolean', description: 'Add to My Day' },
        }, required: ['title'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'show_tasks',
      description: 'Show/list tasks',
      parameters: {
        type: 'object', properties: {
          filter: { type: 'string', enum: ['all', 'myday', 'important', 'completed', 'planned'], description: 'Which tasks to show' },
        }, required: ['filter'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'complete_task',
      description: 'Mark a task as done',
      parameters: {
        type: 'object', properties: {
          search: { type: 'string', description: 'Task name to find and complete' },
        }, required: ['search'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'delete_task',
      description: 'Delete a task',
      parameters: {
        type: 'object', properties: {
          search: { type: 'string', description: 'Task name to delete' },
        }, required: ['search'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'star_task',
      description: 'Toggle star/importance on a task',
      parameters: {
        type: 'object', properties: {
          search: { type: 'string', description: 'Task name' },
        }, required: ['search'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_to_myday',
      description: 'Add existing task to My Day',
      parameters: {
        type: 'object', properties: {
          search: { type: 'string', description: 'Task name' },
        }, required: ['search'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_tasks',
      description: 'Search tasks by keyword',
      parameters: {
        type: 'object', properties: {
          query: { type: 'string', description: 'Search keyword' },
        }, required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'show_calendar',
      description: 'Show upcoming calendar events',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'show_emails',
      description: 'Show flagged emails',
      parameters: { type: 'object', properties: {} },
    },
  },
];

// Anthropic-format tools
const anthropicTools = openaiTools.map((t) => ({
  name: t.function.name,
  description: t.function.description,
  input_schema: t.function.parameters,
}));

// Build system prompt
async function buildSystemPrompt(): Promise<string> {
  const today = getTodayString();
  const isAuth = useAuthStore.getState().isAuthenticated;
  const user = useAuthStore.getState().user;

  let taskSummary = '';
  try {
    const allTasks = await db.tasks.filter((t) => !t.isCompleted).toArray();
    const myDayTasks = allTasks.filter((t) => t.isMyDay && t.myDayDate === today);
    taskSummary = `\nCurrent state: ${allTasks.length} active tasks, ${myDayTasks.length} in My Day.`;
    if (allTasks.length > 0 && allTasks.length <= 20) {
      taskSummary += `\nActive tasks: ${allTasks.map((t) => `"${t.title}"${t.isImportant ? ' ⭐' : ''}${t.isMyDay ? ' ☀️' : ''}`).join(', ')}`;
    }
  } catch {}

  return `You are a friendly task management assistant in a Microsoft To Do app.
Today: ${today}. ${user ? `User: ${user.displayName}` : ''}
Microsoft 365: ${isAuth ? 'Connected' : 'Not connected'}${taskSummary}

Rules:
- Be concise (1-2 sentences)
- Use tools to perform actions
- For ambiguous task names, match from the active tasks list
- If user asks about calendar/email, check if Microsoft is connected`;
}

// Tool executor (shared between providers)
async function executeTool(name: string, input: any): Promise<{ result: string; data?: ChatResponseData }> {
  const today = getTodayString();

  switch (name) {
    case 'add_task': {
      const opts: Record<string, unknown> = {};
      if (input.important) opts.isImportant = true;
      if (input.add_to_myday) { opts.isMyDay = true; opts.myDayDate = today; }
      await taskActions.createTask(input.title, 'default-tasks', opts);
      return { result: `Task created: "${input.title}"` };
    }
    case 'show_tasks': {
      let tasks;
      switch (input.filter) {
        case 'myday': tasks = await db.tasks.filter((t) => !t.isCompleted && t.isMyDay && t.myDayDate === today).toArray(); break;
        case 'important': tasks = await db.tasks.filter((t) => !t.isCompleted && t.isImportant).toArray(); break;
        case 'completed': tasks = await db.tasks.filter((t) => t.isCompleted).toArray(); break;
        case 'planned': tasks = await db.tasks.filter((t) => !t.isCompleted && !!t.dueDate).toArray(); break;
        default: tasks = await db.tasks.filter((t) => !t.isCompleted).toArray();
      }
      return {
        result: `Found ${tasks.length} tasks.`,
        data: { type: 'task_list', tasks: tasks.slice(0, 15).map((t) => ({ id: t.id, title: t.title, isCompleted: t.isCompleted, isImportant: t.isImportant, isMyDay: t.isMyDay && t.myDayDate === today })) },
      };
    }
    case 'complete_task': {
      const tasks = await db.tasks.filter((t) => !t.isCompleted).toArray();
      const match = findMatch(input.search, tasks);
      if (!match) return { result: `No task found matching "${input.search}".` };
      await taskActions.toggleComplete(match.id);
      return { result: `Completed: "${match.title}"` };
    }
    case 'delete_task': {
      const tasks = await db.tasks.toArray();
      const match = findMatch(input.search, tasks);
      if (!match) return { result: `No task found matching "${input.search}".` };
      await taskActions.deleteTask(match.id);
      return { result: `Deleted: "${match.title}"` };
    }
    case 'star_task': {
      const tasks = await db.tasks.filter((t) => !t.isCompleted).toArray();
      const match = findMatch(input.search, tasks);
      if (!match) return { result: `No task found matching "${input.search}".` };
      await taskActions.toggleImportant(match.id);
      return { result: `${match.isImportant ? 'Unstarred' : 'Starred'}: "${match.title}"` };
    }
    case 'add_to_myday': {
      const tasks = await db.tasks.filter((t) => !t.isCompleted).toArray();
      const match = findMatch(input.search, tasks);
      if (!match) return { result: `No task found matching "${input.search}".` };
      await taskActions.toggleMyDay(match.id);
      return { result: `Added to My Day: "${match.title}"` };
    }
    case 'search_tasks': {
      const q = input.query.toLowerCase();
      const tasks = await db.tasks.filter((t) => t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q)).toArray();
      return {
        result: `Found ${tasks.length} matching tasks.`,
        data: { type: 'task_list', tasks: tasks.slice(0, 10).map((t) => ({ id: t.id, title: t.title, isCompleted: t.isCompleted, isImportant: t.isImportant, isMyDay: t.isMyDay && t.myDayDate === today })) },
      };
    }
    case 'show_calendar': {
      if (!useAuthStore.getState().isAuthenticated) return { result: 'Please sign in to Microsoft first.' };
      const events = await db.calendarEvents.toArray();
      return { result: `Found ${events.length} events.`, data: { type: 'calendar_list', events: events.slice(0, 10).map((e) => ({ subject: e.subject, start: e.start.dateTime, end: e.end.dateTime, location: e.location, isAllDay: e.isAllDay })) } };
    }
    case 'show_emails': {
      if (!useAuthStore.getState().isAuthenticated) return { result: 'Please sign in to Microsoft first.' };
      const emails = await db.outlookEmails.toArray();
      return { result: `Found ${emails.length} emails.`, data: { type: 'email_list', emails: emails.slice(0, 10).map((e) => ({ subject: e.subject, from: e.from.name, bodyPreview: e.bodyPreview })) } };
    }
    default: return { result: 'Unknown action.' };
  }
}

function findMatch(search: string, tasks: any[]) {
  const q = search.toLowerCase();
  return tasks.find((t) => t.title.toLowerCase() === q)
    || tasks.find((t) => t.title.toLowerCase().includes(q))
    || tasks.find((t) => q.includes(t.title.toLowerCase()))
    || null;
}

// ========== NVIDIA NIM Provider (prompt-based, no tool calling) ==========

const NVIDIA_SYSTEM_SUFFIX = `

When the user wants you to perform an action, respond with ONLY a JSON block in this exact format, nothing else:
\`\`\`json
{"action": "ACTION_NAME", "params": {PARAMS}}
\`\`\`

Available actions:
- {"action": "add_task", "params": {"title": "task name", "important": false, "add_to_myday": false}}
- {"action": "show_tasks", "params": {"filter": "all|myday|important|completed|planned"}}
- {"action": "complete_task", "params": {"search": "task name"}}
- {"action": "delete_task", "params": {"search": "task name"}}
- {"action": "star_task", "params": {"search": "task name"}}
- {"action": "add_to_myday", "params": {"search": "task name"}}
- {"action": "search_tasks", "params": {"query": "keyword"}}
- {"action": "show_calendar", "params": {}}
- {"action": "show_emails", "params": {}}

If the user is just chatting (greeting, question, etc.) and no action is needed, respond normally with plain text — do NOT use JSON.
Always be concise and friendly.`;

async function sendViaNvidia(
  userMessage: string,
  history: { role: string; content: string }[],
  systemPrompt: string
): Promise<Omit<ChatMessage, 'id' | 'timestamp'>> {
  const apiKey = getNvidiaKey();
  if (!apiKey) return { role: 'bot', content: 'Please set your NVIDIA API key in chat settings. Get a free one at build.nvidia.com' };

  const messages = [
    { role: 'system' as const, content: systemPrompt + NVIDIA_SYSTEM_SUFFIX },
    ...history.slice(-8).map((m) => ({
      role: (m.role === 'bot' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  const response = await fetch('/api/nvidia/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'meta/llama-3.1-70b-instruct',
      messages,
      max_tokens: 1024,
      temperature: 0.3,
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) return { role: 'bot', content: 'Invalid NVIDIA API key. Get a free one at build.nvidia.com' };
    throw new Error(err.detail || err.error?.message || `NVIDIA API error: ${response.status}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  if (!choice) throw new Error('No response from model');

  const rawContent = choice.message?.content || '';

  // Try to extract JSON action from the response
  const jsonMatch = rawContent.match(/```json\s*\n?([\s\S]*?)\n?\s*```/) || rawContent.match(/\{[\s\S]*"action"[\s\S]*\}/);

  if (jsonMatch) {
    try {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr.trim());

      if (parsed.action) {
        const toolResult = await executeTool(parsed.action, parsed.params || {});

        // Generate a friendly response with the result
        const friendlyMessages = [
          ...messages,
          { role: 'assistant' as const, content: `I executed: ${parsed.action}. Result: ${toolResult.result}` },
          { role: 'user' as const, content: `Based on that result, give a brief friendly response to the user. Just 1-2 sentences, no JSON.` },
        ];

        try {
          const friendlyResp = await fetch('/api/nvidia/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'meta/llama-3.1-70b-instruct',
              messages: friendlyMessages,
              max_tokens: 256,
              temperature: 0.5,
              stream: false,
            }),
          });

          if (friendlyResp.ok) {
            const friendlyData = await friendlyResp.json();
            const friendlyText = friendlyData.choices?.[0]?.message?.content || toolResult.result;
            return { role: 'bot', content: friendlyText, data: toolResult.data };
          }
        } catch {
          // Fallback to raw result
        }

        return { role: 'bot', content: toolResult.result, data: toolResult.data };
      }
    } catch {
      // JSON parse failed — treat as plain text
    }
  }

  // No action detected — return the text response as-is
  return { role: 'bot', content: rawContent };
}

// ========== Anthropic Provider ==========
async function sendViaAnthropic(
  userMessage: string,
  history: { role: string; content: string }[],
  systemPrompt: string
): Promise<Omit<ChatMessage, 'id' | 'timestamp'>> {
  const apiKey = getAnthropicKey();
  if (!apiKey) return { role: 'bot', content: 'Please set your Anthropic API key in chat settings.' };

  const messages = history.slice(-10).map((m) => ({
    role: (m.role === 'bot' ? 'assistant' : 'user') as 'assistant' | 'user',
    content: m.content,
  }));
  messages.push({ role: 'user', content: userMessage });

  const response = await fetch('/api/claude/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      tools: anthropicTools,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) return { role: 'bot', content: 'Invalid Anthropic API key.' };
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  let textContent = '';
  let richData: ChatResponseData | undefined;

  for (const block of data.content) {
    if (block.type === 'text') {
      textContent += block.text;
    } else if (block.type === 'tool_use') {
      const toolResult = await executeTool(block.name, block.input);
      if (toolResult.data) richData = toolResult.data;

      const followUp = await fetch('/api/claude/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 512,
          system: systemPrompt,
          messages: [
            ...messages,
            { role: 'assistant', content: data.content },
            { role: 'user', content: [{ type: 'tool_result', tool_use_id: block.id, content: toolResult.result }] },
          ],
        }),
      });

      if (followUp.ok) {
        const fData = await followUp.json();
        for (const fb of fData.content) { if (fb.type === 'text') textContent += fb.text; }
      } else {
        textContent = textContent || toolResult.result;
      }
    }
  }

  return { role: 'bot', content: textContent || 'Done!', data: richData };
}

// ========== Main export ==========
export async function sendAIMessage(
  userMessage: string,
  history: { role: string; content: string }[]
): Promise<Omit<ChatMessage, 'id' | 'timestamp'>> {
  const provider = getProvider();
  const key = getApiKey();
  if (!key) {
    return {
      role: 'bot',
      content: provider === 'nvidia'
        ? 'Set your **free NVIDIA API key** in chat settings (gear icon). Get one at **build.nvidia.com**'
        : 'Set your Anthropic API key in chat settings.',
    };
  }

  const systemPrompt = await buildSystemPrompt();

  try {
    if (provider === 'nvidia') {
      return await sendViaNvidia(userMessage, history, systemPrompt);
    } else {
      return await sendViaAnthropic(userMessage, history, systemPrompt);
    }
  } catch (err: any) {
    return { role: 'bot', content: `Error: ${err.message || 'Failed to reach AI.'}` };
  }
}
