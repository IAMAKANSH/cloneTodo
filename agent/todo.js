#!/usr/bin/env node

import { createInterface } from 'readline';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createServer } from 'http';
import { randomUUID } from 'crypto';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─── Load .env ────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const [key, ...vals] = line.split('=');
    if (key && key.trim() && !key.startsWith('#')) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  }
}

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';
const MODEL = 'meta/llama-3.1-70b-instruct';
const API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const PORT = parseInt(process.env.PORT || '3001');
const TASKS_FILE = resolve(__dirname, 'tasks.json');

// ─── Colors ───────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  purple: '\x1b[38;2;139;92;246m', blue: '\x1b[38;2;96;165;250m',
  green: '\x1b[38;2;16;185;129m', yellow: '\x1b[38;2;245;158;11m',
  red: '\x1b[38;2;232;54;79m', gray: '\x1b[38;2;150;150;170m',
  white: '\x1b[97m', cyan: '\x1b[38;2;34;211;238m',
  bgPurple: '\x1b[48;2;99;102;241m',
};

// ─── Task Storage ─────────────────────────────────────────────────────
function loadTasks() {
  if (existsSync(TASKS_FILE)) {
    try { return JSON.parse(readFileSync(TASKS_FILE, 'utf-8')); } catch { return []; }
  }
  return [];
}

function saveTasks(tasks) {
  writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function findTask(search, tasks) {
  const q = search.toLowerCase();
  return tasks.find(t => t.title.toLowerCase() === q)
    || tasks.find(t => t.title.toLowerCase().includes(q))
    || tasks.find(t => q.includes(t.title.toLowerCase()))
    || null;
}

function now() { return new Date().toISOString(); }
function today() { return now().split('T')[0]; }

// ─── Task Actions ─────────────────────────────────────────────────────
const taskActions = {
  add_task({ title, important = false, add_to_myday = false, due_date = null }) {
    const tasks = loadTasks();
    const task = {
      id: randomUUID(), title, isCompleted: false, isImportant: important,
      isMyDay: add_to_myday, myDayDate: add_to_myday ? today() : null,
      dueDate: due_date || null, notes: '', categories: [], sortOrder: tasks.length,
      createdAt: now(), updatedAt: now(),
    };
    tasks.push(task);
    saveTasks(tasks);
    return { ok: true, task, message: `Created: "${title}"` };
  },

  show_tasks({ filter = 'all' }) {
    const tasks = loadTasks();
    let filtered;
    switch (filter) {
      case 'myday': filtered = tasks.filter(t => !t.isCompleted && t.isMyDay); break;
      case 'important': filtered = tasks.filter(t => !t.isCompleted && t.isImportant); break;
      case 'completed': filtered = tasks.filter(t => t.isCompleted); break;
      default: filtered = tasks.filter(t => !t.isCompleted);
    }
    return { ok: true, tasks: filtered, message: `${filtered.length} tasks` };
  },

  complete_task({ search }) {
    const tasks = loadTasks();
    const match = findTask(search, tasks.filter(t => !t.isCompleted));
    if (!match) return { ok: false, message: `No task matching "${search}"` };
    match.isCompleted = true; match.updatedAt = now();
    saveTasks(tasks);
    return { ok: true, task: match, message: `Completed: "${match.title}"` };
  },

  delete_task({ search }) {
    const tasks = loadTasks();
    const match = findTask(search, tasks);
    if (!match) return { ok: false, message: `No task matching "${search}"` };
    saveTasks(tasks.filter(t => t.id !== match.id));
    return { ok: true, task: match, message: `Deleted: "${match.title}"` };
  },

  star_task({ search }) {
    const tasks = loadTasks();
    const match = findTask(search, tasks.filter(t => !t.isCompleted));
    if (!match) return { ok: false, message: `No task matching "${search}"` };
    match.isImportant = !match.isImportant; match.updatedAt = now();
    saveTasks(tasks);
    return { ok: true, task: match, message: `${match.isImportant ? 'Starred' : 'Unstarred'}: "${match.title}"` };
  },

  add_to_myday({ search }) {
    const tasks = loadTasks();
    const match = findTask(search, tasks.filter(t => !t.isCompleted));
    if (!match) return { ok: false, message: `No task matching "${search}"` };
    match.isMyDay = !match.isMyDay; match.myDayDate = match.isMyDay ? today() : null; match.updatedAt = now();
    saveTasks(tasks);
    return { ok: true, task: match, message: `${match.isMyDay ? 'Added to' : 'Removed from'} My Day: "${match.title}"` };
  },

  update_task({ search, important, due_date, add_to_myday, title: newTitle }) {
    const tasks = loadTasks();
    const match = findTask(search, tasks);
    if (!match) return { ok: false, message: `No task matching "${search}"` };
    const changes = [];
    if (important !== undefined) { match.isImportant = important; changes.push(important ? 'marked important' : 'unmarked important'); }
    if (due_date !== undefined) { match.dueDate = due_date; changes.push(`due date set to ${due_date}`); }
    if (add_to_myday !== undefined) { match.isMyDay = add_to_myday; match.myDayDate = add_to_myday ? today() : null; changes.push(add_to_myday ? 'added to My Day' : 'removed from My Day'); }
    if (newTitle) { match.title = newTitle; changes.push(`renamed to "${newTitle}"`); }
    match.updatedAt = now();
    saveTasks(tasks);
    return { ok: true, task: match, message: `Updated "${match.title}": ${changes.join(', ')}` };
  },

  search_tasks({ query }) {
    const tasks = loadTasks();
    const q = query.toLowerCase();
    const found = tasks.filter(t => t.title.toLowerCase().includes(q));
    return { ok: true, tasks: found, message: `${found.length} matching "${query}"` };
  },

  // Get all tasks (for web app sync)
  get_all() {
    return { ok: true, tasks: loadTasks() };
  },

  // Bulk import (from web app)
  import_tasks(incoming) {
    const existing = loadTasks();
    const existingIds = new Set(existing.map(t => t.id));
    let added = 0;
    for (const task of incoming) {
      if (!existingIds.has(task.id)) {
        existing.push(task);
        added++;
      }
    }
    saveTasks(existing);
    return { ok: true, message: `Imported ${added} new tasks` };
  },
};

// ─── REST API Server ──────────────────────────────────────────────────
function startServer() {
  const server = createServer(async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const url = new URL(req.url, `http://localhost:${PORT}`);
    const path = url.pathname;

    // Parse body
    let body = null;
    if (['POST', 'PUT'].includes(req.method)) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      try { body = JSON.parse(Buffer.concat(chunks).toString()); } catch { body = {}; }
    }

    const json = (data, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    // Routes
    if (path === '/api/tasks' && req.method === 'GET') {
      json(taskActions.get_all());
    } else if (path === '/api/tasks' && req.method === 'POST') {
      json(taskActions.add_task(body));
    } else if (path === '/api/tasks/complete' && req.method === 'POST') {
      json(taskActions.complete_task(body));
    } else if (path === '/api/tasks/delete' && req.method === 'POST') {
      json(taskActions.delete_task(body));
    } else if (path === '/api/tasks/star' && req.method === 'POST') {
      json(taskActions.star_task(body));
    } else if (path === '/api/tasks/update' && req.method === 'POST') {
      json(taskActions.update_task(body));
    } else if (path === '/api/tasks/myday' && req.method === 'POST') {
      json(taskActions.add_to_myday(body));
    } else if (path === '/api/tasks/search' && req.method === 'POST') {
      json(taskActions.search_tasks(body));
    } else if (path === '/api/tasks/import' && req.method === 'POST') {
      json(taskActions.import_tasks(body.tasks || []));
    } else if (path === '/api/tasks/action' && req.method === 'POST') {
      // Generic action endpoint (for AI)
      const action = body?.action;
      const params = body?.params || {};
      if (action && taskActions[action]) {
        json(taskActions[action](params));
      } else {
        json({ ok: false, message: 'Unknown action' }, 400);
      }
    } else if (path === '/health') {
      json({ ok: true, tasks: loadTasks().length });
    } else {
      json({ error: 'Not found' }, 404);
    }
  });

  server.listen(PORT, () => {
    console.log(`  ${c.green}●${c.reset} API server running on ${c.blue}http://localhost:${PORT}${c.reset}`);
    console.log(`  ${c.dim}Web app can sync at /api/tasks${c.reset}`);
  });

  return server;
}

// ─── AI Chat ──────────────────────────────────────────────────────────
function buildSystemPrompt() {
  const tasks = loadTasks();
  const active = tasks.filter(t => !t.isCompleted);

  let taskList = '';
  if (active.length > 0 && active.length <= 30) {
    taskList = `\nActive tasks: ${active.map(t => `"${t.title}"${t.isImportant ? ' ⭐' : ''}${t.isMyDay ? ' ☀️' : ''}`).join(', ')}`;
  }

  return `You are a task management AI assistant running in a terminal CLI.
Today: ${today()}. Tasks: ${active.length} active, ${tasks.filter(t => t.isCompleted).length} completed.${taskList}

When the user wants an action, respond with ONLY a JSON block:
\`\`\`json
{"action": "ACTION", "params": {PARAMS}}
\`\`\`

Actions:
- {"action": "add_task", "params": {"title": "name", "important": false, "add_to_myday": false, "due_date": "2026-04-20"}}
- {"action": "show_tasks", "params": {"filter": "all|myday|important|completed"}}
- {"action": "complete_task", "params": {"search": "task name"}}
- {"action": "delete_task", "params": {"search": "task name"}}
- {"action": "star_task", "params": {"search": "task name"}}
- {"action": "add_to_myday", "params": {"search": "task name"}}
- {"action": "update_task", "params": {"search": "task name", "important": true, "due_date": "2026-04-10", "add_to_myday": true, "title": "new name"}} (all params optional except search)
- {"action": "search_tasks", "params": {"query": "keyword"}}

For casual chat, respond normally with plain text. Be concise and friendly.`;
}

async function aiChat(userMessage, history) {
  if (!NVIDIA_API_KEY) {
    return { display: `${c.red}No NVIDIA_API_KEY set. Add it to agent/.env${c.reset}`, aiContent: '' };
  }

  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    ...history.slice(-8),
    { role: 'user', content: userMessage },
  ];

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NVIDIA_API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: 1024, temperature: 0.3, stream: false }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Extract JSON action — try multiple patterns
  let parsed = null;

  // Pattern 1: ```json ... ```
  const fenced = content.match(/```json\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenced) {
    try { parsed = JSON.parse(fenced[1].trim()); } catch {}
  }

  // Pattern 2: ```json ... (no closing backticks)
  if (!parsed) {
    const openFence = content.match(/```json\s*\n?([\s\S]+)/);
    if (openFence) {
      const jsonStr = openFence[1].replace(/```\s*$/, '').trim();
      try { parsed = JSON.parse(jsonStr); } catch {}
    }
  }

  // Pattern 3: bare JSON object with "action"
  if (!parsed) {
    const bare = content.match(/\{[\s\S]*?"action"\s*:\s*"[^"]+?"[\s\S]*?\}/);
    if (bare) {
      try { parsed = JSON.parse(bare[0]); } catch {}
    }
  }

  if (parsed?.action && taskActions[parsed.action]) {
    const result = taskActions[parsed.action](parsed.params || {});
    return { display: formatResult(parsed.action, result), aiContent: result.message };
  }

  return { display: content, aiContent: content };
}

function formatResult(action, result) {
  if (!result.ok) return `${c.red}✗${c.reset} ${result.message}`;

  switch (action) {
    case 'add_task':
      return `${c.green}✓${c.reset} ${c.bold}${result.message}${c.reset}`;
    case 'complete_task':
      return `${c.green}✓${c.reset} ${result.message}`;
    case 'delete_task':
      return `${c.red}🗑${c.reset} ${result.message}`;
    case 'star_task':
      return `${c.yellow}★${c.reset} ${result.message}`;
    case 'add_to_myday':
      return `${c.yellow}☀${c.reset} ${result.message}`;
    case 'update_task':
      return `${c.blue}✎${c.reset} ${result.message}`;
    case 'show_tasks':
    case 'search_tasks': {
      if (!result.tasks?.length) return `${c.dim}No tasks found.${c.reset}`;
      const lines = result.tasks.map((t, i) => {
        const check = t.isCompleted ? `${c.green}✓${c.reset}` : `${c.dim}○${c.reset}`;
        const star = t.isImportant ? ` ${c.yellow}★${c.reset}` : '';
        const sun = t.isMyDay ? ` ${c.yellow}☀${c.reset}` : '';
        const title = t.isCompleted ? `${c.dim}${t.title}${c.reset}` : t.title;
        return `  ${c.dim}${i + 1}.${c.reset} ${check} ${title}${star}${sun}`;
      });
      return `${c.bold}${result.tasks.length} tasks${c.reset}\n${lines.join('\n')}`;
    }
    default:
      return result.message;
  }
}

// ─── Interactive CLI ──────────────────────────────────────────────────
function startCLI() {
  console.log('');
  console.log(`  ${c.bgPurple}${c.white}${c.bold}  ✨ Todo Agent  ${c.reset}`);
  console.log(`  ${c.dim}Type anything to manage tasks • "quit" to exit${c.reset}`);
  console.log('');

  // Show tasks on start
  const result = taskActions.show_tasks({ filter: 'all' });
  if (result.tasks.length > 0) {
    console.log(formatResult('show_tasks', result));
    console.log('');
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const history = [];

  rl.on('close', () => {
    console.log(`\n${c.dim}Goodbye! 👋${c.reset}\n`);
    process.exit(0);
  });

  const prompt = () => {
    rl.question(`${c.purple}${c.bold}todo ❯${c.reset} `, async (input) => {
      const trimmed = input.trim();
      if (!trimmed) return prompt();
      if (['quit', 'exit', 'q'].includes(trimmed)) {
        console.log(`\n${c.dim}Goodbye! 👋${c.reset}\n`);
        rl.close();
        return;
      }

      // Quick local commands
      if (['tasks', 'ls', 'list'].includes(trimmed)) {
        console.log(''); console.log(formatResult('show_tasks', taskActions.show_tasks({ filter: 'all' }))); console.log('');
        return prompt();
      }
      if (trimmed === 'myday' || trimmed === 'today') {
        console.log(''); console.log(formatResult('show_tasks', taskActions.show_tasks({ filter: 'myday' }))); console.log('');
        return prompt();
      }
      if (trimmed === 'important') {
        console.log(''); console.log(formatResult('show_tasks', taskActions.show_tasks({ filter: 'important' }))); console.log('');
        return prompt();
      }

      try {
        process.stdout.write(`  ${c.dim}thinking...${c.reset}`);
        const result = await aiChat(trimmed, history);
        process.stdout.write('\r\x1b[K');

        console.log(`  ${c.cyan}⚡${c.reset} ${result.display}`);
        console.log('');

        history.push({ role: 'user', content: trimmed });
        history.push({ role: 'assistant', content: result.aiContent });
      } catch (err) {
        process.stdout.write('\r\x1b[K');
        console.log(`  ${c.red}Error: ${err.message}${c.reset}\n`);
      }

      prompt();
    });
  };

  prompt();
}

// ─── Main ─────────────────────────────────────────────────────────────
startServer();
startCLI();
