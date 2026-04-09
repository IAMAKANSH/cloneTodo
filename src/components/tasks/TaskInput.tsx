import { useState, useRef } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { taskActions } from '../../stores/taskStore';
import { useUIStore } from '../../stores';
import { getTodayString } from '../../lib/dates';
import type { SmartListId } from '../../types';

interface TaskInputProps {
  listId?: string;
}

export function TaskInput({ listId }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const activeView = useUIStore((s) => s.activeView);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const options: Record<string, unknown> = {};

    if (activeView === 'myday') {
      options.isMyDay = true;
      options.myDayDate = getTodayString();
    } else if (activeView === 'important') {
      options.isImportant = true;
    }

    const targetListId = listId || (isSmartList(activeView) ? 'default-tasks' : activeView);
    await taskActions.createTask(title.trim(), targetListId, options);
    setTitle('');
  };

  return (
    <div
      className="add-task-input glow-border"
      onClick={() => inputRef.current?.focus()}
    >
      <div
        className="shrink-0 transition-all duration-300"
        style={{
          color: isFocused ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
          transform: isFocused ? 'scale(1.1) rotate(-15deg)' : 'scale(1) rotate(0)',
        }}
      >
        {isFocused ? <Sparkles size={20} /> : <Plus size={20} />}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
        placeholder="Add a task"
        className="flex-1 bg-transparent outline-none text-[14px] leading-5"
        style={{
          color: isFocused ? 'var(--color-text)' : 'var(--color-text-secondary)',
        }}
      />

      {title.trim() && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSubmit();
          }}
          className="shrink-0 px-3 py-1.5 rounded-[var(--radius-md)] text-[12px] font-semibold transition-all duration-200 active:scale-95"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-text-on-primary)',
            boxShadow: '0 2px 8px var(--color-primary-glow)',
          }}
        >
          Add
        </button>
      )}
    </div>
  );
}

function isSmartList(view: string): view is SmartListId {
  return ['myday', 'important', 'planned', 'assigned', 'tasks'].includes(view);
}
