import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { Calendar, Clock, MapPin, ExternalLink, Plus } from 'lucide-react';
import { taskActions } from '../../stores/taskStore';
import { motion } from 'framer-motion';

export function CalendarEventsSection() {
  const events = useLiveQuery(() =>
    db.calendarEvents.toArray()
  );

  if (!events) return null;

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
        <span className="float-animation" style={{ color: 'var(--color-text-disabled)' }}>
          <Calendar size={64} strokeWidth={1} />
        </span>
        <h3 className="text-[18px] font-semibold mt-6 mb-2" style={{ color: 'var(--color-text)' }}>
          No upcoming events
        </h3>
        <p className="text-[13px] max-w-[300px] leading-5" style={{ color: 'var(--color-text-secondary)' }}>
          Your Outlook calendar events for the next 7 days will appear here.
        </p>
      </div>
    );
  }

  // Group events by date
  const grouped: Record<string, typeof events> = {};
  for (const event of events) {
    const dateKey = event.start.dateTime.split('T')[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(event);
  }

  return (
    <div className="pb-4">
      {Object.entries(grouped).map(([date, dateEvents]) => (
        <div key={date}>
          <div className="px-5 py-2 mt-2">
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>
              {formatDate(date)}
            </span>
          </div>
          {dateEvents.map((event, index) => (
            <motion.div
              key={event.id}
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
                  <Calendar size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                    {event.subject}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                      <Clock size={11} />
                      {event.isAllDay ? 'All day' : `${formatTime(event.start.dateTime)} - ${formatTime(event.end.dateTime)}`}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1 text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
                        <MapPin size={11} />
                        {event.location}
                      </span>
                    )}
                  </div>
                  {event.organizer && (
                    <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      Organized by {event.organizer}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 ml-11">
                <button
                  onClick={async () => {
                    await taskActions.createTask(`Prepare for: ${event.subject}`, 'default-tasks', {
                      dueDate: event.start.dateTime.split('T')[0],
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
                  Create task
                </button>
                {event.webLink && (
                  <a
                    href={event.webLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-[12px] font-medium transition-all duration-200"
                    style={{
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <ExternalLink size={12} />
                    Open
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatTime(dateTime: string): string {
  try {
    return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}
