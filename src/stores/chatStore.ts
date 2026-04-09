import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendAIMessage, getApiKey } from '../lib/chatbot/aiService';
import { parseCommand } from '../lib/chatbot/commandParser';
import { executeCommand } from '../lib/chatbot/commandExecutor';
import type { ChatMessage } from '../types/chat';

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isProcessing: boolean;
  showSettings: boolean;
}

interface ChatActions {
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  toggleSettings: () => void;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  content: "Hey! I'm your AI task assistant. Just tell me what you need in plain English — I'll handle the rest. Try saying *\"what's on my plate today?\"* or *\"remind me to buy groceries\"*",
  timestamp: new Date().toISOString(),
};

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      isOpen: false,
      messages: [WELCOME_MESSAGE],
      isProcessing: false,
      showSettings: false,

      toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),

      async sendMessage(text: string) {
        const trimmed = text.trim();
        if (!trimmed) return;

        const userMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content: trimmed,
          timestamp: new Date().toISOString(),
        };

        set((s) => ({
          messages: [...s.messages, userMsg],
          isProcessing: true,
        }));

        try {
          let response: Omit<ChatMessage, 'id' | 'timestamp'>;

          if (getApiKey()) {
            // AI-powered mode
            const history = get().messages.filter((m) => m.id !== 'welcome').map((m) => ({
              role: m.role,
              content: m.content,
            }));
            response = await sendAIMessage(trimmed, history);
          } else {
            // Fallback: regex command parser
            const command = parseCommand(trimmed);
            response = await executeCommand(command);
          }

          const botMsg: ChatMessage = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            role: response.role,
            content: response.content,
            data: response.data,
          };

          set((s) => ({
            messages: [...s.messages, botMsg].slice(-100),
            isProcessing: false,
          }));
        } catch (err: any) {
          const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'bot',
            content: `Oops, something went wrong: ${err.message || 'Unknown error'}`,
            timestamp: new Date().toISOString(),
          };

          set((s) => ({
            messages: [...s.messages, errorMsg],
            isProcessing: false,
          }));
        }
      },

      clearHistory: () => set({ messages: [WELCOME_MESSAGE] }),
    }),
    {
      name: 'todo-chat-history',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);
