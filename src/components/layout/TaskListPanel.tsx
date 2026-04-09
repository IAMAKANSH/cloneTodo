import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useUIStore } from '../../stores';
import { useTasks, useCompletedTasks } from '../../hooks/useTasks';
import { TaskItem } from '../tasks/TaskItem';
import { TaskInput } from '../tasks/TaskInput';
import { CompletedSection } from '../tasks/CompletedSection';
import { ListHeader } from './ListHeader';
import { IntegrationViewHeader } from './IntegrationViewHeader';
import { MyDaySuggestions } from '../myday/MyDaySuggestions';
import { FlaggedEmailsList } from '../outlook/FlaggedEmailsList';
import { CalendarEventsSection } from '../calendar/CalendarEventsSection';
import { TeamsMentionsList, PlannerTasksList } from '../teams/TeamsMentionsList';
import { useLists } from '../../hooks/useLists';
import { taskActions } from '../../stores/taskStore';
import { ClipboardList, Sun, Star, Calendar, UserCheck } from 'lucide-react';
import type { Task } from '../../types';

const SMART_LIST_IDS = ['myday', 'important', 'planned', 'assigned', 'tasks'];
const INTEGRATION_VIEWS = ['outlook-mail', 'outlook-calendar', 'planner', 'teams'];

const EMPTY_STATES: Record<string, { icon: React.ReactNode; title: string; subtitle: string }> = {
  myday: {
    icon: <Sun size={64} strokeWidth={1} />,
    title: 'Focus on your day',
    subtitle: 'Get things done with My Day, a list that refreshes every day.',
  },
  important: {
    icon: <Star size={64} strokeWidth={1} />,
    title: 'Try starring some tasks',
    subtitle: 'Starred tasks show up here so you can easily find them.',
  },
  planned: {
    icon: <Calendar size={64} strokeWidth={1} />,
    title: 'Stay on schedule',
    subtitle: 'Tasks with due dates will appear here.',
  },
  assigned: {
    icon: <UserCheck size={64} strokeWidth={1} />,
    title: 'Tasks assigned to you',
    subtitle: 'Tasks assigned to you will show up here.',
  },
};

function SortableTaskItem({ task, showListName }: { task: Task; showListName?: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 'auto' as const,
    position: 'relative' as const,
    scale: isDragging ? '1.02' : '1',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskItem task={task} showListName={showListName} />
    </div>
  );
}

export function TaskListPanel() {
  const activeView = useUIStore((s) => s.activeView);
  const tasks = useTasks(activeView);
  const completedTasks = useCompletedTasks(activeView);
  const lists = useLists();

  const isSmartList = SMART_LIST_IDS.includes(activeView);
  const isIntegrationView = INTEGRATION_VIEWS.includes(activeView);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function getListName(listId: string): string | undefined {
    if (!isSmartList || activeView === 'tasks') return undefined;
    return lists?.find((l) => l.id === listId)?.name;
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !tasks) return;

      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = [...tasks];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      const listId = !isSmartList ? activeView : moved.listId;
      await taskActions.reorderTasks(listId, reordered.map((t) => t.id));
    },
    [tasks, activeView, isSmartList]
  );

  // Render integration views
  if (isIntegrationView) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <IntegrationViewHeader viewId={activeView} />
        <div className="flex-1 overflow-y-auto">
          {activeView === 'outlook-mail' && <FlaggedEmailsList />}
          {activeView === 'outlook-calendar' && <CalendarEventsSection />}
          {activeView === 'planner' && <PlannerTasksList />}
          {activeView === 'teams' && <TeamsMentionsList />}
        </div>
      </div>
    );
  }

  const emptyState = EMPTY_STATES[activeView] || {
    icon: <ClipboardList size={64} strokeWidth={1} />,
    title: 'All done!',
    subtitle: 'Tasks you add will show up here.',
  };

  const taskIds = tasks?.map((t) => t.id) || [];

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden min-w-0"
    >
      {/* Header */}
      <ListHeader />

      {/* My Day Suggestions */}
      {activeView === 'myday' && <MyDaySuggestions />}

      {/* Add Task Input */}
      <TaskInput />

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pb-4">
        {tasks === undefined ? (
          /* Loading skeleton */
          <div className="px-4 py-3 flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 rounded-[var(--radius-md)] skeleton-shimmer"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border-subtle)',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div className="w-5 h-5 rounded-full skeleton-shimmer" />
                <div className="flex-1 flex flex-col gap-2">
                  <div
                    className="h-3.5 rounded-full skeleton-shimmer"
                    style={{ width: `${50 + i * 12}%` }}
                  />
                  <div
                    className="h-2.5 rounded-full skeleton-shimmer"
                    style={{ width: `${30 + i * 8}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 && (!completedTasks || completedTasks.length === 0) ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <span
              className="float-animation"
              style={{
                color: 'var(--color-text-disabled)',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))',
              }}
            >
              {emptyState.icon}
            </span>
            <h3
              className="text-[18px] font-semibold mt-6 mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              {emptyState.title}
            </h3>
            <p
              className="text-[13px] max-w-[300px] leading-5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {emptyState.subtitle}
            </p>
          </div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <SortableTaskItem
                      task={task}
                      showListName={getListName(task.listId)}
                    />
                  </div>
                ))}
              </SortableContext>
            </DndContext>
            {completedTasks && <CompletedSection tasks={completedTasks} />}
          </>
        )}
      </div>
    </div>
  );
}
