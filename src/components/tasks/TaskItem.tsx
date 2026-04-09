import { Star, Sun, Repeat, FileText } from 'lucide-react';
import { TaskCheckbox } from './TaskCheckbox';
import { TaskContextMenu } from './TaskContextMenu';
import { taskActions } from '../../stores/taskStore';
import { useUIStore } from '../../stores';
import { formatDueDate, isDueDateOverdue } from '../../lib/dates';
import type { Task } from '../../types';
import { clsx } from 'clsx';
import { memo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';

interface TaskItemProps {
  task: Task;
  showListName?: string;
}

export const TaskItem = memo(function TaskItem({ task, showListName }: TaskItemProps) {
  const { selectedTaskId, selectTask } = useUIStore();
  const isSelected = selectedTaskId === task.id;
  const isOverdue = task.dueDate && !task.isCompleted && isDueDateOverdue(task.dueDate);

  const steps = useLiveQuery(
    () => db.steps.where('taskId').equals(task.id).toArray(),
    [task.id]
  );
  const completedSteps = steps?.filter((s) => s.isCompleted).length || 0;
  const totalSteps = steps?.length || 0;

  const metadata: React.ReactNode[] = [];

  if (showListName) {
    metadata.push(
      <span key="list" className="flex items-center gap-1">
        <FileText size={11} />
        {showListName}
      </span>
    );
  }

  if (task.isMyDay && !task.isCompleted) {
    metadata.push(
      <span key="myday" className="flex items-center gap-1" style={{ color: 'var(--color-warning)' }}>
        <Sun size={11} />
        My Day
      </span>
    );
  }

  if (task.dueDate) {
    metadata.push(
      <span
        key="due"
        style={{ color: isOverdue ? 'var(--color-overdue)' : undefined }}
      >
        {formatDueDate(task.dueDate)}
      </span>
    );
  }

  if (task.recurrence) {
    metadata.push(
      <span key="recur" className="flex items-center gap-1">
        <Repeat size={11} />
      </span>
    );
  }

  if (totalSteps > 0) {
    metadata.push(
      <span key="steps" className="flex items-center gap-1">
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '1.5px solid var(--color-text-tertiary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            fontWeight: 700,
          }}
        >
          {completedSteps}
        </span>
        {completedSteps}/{totalSteps}
      </span>
    );
  }

  if (task.categories.length > 0) {
    metadata.push(
      <span key="cat" className="badge-pill"
        style={{
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
        }}>
        {task.categories[0]}
        {task.categories.length > 1 && ` +${task.categories.length - 1}`}
      </span>
    );
  }

  return (
    <TaskContextMenu task={task}>
      <div
        onClick={() => selectTask(task.id)}
        className={clsx('task-item group', isSelected && 'selected')}
        style={{
          animation: 'fadeInUp 0.3s ease-out backwards',
        }}
      >
        <TaskCheckbox
          checked={task.isCompleted}
          isImportant={task.isImportant}
          onChange={() => taskActions.toggleComplete(task.id)}
        />

        <div className="flex-1 min-w-0">
          <p
            className={clsx(
              'text-[14px] leading-5 truncate transition-all duration-200',
              task.isCompleted && 'line-through'
            )}
            style={{
              color: task.isCompleted ? 'var(--color-completed-text)' : 'var(--color-text)',
              fontWeight: task.isCompleted ? 400 : 450,
            }}
          >
            {task.title}
          </p>

          {metadata.length > 0 && (
            <div
              className="flex items-center gap-1.5 mt-1.5 text-[11px] leading-4 flex-wrap"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {metadata.map((item, i) => (
                <span key={i} className="flex items-center">
                  {i > 0 && (
                    <span className="mx-1.5 w-0.5 h-0.5 rounded-full" style={{ background: 'var(--color-text-disabled)' }} />
                  )}
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Importance Star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            taskActions.toggleImportant(task.id);
          }}
          className="shrink-0 p-2 -mr-2 rounded-[var(--radius-md)] transition-all duration-200 hover:bg-[var(--color-task-hover)] active:scale-90 opacity-60 group-hover:opacity-100"
          style={{
            color: task.isImportant ? 'var(--color-important)' : 'var(--color-text-tertiary)',
            ...(task.isImportant ? { opacity: 1, filter: 'drop-shadow(0 0 4px rgba(232, 54, 79, 0.3))' } : {}),
          }}
          aria-label={task.isImportant ? 'Remove importance' : 'Mark as important'}
        >
          <Star
            size={18}
            fill={task.isImportant ? 'currentColor' : 'none'}
            strokeWidth={task.isImportant ? 0 : 1.5}
          />
        </button>
      </div>
    </TaskContextMenu>
  );
});
