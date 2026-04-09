import { useState } from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { TaskItem } from './TaskItem';
import type { Task } from '../../types';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface CompletedSectionProps {
  tasks: Task[];
}

export function CompletedSection({ tasks }: CompletedSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (tasks.length === 0) return null;

  return (
    <div className="mt-2 mx-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2.5 px-4 py-3 w-full text-left rounded-[var(--radius-md)] transition-all duration-200 hover:bg-[var(--color-task-hover)] active:scale-[0.99]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <ChevronRight
          size={14}
          className={clsx('transition-transform duration-300', isExpanded && 'rotate-90')}
        />
        <CheckCircle2 size={15} style={{ color: 'var(--color-success)', opacity: 0.7 }} />
        <span className="text-[13px] font-semibold">Completed</span>
        <span
          className="count-badge ml-0.5"
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--color-success)',
          }}
        >
          {tasks.length}
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
              >
                <TaskItem task={task} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
