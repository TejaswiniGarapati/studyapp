import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_CONFIG } from '../../data/initialData';
import { AIProposal, Activity } from '../../types';
import {
  Sparkles,
  Send,
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
  ShieldCheck,
  Bot,
  User,
  RefreshCw,
  Sliders,
  Check,
  HelpCircle,
} from 'lucide-react';

export const AIPlannerView: React.FC = () => {
  const {
    profile,
    schedule,
    tasks,
    exams,
    pendingProposal,
    setPendingProposal,
    replaceScheduleWithProposed,
    chatMessages,
    addChatMessage,
    clearChat,
    setActiveTab,
  } = useApp();

  const [promptText, setPromptText] = useState(
    'I have a college examination tomorrow. I missed my DSA session today. I need to finish washing clothes and cleaning, and I want enough sleep.'
  );
  const [isPlanningLoading, setIsPlanningLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Chat input state
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Suggested planner prompt presets
  const presets = [
    'I have a college examination tomorrow. I missed my DSA session today. I need to finish washing clothes and cleaning, and I want enough sleep.',
    'I have an exam in 3 days. Prepare an intensive revision schedule while keeping lunch at 1:30 PM and dinner at 5:30 PM.',
    'Balance GATE 2027 Discrete Mathematics and First Labs placement coding prep today.',
    'I feel exhausted after college lectures. Reorganize today for low-friction study, chore completion, and full 8 hours sleep.',
  ];

  // Suggested chat prompt presets
  const chatPresets = [
    'Plan my day with balanced GATE and placement focus',
    'How should I balance GATE 2027 and campus placements?',
    'I missed three tasks today. Help me rearrange without guilt',
    'I have an exam in 5 days. Prepare a high-yield revision plan',
    'How much time should I realistically allocate to DSA daily?',
    'Help me balance college hours with household chores and sleep',
  ];

  // Call `/api/gemini/plan`
  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptText.trim()) return;

    setIsPlanningLoading(true);
    setPlanError(null);

    try {
      const res = await fetch('/api/gemini/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          schedule: schedule.filter((a) => a.dayOfWeek === 'Today' || a.recurring === 'daily'),
          profile,
          tasks,
          exams,
        }),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setPendingProposal(data.plan);
      } else {
        setPlanError(data.error || 'Failed to generate plan. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setPlanError('Network error connecting to Gemini assistant.');
    } finally {
      setIsPlanningLoading(false);
    }
  };

  // Call `/api/gemini/chat`
  const handleSendChat = async (msgText?: string) => {
    const textToSend = msgText || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    addChatMessage({
      role: 'user',
      text: textToSend.trim(),
    });

    if (!msgText) setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
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
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFA06A] to-[#FF8A58] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 font-heading">
                Gemini AI Study Planner & Assistant
              </h1>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Intelligent schedule balancing preserving meals, chores, and healthy sleep.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 dark:bg-stone-900/60 px-3 py-2 rounded-full border border-stone-200/60 dark:border-stone-800">
            <ShieldCheck className="w-4 h-4 text-[#55B88A]" />
            <span>Never overwrites schedule without your confirmation</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Plan Generator (Left) & Chat Companion (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Schedule Generator & Proposal Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Natural Language Prompt Card */}
          <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-[26px] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FF986B]" />
                <span>Describe your current situation</span>
              </h2>
              <span className="text-[11px] text-stone-500">Natural language balancing</span>
            </div>

            <form onSubmit={handleGeneratePlan} className="space-y-3">
              <textarea
                rows={3}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="e.g. I have a college examination tomorrow. I missed my DSA session today. I need to finish washing clothes and cleaning, and I want enough sleep."
                className="w-full p-3.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#FF986B] leading-relaxed"
              />

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-stone-500">
                  Or pick a scenario preset:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPromptText(preset)}
                      className="text-left text-[11px] px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-[#FFE7CE] hover:text-[#FF986B] rounded-full transition-colors"
                    >
                      {preset.slice(0, 55)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Protection Guarantees */}
              <div className="p-3 bg-stone-50/70 dark:bg-stone-900/40 rounded-2xl border border-stone-200/60 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 flex flex-wrap gap-y-1 gap-x-4">
                <span>🛡️ Lunch: {profile.lunchTime} (Locked)</span>
                <span>🛡️ Dinner: {profile.dinnerTime} (Locked)</span>
                <span>🛡️ Sleep: {profile.sleepTime} - {profile.wakeTime} (7.5h Guaranteed)</span>
              </div>

              {planError && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{planError}</p>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-stone-500">
                  Powered by Gemini 3.8 Flash
                </span>
                <button
                  type="submit"
                  disabled={isPlanningLoading || !promptText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#FF9466] hover:bg-[#FF8550] disabled:opacity-50 text-white text-xs font-bold rounded-full shadow-xs transition-colors"
                >
                  {isPlanningLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Balancing Day...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>Generate Balanced Plan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Structured Proposal Preview Card */}
          {pendingProposal ? (
            <div className="bg-white dark:bg-[#161a1c] border-2 border-[#5b8266]/70 dark:border-[#5b8266]/50 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-stone-200/80 dark:border-stone-800">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5b8266] dark:text-[#88b695]">
                    AI Revised Schedule Proposal (Pending Confirmation)
                  </span>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {pendingProposal.summary}
                  </h3>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded font-mono shrink-0">
                  Awaiting Approval
                </span>
              </div>

              {/* What was moved / adjusted */}
              <div className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-lg text-xs space-y-1.5 border border-stone-200/60 dark:border-stone-800">
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  Key Adjustments & Preservations:
                </span>
                <ul className="space-y-1 text-stone-600 dark:text-stone-400">
                  {pendingProposal.movedActivities.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#5b8266] shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Proposed Schedule Timeline */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Proposed Daily Timeline:
                </span>
                {pendingProposal.proposedSchedule.map((act, i) => {
                  const cat = CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.Personal;
                  return (
                    <div
                      key={act.id || i}
                      className="p-2.5 rounded-lg border border-stone-200/70 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/20 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-stone-700 dark:text-stone-300 w-24 shrink-0">
                          {act.startTime} - {act.endTime}
                        </span>
                        <div>
                          <p className="font-medium text-stone-900 dark:text-stone-100">{act.title}</p>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${cat.bgLight} ${cat.textLight} ${cat.bgDark} ${cat.textDark}`}
                          >
                            {cat.label}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">{act.priority}</span>
                    </div>
                  );
                })}
              </div>

              {/* Advice */}
              {pendingProposal.advice && (
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-lg text-xs text-emerald-900 dark:text-emerald-300">
                  <strong>Advice:</strong> {pendingProposal.advice}
                </div>
              )}

              {/* Explicit User Confirmation Actions */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-200/80 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setPendingProposal(null)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4 text-stone-400" />
                  <span>Decline / Discard</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    replaceScheduleWithProposed(pendingProposal.proposedSchedule);
                    setActiveTab('timetable');
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#55B88A] hover:bg-[#439c73] text-white text-xs font-bold rounded-full shadow-xs transition-colors"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-100" />
                  <span>Accept & Apply to Timetable</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 dark:bg-stone-900/30 border border-dashed border-stone-300 dark:border-stone-800 rounded-xl p-8 text-center text-xs text-stone-500 space-y-2">
              <Clock className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="font-medium text-stone-700 dark:text-stone-300">
                No active schedule proposal yet
              </p>
              <p className="max-w-md mx-auto text-stone-500">
                Type your scheduling needs above or click "Generate Balanced Plan" to preview an AI-optimized day without losing your sleep or meals.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: FocusMate AI Chat Assistant (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs flex flex-col h-[650px]">
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#5b8266] text-white flex items-center justify-center font-bold text-xs">
                AI
              </div>
              <div>
                <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  FocusMate AI Assistant
                </h2>
                <p className="text-[11px] text-stone-500">Student Strategy & Balance</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="text-[11px] text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
            >
              Clear
            </button>
          </div>

          {/* Quick Chat Presets */}
          <div className="py-2.5 border-b border-stone-200/60 dark:border-stone-800 overflow-x-auto flex gap-1.5 pb-2">
            {chatPresets.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendChat(prompt)}
                className="text-[10px] px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-[#eef5f0] hover:text-[#2e4735] dark:hover:bg-[#1f2d24] dark:hover:text-[#a8d5b5] rounded-md whitespace-nowrap shrink-0 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Scrollable */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
            {chatMessages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                      isAssistant
                        ? 'bg-[#5b8266] text-white'
                        : 'bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                      isAssistant
                        ? 'bg-stone-50 dark:bg-stone-900/70 border border-stone-200/60 dark:border-stone-800 text-stone-800 dark:text-stone-200'
                        : 'bg-[#5b8266] text-white'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <span
                      className={`block text-[9px] mt-1 text-right font-mono ${
                        isAssistant ? 'text-stone-400' : 'text-emerald-100'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex items-center gap-2 text-stone-500 text-xs py-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#5b8266]" />
                <span>FocusMate AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask FocusMate AI (e.g. Plan my day, Balance GATE)..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatLoading}
                className="flex-1 px-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#5b8266]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="p-2 bg-[#5b8266] text-white rounded-lg hover:bg-[#4a6b53] disabled:opacity-40 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
