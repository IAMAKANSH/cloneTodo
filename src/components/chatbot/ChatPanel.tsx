import { useRef, useEffect, useState } from 'react';
import {
  X, Trash2, Star, Sun, CheckCircle2,
  Mail, Calendar, Clock, Settings, Sparkles, Send, Bot, Key,
} from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import {
  getApiKey, setApiKey, clearApiKey,
  getProvider, setProvider, type AIProvider,
} from '../../lib/chatbot/aiService';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage, ChatResponseData } from '../../types/chat';

const SUGGESTIONS = [
  "What's on my day?",
  "Add task: Review PRs",
  "Show important tasks",
  "Any meetings today?",
  "Show my emails",
];

export function ChatPanel() {
  const { isOpen, messages, isProcessing, showSettings, toggleChat, closeChat, sendMessage, clearHistory, toggleSettings } = useChatStore();
  const [input, setInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(!!getApiKey());
  const [provider, setProviderState] = useState<AIProvider>(getProvider());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      setHasKey(true);
      setApiKeyInput('');
      useChatStore.setState({ showSettings: false });
    }
  };

  const handleClearKey = () => {
    clearApiKey();
    setHasKey(false);
    setApiKeyInput('');
  };

  const handleProviderSwitch = (p: AIProvider) => {
    setProvider(p);
    setProviderState(p);
    setHasKey(!!getApiKey());
    setApiKeyInput('');
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-40 no-print group"
          >
            <div
              className="w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
                boxShadow: '0 4px 24px rgba(99, 102, 241, 0.4), 0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Sparkles size={26} color="white" />
            </div>
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="fixed bottom-6 right-6 z-40 flex flex-col no-print overflow-hidden"
            style={{
              width: '420px',
              height: '600px',
              borderRadius: '24px',
              background: 'var(--color-surface-solid)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.15), 0 8px 32px rgba(99, 102, 241, 0.08)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                  <Bot size={20} color="white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white leading-tight">AI Assistant</h3>
                  <p className="text-[11px] text-white/70 font-medium">
                    {hasKey ? 'Powered by Claude' : 'Basic mode'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={toggleSettings}
                  className="p-2 rounded-xl hover:bg-white/15 transition-colors"
                  title="Settings"
                >
                  <Settings size={16} color="white" />
                </button>
                <button
                  onClick={clearHistory}
                  className="p-2 rounded-xl hover:bg-white/15 transition-colors"
                  title="Clear chat"
                >
                  <Trash2 size={16} color="white" />
                </button>
                <button
                  onClick={closeChat}
                  className="p-2 rounded-xl hover:bg-white/15 transition-colors"
                  title="Close"
                >
                  <X size={16} color="white" />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden shrink-0"
                  style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}
                >
                  <div className="p-4 flex flex-col gap-3">
                    {/* Provider toggle */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                        AI Provider
                      </span>
                      <div className="flex gap-2 mt-2">
                        {([
                          { id: 'nvidia' as AIProvider, label: 'NVIDIA NIM', sub: 'Free', color: '#76b900' },
                          { id: 'anthropic' as AIProvider, label: 'Claude', sub: 'Paid', color: '#6366f1' },
                        ]).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleProviderSwitch(p.id)}
                            className="flex-1 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all active:scale-95"
                            style={{
                              background: provider === p.id ? `${p.color}15` : 'var(--color-bg-secondary)',
                              border: `1.5px solid ${provider === p.id ? p.color : 'var(--color-border)'}`,
                              color: provider === p.id ? p.color : 'var(--color-text-secondary)',
                            }}
                          >
                            {p.label}
                            <span className="block text-[10px] font-normal opacity-70 mt-0.5">{p.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* API Key */}
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Key size={13} style={{ color: provider === 'nvidia' ? '#76b900' : '#6366f1' }} />
                        <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text)' }}>
                          {provider === 'nvidia' ? 'NVIDIA API Key' : 'Anthropic API Key'}
                        </span>
                      </div>
                      <p className="text-[11px] mb-2 leading-4" style={{ color: 'var(--color-text-tertiary)' }}>
                        {provider === 'nvidia'
                          ? 'Get a free key at build.nvidia.com'
                          : 'Get a key at console.anthropic.com'}
                      </p>
                      {hasKey ? (
                        <div className="flex items-center gap-2">
                          <span className="flex-1 text-[12px] font-medium" style={{ color: 'var(--color-success)' }}>
                            Key configured
                          </span>
                          <button
                            onClick={handleClearKey}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all active:scale-95"
                            style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveKey(); }}
                            placeholder={provider === 'nvidia' ? 'nvapi-...' : 'sk-ant-...'}
                            className="flex-1 px-3 py-2 rounded-lg text-[12px] outline-none"
                            style={{
                              background: 'var(--color-input-bg)',
                              border: '1px solid var(--color-input-border)',
                              color: 'var(--color-text)',
                            }}
                          />
                          <button
                            onClick={handleSaveKey}
                            disabled={!apiKeyInput.trim()}
                            className="px-4 py-2 rounded-lg text-[12px] font-bold transition-all active:scale-95 disabled:opacity-40"
                            style={{ background: provider === 'nvidia' ? '#76b900' : '#6366f1', color: 'white' }}
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
              {messages.map((message, i) => (
                <MessageBubble key={message.id || i} message={message} />
              ))}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                    <Sparkles size={14} color="white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
                    style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)' }}>
                    <div className="flex gap-1.5 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ background: '#8b5cf6' }}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap shrink-0">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    disabled={isProcessing}
                    className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))',
                      color: '#7c3aed',
                      border: '1px solid rgba(139,92,246,0.15)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-200"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1.5px solid var(--color-border)',
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                  placeholder={hasKey ? "Ask me anything..." : "Type a command..."}
                  disabled={isProcessing}
                  className="flex-1 bg-transparent outline-none text-[14px]"
                  style={{ color: 'var(--color-text)' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isProcessing}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 disabled:opacity-30"
                  style={{
                    background: input.trim() ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent',
                    color: input.trim() ? 'white' : 'var(--color-text-disabled)',
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
          <Sparkles size={14} color="white" />
        </div>
      )}

      {/* Bubble */}
      <div
        className="max-w-[80%] text-[13px] leading-[1.6]"
        style={{
          padding: '10px 16px',
          background: isUser
            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
            : 'var(--color-bg-secondary)',
          color: isUser ? 'white' : 'var(--color-text)',
          borderRadius: isUser ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
          border: isUser ? 'none' : '1px solid var(--color-border-subtle)',
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }} />
        {message.data && <RichData data={message.data} />}
      </div>
    </motion.div>
  );
}

function RichData({ data }: { data: ChatResponseData }) {
  if (data.type === 'task_list' && data.tasks) {
    return (
      <div className="mt-3 flex flex-col gap-1.5">
        {data.tasks.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px]"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}
          >
            <CheckCircle2
              size={14}
              className="shrink-0"
              style={{ color: t.isCompleted ? 'var(--color-success)' : 'var(--color-text-disabled)' }}
            />
            <span className={`flex-1 truncate ${t.isCompleted ? 'line-through opacity-50' : 'font-medium'}`}
              style={{ color: 'var(--color-text)' }}>
              {t.title}
            </span>
            {t.isImportant && <Star size={12} className="shrink-0" style={{ color: 'var(--color-important)' }} fill="var(--color-important)" />}
            {t.isMyDay && <Sun size={12} className="shrink-0" style={{ color: 'var(--color-warning)' }} />}
          </div>
        ))}
      </div>
    );
  }

  if (data.type === 'calendar_list' && data.events) {
    return (
      <div className="mt-3 flex flex-col gap-1.5">
        {data.events.map((e, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px]"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}
          >
            <Calendar size={13} className="shrink-0" style={{ color: '#6366f1' }} />
            <span className="flex-1 truncate font-medium" style={{ color: 'var(--color-text)' }}>{e.subject}</span>
            <span className="shrink-0 flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
              <Clock size={10} />
              {e.isAllDay ? 'All day' : formatTime(e.start)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (data.type === 'email_list' && data.emails) {
    return (
      <div className="mt-3 flex flex-col gap-1.5">
        {data.emails.map((e, i) => (
          <div
            key={i}
            className="flex flex-col px-3 py-2 rounded-xl text-[12px]"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <Mail size={13} className="shrink-0" style={{ color: '#6366f1' }} />
              <span className="flex-1 truncate font-medium" style={{ color: 'var(--color-text)' }}>{e.subject}</span>
            </div>
            <span className="ml-[21px] text-[11px] truncate mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
              {e.from}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(99,102,241,0.08);padding:1px 5px;border-radius:4px;font-size:12px;color:#6366f1">$1</code>')
    .replace(/\n/g, '<br/>');
}

function formatTime(dateTime: string): string {
  try {
    return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}
