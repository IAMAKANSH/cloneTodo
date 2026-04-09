import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { Users, Plus, MessageSquare } from 'lucide-react';
import { taskActions } from '../../stores/taskStore';
import { motion } from 'framer-motion';

export function TeamsMentionsList() {
  const mentions = useLiveQuery(() =>
    db.teamsMentions.orderBy('createdDateTime').reverse().toArray()
  );

  if (!mentions) return null;

  if (mentions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
        <span className="float-animation" style={{ color: 'var(--color-text-disabled)' }}>
          <Users size={64} strokeWidth={1} />
        </span>
        <h3 className="text-[18px] font-semibold mt-6 mb-2" style={{ color: 'var(--color-text)' }}>
          No Teams messages
        </h3>
        <p className="text-[13px] max-w-[300px] leading-5" style={{ color: 'var(--color-text-secondary)' }}>
          Recent Teams chat messages will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {mentions.map((mention, index) => (
        <motion.div
          key={mention.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="mx-3 my-1 p-4 rounded-[var(--radius-md)] transition-all duration-200 hover:translate-y-[-1px] group"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: 'rgba(98, 100, 167, 0.1)', color: '#6264a7' }}
            >
              <MessageSquare size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                {mention.senderName}
              </p>
              <p className="text-[14px] mt-0.5 line-clamp-2 leading-5" style={{ color: 'var(--color-text)' }}>
                {stripHtml(mention.messagePreview)}
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                {formatRelativeTime(mention.createdDateTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 ml-11">
            <button
              onClick={async () => {
                const title = `Follow up: ${stripHtml(mention.messagePreview).slice(0, 60)}`;
                await taskActions.createTask(title, 'default-tasks', {});
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-[12px] font-medium transition-all duration-200 active:scale-95"
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                boxShadow: '0 2px 6px var(--color-primary-glow)',
              }}
            >
              <Plus size={12} />
              Create task
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function PlannerTasksList() {
  const tasks = useLiveQuery(() => db.plannerTasks.toArray());

  if (!tasks) return null;

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
        <span className="float-animation" style={{ color: 'var(--color-text-disabled)' }}>
          <Users size={64} strokeWidth={1} />
        </span>
        <h3 className="text-[18px] font-semibold mt-6 mb-2" style={{ color: 'var(--color-text)' }}>
          No Planner tasks
        </h3>
        <p className="text-[13px] max-w-[300px] leading-5" style={{ color: 'var(--color-text-secondary)' }}>
          Tasks assigned to you in Microsoft Planner will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {tasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="mx-3 my-1 p-4 rounded-[var(--radius-md)] transition-all duration-200 hover:translate-y-[-1px]"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {task.title}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {task.dueDateTime && (
                  <span className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
                    Due {task.dueDateTime.split('T')[0]}
                  </span>
                )}
                <span className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
                  {task.percentComplete}% complete
                </span>
              </div>
            </div>
            {/* Progress ring */}
            <div className="shrink-0">
              <svg width="28" height="28" viewBox="0 0 28 28">
                <circle cx="14" cy="14" r="11" fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
                <circle
                  cx="14" cy="14" r="11" fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${(task.percentComplete / 100) * 69.1} 69.1`}
                  transform="rotate(-90 14 14)"
                  className="progress-ring"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={async () => {
                await taskActions.createTask(task.title, 'default-tasks', {
                  dueDate: task.dueDateTime?.split('T')[0] || null,
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-[12px] font-medium transition-all duration-200 active:scale-95"
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                boxShadow: '0 2px 6px var(--color-primary-glow)',
              }}
            >
              <Plus size={12} />
              Add to my tasks
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
