import type { Task } from '../../types';

export function findBestTaskMatch(query: string, tasks: Task[]): Task | null {
  if (!query || tasks.length === 0) return null;

  const q = query.toLowerCase().trim();

  // 1. Exact match
  const exact = tasks.find((t) => t.title.toLowerCase() === q);
  if (exact) return exact;

  // 2. Starts with
  const starts = tasks.find((t) => t.title.toLowerCase().startsWith(q));
  if (starts) return starts;

  // 3. Contains
  const contains = tasks.find((t) => t.title.toLowerCase().includes(q));
  if (contains) return contains;

  // 4. Fuzzy match using trigram similarity
  let bestScore = 0;
  let bestTask: Task | null = null;

  for (const task of tasks) {
    const score = trigramSimilarity(q, task.title.toLowerCase());
    if (score > bestScore && score > 0.3) {
      bestScore = score;
      bestTask = task;
    }
  }

  return bestTask;
}

function trigrams(str: string): Set<string> {
  const set = new Set<string>();
  const padded = `  ${str} `;
  for (let i = 0; i < padded.length - 2; i++) {
    set.add(padded.slice(i, i + 3));
  }
  return set;
}

function trigramSimilarity(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  let intersection = 0;
  for (const t of ta) {
    if (tb.has(t)) intersection++;
  }
  const union = ta.size + tb.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
