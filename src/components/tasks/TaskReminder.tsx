import { Bell, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { taskActions } from '../../stores/taskStore';
import { format, addHours, addDays, parseISO } from 'date-fns';
import type { Task } from '../../types';

interface TaskReminderProps {
  task: Task;
}

export function TaskReminder({ task }: TaskReminderProps) {
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

  const quickOptions = [
    {
      label: 'Later today',
      sub: format(addHours(new Date(), 3), 'h:mm a'),
      getDate: () => addHours(new Date(), 3).toISOString(),
    },
    {
      label: 'Tomorrow',
      sub: 'Wed, 9:00 AM',
      getDate: () => { const d = addDays(new Date(), 1); d.setHours(9, 0, 0, 0); return d.toISOString(); },
    },
    {
      label: 'Next week',
      sub: format(addDays(new Date(), 7), 'EEE, h:mm a'),
      getDate: () => { const d = addDays(new Date(), 7); d.setHours(9, 0, 0, 0); return d.toISOString(); },
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`detail-action w-full ${task.reminderDate ? 'active' : ''}`}
      >
        <Bell size={18} />
        <span className="flex-1 text-left">
          {task.reminderDate
            ? format(parseISO(task.reminderDate), 'EEE, MMM d, h:mm a')
            : 'Remind me'}
        </span>
        {task.reminderDate && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              taskActions.updateTask(task.id, { reminderDate: null, reminderFired: false });
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
          {quickOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                taskActions.updateTask(task.id, {
                  reminderDate: opt.getDate(),
                  reminderFired: false,
                });
                setIsOpen(false);
              }}
              className="context-menu-item w-full text-left"
            >
              <div>
                <div className="text-[14px]">{opt.label}</div>
                <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>{opt.sub}</div>
              </div>
            </button>
          ))}
          <div className="h-px my-1" style={{ backgroundColor: 'var(--color-divider)' }} />
          <div className="px-3 py-2">
            <label className="text-[12px] font-medium block mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Pick a date & time
            </label>
            <input
              type="datetime-local"
              onChange={(e) => {
                if (e.target.value) {
                  taskActions.updateTask(task.id, {
                    reminderDate: new Date(e.target.value).toISOString(),
                    reminderFired: false,
                  });
                  setIsOpen(false);
                }
              }}
              className="w-full text-[13px] bg-transparent outline-none rounded px-2 py-1.5"
              style={{
                color: 'var(--color-text)',
                border: '1px solid var(--color-input-border)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
