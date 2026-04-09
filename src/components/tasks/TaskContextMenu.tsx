import * as ContextMenu from '@radix-ui/react-context-menu';
import { Sun, Star, Calendar, ArrowRight, Copy, Trash2, CheckCircle2 } from 'lucide-react';
import { taskActions } from '../../stores/taskStore';
import { useLists } from '../../hooks/useLists';
import { getTodayString } from '../../lib/dates';
import type { Task } from '../../types';

interface TaskContextMenuProps {
  task: Task;
  children: React.ReactNode;
}

export function TaskContextMenu({ task, children }: TaskContextMenuProps) {
  const lists = useLists();

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="context-menu z-50">
          <ContextMenu.Item
            className="context-menu-item"
            onSelect={() => taskActions.toggleComplete(task.id)}
          >
            <CheckCircle2 size={16} />
            {task.isCompleted ? 'Mark as not completed' : 'Mark as completed'}
          </ContextMenu.Item>

          <ContextMenu.Item
            className="context-menu-item"
            onSelect={() => taskActions.toggleImportant(task.id)}
          >
            <Star size={16} />
            {task.isImportant ? 'Remove importance' : 'Mark as important'}
          </ContextMenu.Item>

          <ContextMenu.Item
            className="context-menu-item"
            onSelect={() => taskActions.toggleMyDay(task.id)}
          >
            <Sun size={16} />
            {task.isMyDay ? 'Remove from My Day' : 'Add to My Day'}
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px my-1" style={{ backgroundColor: 'var(--color-divider)' }} />

          <ContextMenu.Item
            className="context-menu-item"
            onSelect={() => taskActions.updateTask(task.id, { dueDate: getTodayString() })}
          >
            <Calendar size={16} />
            Due today
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px my-1" style={{ backgroundColor: 'var(--color-divider)' }} />

          {/* Move to list */}
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="context-menu-item">
              <ArrowRight size={16} />
              <span className="flex-1">Move to list</span>
              <span className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>&#9656;</span>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className="context-menu z-50">
                {lists?.filter((l) => l.id !== task.listId).map((list) => (
                  <ContextMenu.Item
                    key={list.id}
                    className="context-menu-item"
                    onSelect={() => taskActions.moveTask(task.id, list.id)}
                  >
                    {list.name}
                  </ContextMenu.Item>
                ))}
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          {/* Copy to list */}
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="context-menu-item">
              <Copy size={16} />
              <span className="flex-1">Copy to list</span>
              <span className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>&#9656;</span>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className="context-menu z-50">
                {lists?.map((list) => (
                  <ContextMenu.Item
                    key={list.id}
                    className="context-menu-item"
                    onSelect={() => taskActions.copyTask(task.id, list.id)}
                  >
                    {list.name}
                  </ContextMenu.Item>
                ))}
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          <ContextMenu.Separator className="h-px my-1" style={{ backgroundColor: 'var(--color-divider)' }} />

          <ContextMenu.Item
            className="context-menu-item"
            style={{ color: 'var(--color-danger)' }}
            onSelect={() => taskActions.deleteTask(task.id)}
          >
            <Trash2 size={16} />
            Delete task
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
