import { Repeat, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { taskActions } from '../../stores/taskStore';
import { describeRecurrence } from '../../lib/recurrence';
import type { Task, RecurrenceRule } from '../../types';

interface TaskRecurrenceProps {
  task: Task;
}

const QUICK_OPTIONS: { label: string; rule: RecurrenceRule }[] = [
  { label: 'Daily', rule: { frequency: 'daily', interval: 1 } },
  { label: 'Weekdays', rule: { frequency: 'weekly', interval: 1, daysOfWeek: [1, 2, 3, 4, 5] } },
  { label: 'Weekly', rule: { frequency: 'weekly', interval: 1 } },
  { label: 'Monthly', rule: { frequency: 'monthly', interval: 1 } },
  { label: 'Yearly', rule: { frequency: 'yearly', interval: 1 } },
];

export function TaskRecurrence({ task }: TaskRecurrenceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`detail-action w-full ${task.recurrence ? 'active' : ''}`}
      >
        <Repeat size={18} />
        <span className="flex-1 text-left">
          {task.recurrence ? describeRecurrence(task.recurrence) : 'Repeat'}
        </span>
        {task.recurrence && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              taskActions.updateTask(task.id, { recurrence: null });
            }}
            className="p-0.5 hover:opacity-70"
          >
            <X size={14} />
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute left-4 right-4 top-full mt-1 z-20 rounded-[var(--radius-md)] py-1"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-16)',
            border: '1px solid var(--color-border)',
          }}
        >
          {QUICK_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                taskActions.updateTask(task.id, { recurrence: opt.rule });
                setIsOpen(false);
              }}
              className="context-menu-item w-full text-left"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
