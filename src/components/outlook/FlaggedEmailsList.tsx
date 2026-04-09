import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { Mail, ExternalLink, Plus, Flag } from 'lucide-react';
import { taskActions } from '../../stores/taskStore';
import { motion } from 'framer-motion';

export function FlaggedEmailsList() {
  const emails = useLiveQuery(() =>
    db.outlookEmails.orderBy('receivedDateTime').reverse().toArray()
  );

  if (!emails) return null;

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
        <span className="float-animation" style={{ color: 'var(--color-text-disabled)' }}>
          <Flag size={64} strokeWidth={1} />
        </span>
        <h3 className="text-[18px] font-semibold mt-6 mb-2" style={{ color: 'var(--color-text)' }}>
          No flagged emails
        </h3>
        <p className="text-[13px] max-w-[300px] leading-5" style={{ color: 'var(--color-text-secondary)' }}>
          Flag emails in Outlook to see them here as task suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {emails.map((email, index) => (
        <motion.div
          key={email.id}
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
              style={{ background: 'rgba(0, 120, 212, 0.1)', color: '#0078d4' }}
            >
              <Mail size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {email.subject}
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                From {email.from.name}
              </p>
              {email.bodyPreview && (
                <p className="text-[12px] mt-1.5 line-clamp-2 leading-4" style={{ color: 'var(--color-text-tertiary)' }}>
                  {email.bodyPreview}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 ml-11">
            <button
              onClick={async () => {
                await taskActions.createTask(email.subject, 'default-tasks', {});
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
            {email.webLink && (
              <a
                href={email.webLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-[12px] font-medium transition-all duration-200"
                style={{
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <ExternalLink size={12} />
                Open in Outlook
              </a>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
