import { useEffect, useState, useRef } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { useUIStore } from '../../stores';
import { db } from '../../db/database';
import { TaskItem } from '../tasks/TaskItem';
import type { Task } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

export function SearchOverlay() {
  const { isSearchOpen, closeSearch, searchQuery, setSearchQuery } = useUIStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<Task[]>([]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    db.tasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.notes.toLowerCase().includes(query)
      )
      .toArray()
      .then(setResults);
  }, [searchQuery]);

  if (!isSearchOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="dialog-overlay flex items-start justify-center pt-[12vh]"
      onClick={closeSearch}
    >
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="dialog-content w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <Search size={20} style={{ color: 'var(--color-primary)' }} />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your tasks..."
            className="flex-1 bg-transparent outline-none text-[15px]"
            style={{ color: 'var(--color-text)' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-task-hover)] transition-all duration-200 active:scale-95"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[55vh] overflow-y-auto">
          {searchQuery.trim() && results.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
                No results found for "{searchQuery}"
              </p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="px-5 py-2.5">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
              </div>
              <AnimatePresence>
                {results.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={closeSearch}
                  >
                    <TaskItem task={task} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          ) : (
            <div className="px-5 py-14 text-center">
              <Sparkles
                size={36}
                style={{ color: 'var(--color-text-disabled)' }}
                className="mx-auto mb-3 float-animation"
              />
              <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                Search across all your tasks
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
