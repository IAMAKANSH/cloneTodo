import { X, Sun, Moon, Monitor } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import type { ThemeMode, BackgroundTheme } from '../../types';
import { motion } from 'framer-motion';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun size={16} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
  { value: 'system', label: 'Use system setting', icon: <Monitor size={16} /> },
];

const BG_OPTIONS: { value: BackgroundTheme; label: string; gradient: string }[] = [
  { value: 'default', label: 'Default', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { value: 'gradient-blue', label: 'Blue', gradient: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 50%, #38bdf8 100%)' },
  { value: 'gradient-purple', label: 'Purple', gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' },
  { value: 'gradient-pink', label: 'Pink', gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' },
  { value: 'gradient-green', label: 'Green', gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' },
  { value: 'gradient-orange', label: 'Orange', gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' },
];

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const settings = useSettingsStore();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="dialog-overlay flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="dialog-content w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h2 className="text-[18px] font-bold" style={{ color: 'var(--color-text)' }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-task-hover)] transition-all duration-200 active:scale-95"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-7 max-h-[70vh] overflow-y-auto">
          {/* Theme Mode */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
              Theme
            </h3>
            <div className="flex flex-col gap-1.5">
              {THEME_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] cursor-pointer transition-all duration-200 hover:bg-[var(--color-task-hover)] active:scale-[0.99]"
                  style={{
                    backgroundColor: settings.themeMode === opt.value ? 'var(--color-primary-light)' : 'transparent',
                    border: settings.themeMode === opt.value ? '1px solid var(--color-primary-light-hover)' : '1px solid transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="theme"
                    checked={settings.themeMode === opt.value}
                    onChange={() => settings.setThemeMode(opt.value)}
                    className="sr-only"
                  />
                  <div
                    className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                    style={{
                      borderColor: settings.themeMode === opt.value ? 'var(--color-primary)' : 'var(--color-text-disabled)',
                      boxShadow: settings.themeMode === opt.value ? '0 0 8px var(--color-primary-glow)' : 'none',
                    }}
                  >
                    {settings.themeMode === opt.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                    )}
                  </div>
                  <span className="flex items-center gap-2.5 text-[14px] font-medium" style={{ color: 'var(--color-text)' }}>
                    {opt.icon}
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Background Theme */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
              My Day Background
            </h3>
            <div className="grid grid-cols-6 gap-2.5">
              {BG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => settings.setBackgroundTheme(opt.value)}
                  className="w-full aspect-square rounded-[var(--radius-md)] transition-all duration-300 hover:scale-110 active:scale-95"
                  style={{
                    background: opt.gradient,
                    outline: settings.backgroundTheme === opt.value
                      ? '2.5px solid var(--color-primary)'
                      : '2px solid transparent',
                    outlineOffset: '3px',
                    boxShadow: settings.backgroundTheme === opt.value
                      ? '0 4px 12px var(--color-primary-glow)'
                      : '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  title={opt.label}
                />
              ))}
            </div>
          </section>

          {/* Toggles */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
              General
            </h3>
            <div className="flex flex-col gap-1">
              <SettingToggle
                label="Play completion sound"
                checked={settings.playCompletionSound}
                onChange={settings.toggleCompletionSound}
              />
              <SettingToggle
                label="Confirm before deleting"
                checked={settings.confirmBeforeDelete}
                onChange={settings.toggleConfirmBeforeDelete}
              />
              <SettingToggle
                label="Move completed tasks to bottom"
                checked={settings.moveCompletedToBottom}
                onChange={settings.toggleMoveCompletedToBottom}
              />
            </div>
          </section>

          {/* New task position */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
              New tasks
            </h3>
            <div className="flex gap-2.5">
              {(['top', 'bottom'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => settings.setNewTaskPosition(pos)}
                  className="px-5 py-2.5 rounded-[var(--radius-md)] text-[14px] capitalize font-medium transition-all duration-200 active:scale-95"
                  style={{
                    backgroundColor: settings.newTaskPosition === pos ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                    color: settings.newTaskPosition === pos ? 'var(--color-text-on-primary)' : 'var(--color-text)',
                    boxShadow: settings.newTaskPosition === pos ? '0 4px 12px var(--color-primary-glow)' : 'var(--shadow-2)',
                  }}
                >
                  Add to {pos}
                </button>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SettingToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] transition-all duration-200 hover:bg-[var(--color-task-hover)] active:scale-[0.99] w-full text-left"
    >
      <span className="text-[14px] font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
      <div
        className="relative w-11 h-6 rounded-full transition-all duration-300 shrink-0"
        style={{
          backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-text-disabled)',
          boxShadow: checked ? '0 0 10px var(--color-primary-glow)' : 'inset 0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <motion.span
          className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-md"
          animate={{
            left: checked ? '22px' : '3px',
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}
        />
      </div>
    </button>
  );
}
