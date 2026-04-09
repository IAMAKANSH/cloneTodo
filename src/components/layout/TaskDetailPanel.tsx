import { useState, useEffect, useCallback } from 'react';
import {
  X, Sun, Calendar, Trash2, Star, Plus,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { taskActions } from '../../stores/taskStore';
import { useUIStore } from '../../stores';
import { TaskCheckbox } from '../tasks/TaskCheckbox';
import { TaskRecurrence } from '../tasks/TaskRecurrence';
import { TaskReminder } from '../tasks/TaskReminder';
import { TaskCategories } from '../tasks/TaskCategories';
import { formatCreatedDate, getTodayString } from '../../lib/dates';
import { motion } from 'framer-motion';

export function TaskDetailPanel() {
  const { selectedTaskId, closeDetailPanel } = useUIStore();

  const task = useLiveQuery(
    () => (selectedTaskId ? db.tasks.get(selectedTaskId) : undefined),
    [selectedTaskId]
  );
  const steps = useLiveQuery(
    () =>
      selectedTaskId
        ? db.steps.where('taskId').equals(selectedTaskId).sortBy('sortOrder')
        : [],
    [selectedTaskId]
  );

  const [editingTitle, setEditingTitle] = useState('');
  const [newStepTitle, setNewStepTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');

  useEffect(() => {
    if (task) {
      setEditingTitle(task.title);
      setNotes(task.notes);
      setDueDateInput(task.dueDate || '');
    }
  }, [task?.id, task?.title, task?.notes, task?.dueDate]);

  const saveTitle = useCallback(() => {
    if (task && editingTitle.trim() && editingTitle !== task.title) {
      taskActions.updateTask(task.id, { title: editingTitle.trim() });
    }
  }, [task, editingTitle]);

  const saveNotes = useCallback(() => {
    if (task && notes !== task.notes) {
      taskActions.updateTask(task.id, { notes });
    }
  }, [task, notes]);

  if (!task) return null;

  const isMyDay = task.isMyDay && task.myDayDate === getTodayString();
  const totalSteps = steps?.length || 0;

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="h-full flex flex-col shrink-0 no-print glass-subtle"
      style={{
        width: 'var(--detail-panel-width)',
        borderLeft: '1px solid var(--color-glass-border)',
      }}
    >
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Title section */}
        <div
          className="p-5"
          style={{
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div className="flex items-start gap-4">
            <div className="mt-0.5">
              <TaskCheckbox
                checked={task.isCompleted}
                isImportant={task.isImportant}
                onChange={() => taskActions.toggleComplete(task.id)}
              />
            </div>
            <input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => { if (e.key === 'Enter') { saveTitle(); (e.target as HTMLInputElement).blur(); } }}
              className={`flex-1 bg-transparent outline-none text-[16px] font-semibold leading-7 transition-all duration-200 ${task.isCompleted ? 'line-through' : ''}`}
              style={{
                color: task.isCompleted ? 'var(--color-completed-text)' : 'var(--color-text)',
              }}
            />
            <button
              onClick={() => taskActions.toggleImportant(task.id)}
              className="shrink-0 p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-task-hover)] transition-all duration-200 active:scale-90"
              style={{
                color: task.isImportant ? 'var(--color-important)' : 'var(--color-text-tertiary)',
                ...(task.isImportant ? { filter: 'drop-shadow(0 0 4px rgba(232,54,79,0.3))' } : {}),
              }}
            >
              <Star size={18} fill={task.isImportant ? 'currentColor' : 'none'} strokeWidth={task.isImportant ? 0 : 1.5} />
            </button>
          </div>

          {/* Steps */}
          {(steps && steps.length > 0 || true) && (
            <div className="mt-4 ml-9">
              {steps?.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-center gap-3 py-2 -mx-2 px-2 rounded-[var(--radius-md)] hover:bg-[var(--color-task-hover)] transition-all duration-150"
                >
                  <TaskCheckbox
                    checked={step.isCompleted}
                    onChange={() => taskActions.toggleStep(step.id)}
                    size="sm"
                  />
                  <span
                    className={`flex-1 text-[13px] leading-5 transition-all duration-200 ${step.isCompleted ? 'line-through' : ''}`}
                    style={{
                      color: step.isCompleted ? 'var(--color-completed-text)' : 'var(--color-text)',
                    }}
                  >
                    {step.title}
                  </span>
                  <button
                    onClick={() => taskActions.deleteStep(step.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-danger-bg)] transition-all duration-150"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}

              {/* Add step input */}
              <div className="flex items-center gap-3 py-2">
                <span
                  className="flex items-center justify-center w-[18px] h-[18px] rounded-full"
                  style={{ background: 'var(--color-primary-light)' }}
                >
                  <Plus size={12} style={{ color: 'var(--color-primary)' }} />
                </span>
                <input
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && newStepTitle.trim()) {
                      await taskActions.addStep(task.id, newStepTitle.trim());
                      setNewStepTitle('');
                    }
                  }}
                  placeholder={totalSteps > 0 ? 'Next step' : 'Add step'}
                  className="flex-1 bg-transparent outline-none text-[13px] leading-5"
                  style={{ color: 'var(--color-text)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action list */}
        <div className="mt-1 mx-1">
          {/* Add to My Day */}
          <button
            onClick={() => taskActions.toggleMyDay(task.id)}
            className={`detail-action w-full ${isMyDay ? 'active' : ''}`}
          >
            <Sun size={18} />
            <span className="flex-1 text-left">{isMyDay ? 'Added to My Day' : 'Add to My Day'}</span>
            {isMyDay && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  taskActions.toggleMyDay(task.id);
                }}
                className="p-1 hover:opacity-70 rounded-[var(--radius-sm)] hover:bg-[var(--color-task-hover)] transition-all"
              >
                <X size={14} />
              </span>
            )}
          </button>

          {/* Reminder */}
          <TaskReminder task={task} />

          {/* Due Date */}
          <div className={`detail-action ${task.dueDate ? 'active' : ''}`}>
            <Calendar size={18} />
            <div className="flex-1">
              <input
                type="date"
                value={dueDateInput}
                onChange={(e) => {
                  setDueDateInput(e.target.value);
                  taskActions.updateTask(task.id, { dueDate: e.target.value || null });
                }}
                className="bg-transparent outline-none text-[14px] w-full cursor-pointer"
                style={{
                  color: task.dueDate ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  colorScheme: 'auto',
                }}
              />
            </div>
            {task.dueDate && (
              <button
                onClick={() => {
                  setDueDateInput('');
                  taskActions.updateTask(task.id, { dueDate: null });
                }}
                className="p-1 hover:opacity-70 rounded-[var(--radius-sm)] hover:bg-[var(--color-task-hover)] transition-all"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Recurrence */}
          <TaskRecurrence task={task} />
        </div>

        {/* Categories */}
        <div
          className="mt-1 mx-1 rounded-[var(--radius-md)]"
          style={{
            background: 'var(--color-surface)',
          }}
        >
          <TaskCategories task={task} />
        </div>

        {/* Notes */}
        <div
          className="mt-1 mx-1 p-4 rounded-[var(--radius-md)]"
          style={{
            background: 'var(--color-surface)',
          }}
        >
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            placeholder="Add a note"
            rows={4}
            className="w-full bg-transparent outline-none text-[13px] leading-5 resize-none"
            style={{ color: 'var(--color-text)' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3.5 shrink-0 glass"
        style={{
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={closeDetailPanel}
          className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-task-hover)] transition-all duration-200 active:scale-95"
          style={{ color: 'var(--color-text-secondary)' }}
          title="Close"
        >
          <X size={18} />
        </button>

        <span className="text-[12px] font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
          Created {formatCreatedDate(task.createdAt)}
        </span>

        <button
          onClick={async () => {
            await taskActions.deleteTask(task.id);
            closeDetailPanel();
          }}
          className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-danger-bg)] transition-all duration-200 active:scale-95"
          style={{ color: 'var(--color-danger)' }}
          title="Delete task"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
}
