import { Tag, X, Plus } from 'lucide-react';
import { useState } from 'react';
import { taskActions } from '../../stores/taskStore';
import type { Task } from '../../types';

interface TaskCategoriesProps {
  task: Task;
}

export function TaskCategories({ task }: TaskCategoriesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const addCategory = () => {
    const cat = newCategory.trim();
    if (cat && !task.categories.includes(cat)) {
      taskActions.updateTask(task.id, {
        categories: [...task.categories, cat],
      });
    }
    setNewCategory('');
    setIsAdding(false);
  };

  const removeCategory = (cat: string) => {
    taskActions.updateTask(task.id, {
      categories: task.categories.filter((c) => c !== cat),
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <Tag size={18} style={{ color: 'var(--color-text-secondary)' }} />
        <span className="text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
          Pick a category
        </span>
      </div>

      {task.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 ml-8 mb-2">
          {task.categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium"
              style={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
              }}
            >
              {cat}
              <button
                onClick={() => removeCategory(cat)}
                className="hover:opacity-60 ml-0.5"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="ml-8">
        {isAdding ? (
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addCategory();
              if (e.key === 'Escape') { setIsAdding(false); setNewCategory(''); }
            }}
            onBlur={() => {
              if (newCategory.trim()) addCategory();
              else { setIsAdding(false); setNewCategory(''); }
            }}
            autoFocus
            placeholder="Category name"
            className="px-2 py-1 text-[13px] rounded-[var(--radius-sm)] outline-none w-full"
            style={{
              backgroundColor: 'var(--color-input-bg)',
              border: '1px solid var(--color-input-border)',
              color: 'var(--color-text)',
            }}
          />
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 text-[13px] py-1 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-primary)' }}
          >
            <Plus size={14} />
            Add category
          </button>
        )}
      </div>
    </div>
  );
}
