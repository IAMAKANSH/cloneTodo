import type { ParsedCommand, CommandType } from '../../types/chat';

interface PatternRule {
  pattern: RegExp;
  type: CommandType;
  extract: (match: RegExpMatchArray) => Partial<ParsedCommand>;
}

const rules: PatternRule[] = [
  // Add to My Day
  {
    pattern: /^(?:add\s+(?:task\s+)?to\s+my\s*day)[:\s]+(.+)/i,
    type: 'add_to_myday',
    extract: (m) => ({ taskTitle: m[1].trim() }),
  },
  {
    pattern: /^(?:my\s*day)[:\s]+(.+)/i,
    type: 'add_to_myday',
    extract: (m) => ({ taskTitle: m[1].trim() }),
  },

  // Add task
  {
    pattern: /^(?:add|create|new)\s+(?:a\s+)?task[:\s]+(.+)/i,
    type: 'add_task',
    extract: (m) => ({ taskTitle: m[1].trim() }),
  },
  {
    pattern: /^(?:add|create|new)\s+(?:a\s+)?task$/i,
    type: 'add_task',
    extract: () => ({}),
  },
  {
    pattern: /^(?:add|create)[:\s]+(.+)/i,
    type: 'add_task',
    extract: (m) => ({ taskTitle: m[1].trim() }),
  },

  // Complete task
  {
    pattern: /^(?:complete|done|finish|check|mark\s+(?:as\s+)?done|mark\s+(?:as\s+)?complete)[:\s]+(?:task[:\s]+)?(.+)/i,
    type: 'complete_task',
    extract: (m) => ({ taskTitle: m[1].trim() }),
  },

  // Delete task
  {
    pattern: /^(?:delete|remove|trash)[:\s]+(?:task[:\s]+)?(.+)/i,
    type: 'delete_task',
    extract: (m) => ({ taskTitle: m[1].trim() }),
  },

  // Star / important
  {
    pattern: /^(?:star|unstar|mark\s+(?:as\s+)?important|important)[:\s]+(?:task[:\s]+)?(.+)/i,
    type: 'star_task',
    extract: (m) => ({ taskTitle: m[1].trim() }),
  },

  // Search
  {
    pattern: /^(?:search|find|look\s+for|search\s+for(?:\s+task)?(?:\s+about)?)[:\s]+(.+)/i,
    type: 'search_tasks',
    extract: (m) => ({ searchQuery: m[1].trim() }),
  },

  // Show tasks
  {
    pattern: /^(?:show|list|get|what(?:'s|\s+is))\s+(?:my\s+)?(?:tasks?\s+(?:for\s+)?)?(?:my\s*day|today)/i,
    type: 'show_tasks',
    extract: () => ({ viewFilter: 'myday' as const }),
  },
  {
    pattern: /^(?:show|list|get)\s+(?:my\s+)?(?:important|starred)\s*(?:tasks?)?/i,
    type: 'show_tasks',
    extract: () => ({ viewFilter: 'important' as const }),
  },
  {
    pattern: /^(?:show|list|get)\s+(?:my\s+)?(?:completed|done)\s*(?:tasks?)?/i,
    type: 'show_tasks',
    extract: () => ({ viewFilter: 'completed' as const }),
  },
  {
    pattern: /^(?:show|list|get|what(?:'s|\s+are))\s+(?:my\s+)?(?:all\s+)?tasks?/i,
    type: 'show_tasks',
    extract: () => ({ viewFilter: 'all' as const }),
  },
  {
    pattern: /^(?:my\s*day|today)$/i,
    type: 'show_tasks',
    extract: () => ({ viewFilter: 'myday' as const }),
  },
  {
    pattern: /^tasks?$/i,
    type: 'show_tasks',
    extract: () => ({ viewFilter: 'all' as const }),
  },

  // Calendar
  {
    pattern: /^(?:show\s+(?:my\s+)?)?(?:calendar|meetings?|events?|schedule|what(?:'s|\s+are)\s+(?:my\s+)?(?:meetings?|events?|schedule))/i,
    type: 'show_calendar',
    extract: () => ({}),
  },

  // Emails
  {
    pattern: /^(?:show\s+(?:my\s+)?)?(?:emails?|mail|flagged\s+emails?|inbox|any\s+(?:flagged\s+)?emails?)/i,
    type: 'show_emails',
    extract: () => ({}),
  },

  // Planner
  {
    pattern: /^(?:show\s+(?:my\s+)?)?planner(?:\s+tasks?)?/i,
    type: 'show_planner',
    extract: () => ({}),
  },

  // Teams
  {
    pattern: /^(?:show\s+(?:my\s+)?)?(?:teams?|chats?|mentions?)/i,
    type: 'show_teams',
    extract: () => ({}),
  },

  // Help
  {
    pattern: /^(?:help|commands?|what\s+can\s+you\s+do|\?|how\s+to)/i,
    type: 'help',
    extract: () => ({}),
  },
];

export function parseCommand(input: string): ParsedCommand {
  const text = input.trim();

  for (const rule of rules) {
    const match = text.match(rule.pattern);
    if (match) {
      return { type: rule.type, ...rule.extract(match) };
    }
  }

  return { type: 'unknown' };
}
