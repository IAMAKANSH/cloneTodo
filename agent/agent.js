#!/usr/bin/env node

import { createInterface } from 'readline';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';

// ─── Config ───────────────────────────────────────────────────────────
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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';
const MODEL = 'meta/llama-3.1-70b-instruct';
const API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const TASKS_FILE = new URL('./tasks.json', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

// ─── Colors ───────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  purple: '\x1b[38;2;139;92;246m',
  blue: '\x1b[38;2;96;165;250m',
  green: '\x1b[38;2;16;185;129m',
  yellow: '\x1b[38;2;245;158;11m',
  red: '\x1b[38;2;232;54;79m',
  gray: '\x1b[38;2;150;150;170m',
  white: '\x1b[97m',
  bgPurple: '\x1b[48;2;99;102;241m',
  cyan: '\x1b[38;2;34;211;238m',
};

// ─── Task Storage ─────────────────────────────────────────────────────
function loadTasks() {
  if (existsSync(TASKS_FILE)) {
    return JSON.parse(readFileSync(TASKS_FILE, 'utf-8'));
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

// ─── Actions ──────────────────────────────────────────────────────────
const actions = {
  add_task({ title, important = false, add_to_myday = false }) {
    const tasks = loadTasks();
    const task = {
      id: randomUUID(),
      title,
      isCompleted: false,
      isImportant: important,
      isMyDay: add_to_myday,
      createdAt: new Date().toISOString(),
    };
    tasks.push(task);
    saveTasks(tasks);
    return { text: `${c.green}✓${c.reset} Created: ${c.bold}${title}${c.reset}${important ? ` ${c.yellow}★${c.reset}` : ''}${add_to_myday ? ` ${c.yellow}☀${c.reset}` : ''}` };
  },

  show_tasks({ filter = 'all' }) {
    const tasks = loadTasks();
    let filtered;
    let label;
    switch (filter) {
      case 'myday': filtered = tasks.filter(t => !t.isCompleted && t.isMyDay); label = 'My Day'; break;
      case 'important': filtered = tasks.filter(t => !t.isCompleted && t.isImportant); label = 'Important'; break;
      case 'completed': filtered = tasks.filter(t => t.isCompleted); label = 'Completed'; break;
      default: filtered = tasks.filter(t => !t.isCompleted); label = 'All';
    }

    if (filtered.length === 0) return { text: `${c.dim}No ${label.toLowerCase()} tasks.${c.reset}` };

    const lines = filtered.map((t, i) => {
      const check = t.isCompleted ? `${c.green}✓${c.reset}` : `${c.dim}○${c.reset}`;
      const star = t.isImportant ? ` ${c.yellow}★${c.reset}` : '';
      const sun = t.isMyDay ? ` ${c.yellow}☀${c.reset}` : '';
      const title = t.isCompleted ? `${c.dim}${t.title}${c.reset}` : t.title;
      return `  ${c.dim}${i + 1}.${c.reset} ${check} ${title}${star}${sun}`;
    });

    return { text: `${c.bold}${label} tasks${c.reset} ${c.dim}(${filtered.length})${c.reset}\n${lines.join('\n')}` };
  },

  complete_task({ search }) {
    const tasks = loadTasks();
    const match = findTask(search, tasks.filter(t => !t.isCompleted));
    if (!match) return { text: `${c.red}✗${c.reset} No task matching "${search}"` };
    match.isCompleted = true;
    saveTasks(tasks);
    return { text: `${c.green}✓${c.reset} Completed: ${c.dim}${match.title}${c.reset}` };
  },

  delete_task({ search }) {
    const tasks = loadTasks();
    const match = findTask(search, tasks);
    if (!match) return { text: `${c.red}✗${c.reset} No task matching "${search}"` };
    const updated = tasks.filter(t => t.id !== match.id);
    saveTasks(updated);
    return { text: `${c.red}🗑${c.reset} Deleted: ${c.dim}${match.title}${c.reset}` };
  },

  star_task({ search }) {
    const tasks = loadTasks();
    const match = findTask(search, tasks.filter(t => !t.isCompleted));
    if (!match) return { text: `${c.red}✗${c.reset} No task matching "${search}"` };
    match.isImportant = !match.isImportant;
    saveTasks(tasks);
    return { text: `${match.isImportant ? c.yellow + '★' : c.dim + '☆'}${c.reset} ${match.isImportant ? 'Starred' : 'Unstarred'}: ${match.title}` };
  },

  add_to_myday({ search }) {
    const tasks = loadTasks();
    const match = findTask(search, tasks.filter(t => !t.isCompleted));
    if (!match) return { text: `${c.red}✗${c.reset} No task matching "${search}"` };
    match.isMyDay = !match.isMyDay;
    saveTasks(tasks);
    return { text: `${c.yellow}☀${c.reset} ${match.isMyDay ? 'Added to' : 'Removed from'} My Day: ${match.title}` };
  },

  search_tasks({ query }) {
    const tasks = loadTasks();
    const q = query.toLowerCase();
    const found = tasks.filter(t => t.title.toLowerCase().includes(q));
    if (found.length === 0) return { text: `${c.dim}No tasks matching "${query}"${c.reset}` };
    const lines = found.map((t, i) => {
      const check = t.isCompleted ? `${c.green}✓${c.reset}` : `${c.dim}○${c.reset}`;
      return `  ${c.dim}${i + 1}.${c.reset} ${check} ${t.title}`;
    });
    return { text: `${c.bold}Search: "${query}"${c.reset} ${c.dim}(${found.length})${c.reset}\n${lines.join('\n')}` };
  },
};

// ─── AI ───────────────────────────────────────────────────────────────
function buildSystemPrompt() {
  const tasks = loadTasks();
  const active = tasks.filter(t => !t.isCompleted);
  const today = new Date().toISOString().split('T')[0];

  let taskList = '';
  if (active.length > 0 && active.length <= 30) {
    taskList = `\nActive tasks: ${active.map(t => `"${t.title}"${t.isImportant ? ' ⭐' : ''}${t.isMyDay ? ' ☀️' : ''}`).join(', ')}`;
  }

  return `You are a task management AI assistant running in a terminal.
Today: ${today}. Tasks: ${active.length} active, ${tasks.filter(t => t.isCompleted).length} completed.${taskList}

When the user wants an action, respond with ONLY JSON:
\`\`\`json
{"action": "ACTION", "params": {PARAMS}}
\`\`\`

Actions:
- {"action": "add_task", "params": {"title": "name", "important": false, "add_to_myday": false}}
- {"action": "show_tasks", "params": {"filter": "all|myday|important|completed"}}
- {"action": "complete_task", "params": {"search": "task name"}}
- {"action": "delete_task", "params": {"search": "task name"}}
- {"action": "star_task", "params": {"search": "task name"}}
- {"action": "add_to_myday", "params": {"search": "task name"}}
- {"action": "search_tasks", "params": {"query": "keyword"}}

For casual chat, respond normally (no JSON). Be concise (1-2 sentences).`;
}

async function chat(userMessage, history) {
  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    ...history.slice(-8),
    { role: 'user', content: userMessage },
  ];

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.3,
      stream: false,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Try to extract JSON action
  const jsonMatch = content.match(/```json\s*\n?([\s\S]*?)\n?\s*```/) || content.match(/(\{[\s\S]*"action"[\s\S]*\})/);

  if (jsonMatch) {
    try {
      const parsed = JSON.parse((jsonMatch[1] || jsonMatch[0]).trim());
      if (parsed.action && actions[parsed.action]) {
        const result = actions[parsed.action](parsed.params || {});
        return { display: result.text, aiContent: `Action executed: ${parsed.action}` };
      }
    } catch {}
  }

  return { display: content, aiContent: content };
}

// ─── UI ───────────────────────────────────────────────────────────────
function printBanner() {
  console.log('');
  console.log(`  ${c.bgPurple}${c.white}${c.bold}  ✨ Task Agent  ${c.reset}`);
  console.log(`  ${c.dim}AI-powered task manager — type anything${c.reset}`);
  console.log(`  ${c.dim}Powered by NVIDIA NIM (Llama 3.1 70B)${c.reset}`);
  console.log(`  ${c.dim}Type "quit" to exit${c.reset}`);
  console.log('');

  // Show current tasks on start
  const result = actions.show_tasks({ filter: 'all' });
  console.log(result.text);
  console.log('');
}

async function main() {
  printBanner();

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const history = [];

  rl.on('close', () => {
    console.log(`\n${c.dim}Goodbye! 👋${c.reset}\n`);
    process.exit(0);
  });

  const prompt = () => {
    rl.question(`${c.purple}${c.bold}❯${c.reset} `, async (input) => {
      const trimmed = input.trim();
      if (!trimmed) return prompt();
      if (trimmed === 'quit' || trimmed === 'exit') {
        console.log(`\n${c.dim}Goodbye! 👋${c.reset}\n`);
        rl.close();
        return;
      }

      // Quick local commands (no AI needed)
      if (trimmed === 'tasks' || trimmed === 'ls') {
        console.log('');
        console.log(actions.show_tasks({ filter: 'all' }).text);
        console.log('');
        return prompt();
      }

      try {
        process.stdout.write(`${c.dim}  thinking...${c.reset}`);
        const result = await chat(trimmed, history);
        process.stdout.write('\r\x1b[K'); // Clear "thinking..."

        console.log(`  ${c.cyan}⚡${c.reset} ${result.display}`);
        console.log('');

        history.push({ role: 'user', content: trimmed });
        history.push({ role: 'assistant', content: result.aiContent });
      } catch (err) {
        process.stdout.write('\r\x1b[K');
        console.log(`  ${c.red}Error: ${err.message}${c.reset}`);
        console.log('');
      }

      prompt();
    });
  };

  prompt();
}

main();
