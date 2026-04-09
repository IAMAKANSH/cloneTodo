import { useUIStore } from '../../stores';
import { taskActions } from '../../stores/taskStore';
import { useSmartSuggestions } from '../../hooks/useSmartSuggestions';
import { Lightbulb, Plus, X, Sparkles, Mail, Calendar, ClipboardList, MessageSquare, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  'outlook-mail': <Mail size={12} />,
  'outlook-calendar': <Calendar size={12} />,
  'planner': <ClipboardList size={12} />,
  'teams-mention': <MessageSquare size={12} />,
};

const SOURCE_COLORS: Record<string, string> = {
  'outlook-mail': '#0078d4',
  'outlook-calendar': '#0078d4',
  'planner': '#6264a7',
  'teams-mention': '#6264a7',
};

export function MyDaySuggestions() {
  const { isMyDaySuggestionsOpen, toggleMyDaySuggestions } = useUIStore();
  const { localSuggestions, integrationSuggestions } = useSmartSuggestions();

  const totalCount = localSuggestions.length + integrationSuggestions.length;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={toggleMyDaySuggestions}
        className="flex items-center gap-2.5 mx-4 mb-1 px-4 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium transition-all duration-200 hover:bg-[var(--color-task-hover)] active:scale-[0.98]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <Sparkles size={16} style={{ color: 'var(--color-warning)' }} />
        <span>Suggestions</span>
        {totalCount > 0 && (
          <span className="count-badge" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-warning)' }}>
            {totalCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isMyDaySuggestionsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden mx-4 mb-2"
          >
            <div className="rounded-[var(--radius-lg)] overflow-hidden glass">
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
              >
                <div className="flex items-center gap-2">
                  <Lightbulb size={16} style={{ color: 'var(--color-warning)' }} />
                  <h3 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>
                    Suggestions
                  </h3>
                </div>
                <button
                  onClick={toggleMyDaySuggestions}
                  className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-task-hover)] transition-all duration-200"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <X size={14} />
                </button>
              </div>

              {totalCount === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                    No suggestions right now. Nice work!
                  </p>
                </div>
              ) : (
                <div className="max-h-[320px] overflow-y-auto">
                  {/* Local task suggestions */}
                  {localSuggestions.map(({ task, reason }, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex items-center gap-3 px-5 py-3 transition-all duration-200 hover:bg-[var(--color-task-hover)]"
                      style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] truncate font-medium" style={{ color: 'var(--color-text)' }}>
                          {task.title}
                        </p>
                        <p className="text-[11px] mt-0.5 font-medium" style={{
                          color: reason === 'Overdue' ? 'var(--color-overdue)' :
                                 reason === 'Due today' ? 'var(--color-warning)' :
                                 'var(--color-text-tertiary)',
                        }}>
                          {reason}
                        </p>
                      </div>
                      <button
                        onClick={() => taskActions.toggleMyDay(task.id)}
                        className="shrink-0 p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-primary-light)] transition-all duration-200 active:scale-90"
                        style={{ color: 'var(--color-primary)' }}
                        title="Add to My Day"
                      >
                        <Plus size={18} />
                      </button>
                    </motion.div>
                  ))}

                  {/* Integration suggestions */}
                  {integrationSuggestions.length > 0 && localSuggestions.length > 0 && (
                    <div className="px-5 py-2" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>
                        From Microsoft 365
                      </span>
                    </div>
                  )}

                  {integrationSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (localSuggestions.length + index) * 0.04 }}
                      className="flex items-center gap-3 px-5 py-3 transition-all duration-200 hover:bg-[var(--color-task-hover)]"
                      style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: `${SOURCE_COLORS[suggestion.source] || 'var(--color-primary)'}15`,
                          color: SOURCE_COLORS[suggestion.source] || 'var(--color-primary)',
                        }}
                      >
                        {SOURCE_ICONS[suggestion.source]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] truncate font-medium" style={{ color: 'var(--color-text)' }}>
                          {suggestion.title}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                          {suggestion.reason}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {suggestion.sourceUrl && (
                          <a
                            href={suggestion.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-task-hover)] transition-all"
                            style={{ color: 'var(--color-text-tertiary)' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          onClick={async () => {
                            await taskActions.createTask(suggestion.title, 'default-tasks', {
                              isMyDay: true,
                              myDayDate: new Date().toISOString().split('T')[0],
                            });
                          }}
                          className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-primary-light)] transition-all duration-200 active:scale-90"
                          style={{ color: 'var(--color-primary)' }}
                          title="Create task & add to My Day"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
