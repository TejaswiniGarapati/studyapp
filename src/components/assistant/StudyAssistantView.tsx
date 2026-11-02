import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  BookOpen,
  Calendar,
  Clock,
  Heart,
  ChevronRight,
} from 'lucide-react';

export const StudyAssistantView: React.FC = () => {
  const {
    profile,
    schedule,
    tasks,
    exams,
    chatMessages,
    addChatMessage,
    clearChat,
    setActiveTab,
  } = useApp();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const presets = [
    'Plan my day with balanced GATE and placement focus',
    'How should I balance GATE 2027 and campus placements?',
    'I missed three tasks today. Help me rearrange without guilt',
    'I have an exam in 5 days. Prepare a high-yield revision plan',
    'How much time should I realistically allocate to DSA daily?',
    'Help me balance college hours with household chores and sleep',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    addChatMessage({
      role: 'user',
      text: text.trim(),
    });

    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: chatMessages.slice(-8),
          context: {
            profile,
            tasks,
            exams,
            scheduleCount: schedule.length,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        addChatMessage({
          role: 'assistant',
          text: data.reply,
        });
      } else {
        addChatMessage({
          role: 'assistant',
          text: 'I could not process that request right now. Please check your network or try again.',
        });
      }
    } catch (err) {
      console.error(err);
      addChatMessage({
        role: 'assistant',
        text: 'Sorry, there was an issue reaching FocusMate AI server.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1a1f22] rounded-[26px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFA06A] to-[#FF8A58] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#303030] dark:text-stone-100 font-heading">
              Study Assistant
            </h2>
            <p className="text-xs text-stone-500">
              Your personalized academic strategist for exam prep, time management, and balanced wellbeing.
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="text-xs font-semibold text-[#FF986B] hover:underline self-start sm:self-auto"
        >
          Clear Chat
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1a1f22] hover:bg-[#FFE7CE] text-stone-700 dark:text-stone-300 hover:text-[#FF986B] border border-stone-200/70 dark:border-stone-800 whitespace-nowrap shadow-xs transition-colors shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Card */}
      <div className="bg-white dark:bg-[#1a1f22] rounded-[28px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-stone-100 dark:border-stone-800 flex flex-col h-[520px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {chatMessages.map((msg) => {
            const isBot = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                    isBot
                      ? 'bg-gradient-to-br from-[#FFA06A] to-[#FF8A58] text-white shadow-xs'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  {isBot ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] p-4 rounded-[20px] leading-relaxed shadow-xs ${
                    isBot
                      ? 'bg-[#F9F7F4] dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 border border-stone-200/50 dark:border-stone-700/60'
                      : 'bg-[#FF9466] text-white'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <span
                    className={`block text-[10px] mt-1.5 text-right font-mono ${
                      isBot ? 'text-stone-400' : 'text-white/80'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-stone-500 text-xs py-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF986B]" />
              <span>FocusMate Assistant is thinking...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything (e.g. How to balance GATE and placements, organize my day)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs bg-[#F9F7F4] dark:bg-stone-850 border border-stone-200/80 dark:border-stone-700 rounded-full text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#FF986B]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-full bg-[#FF9466] hover:bg-[#FF8550] text-white flex items-center justify-center transition-colors shrink-0 disabled:opacity-40 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
