import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_CONFIG } from '../../data/initialData';
import { Activity, ActivityCategory, Priority } from '../../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Printer,
  Trash2,
  Edit2,
  AlertTriangle,
  Filter,
  X,
  Repeat,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';

export const ScheduleView: React.FC = () => {
  const {
    schedule,
    addActivity,
    updateActivity,
    deleteActivity,
    conflicts,
    setActiveTab,
    selectedDate,
    todayDate,
    setSelectedDate,
    goToToday,
    goToPrevDay,
    goToNextDay,
    isDateToday,
    formatDateHeading,
  } = useApp();

  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Month navigation state for Monthly view
  const [monthDate, setMonthDate] = useState<Date>(() => new Date(selectedDate + 'T00:00:00'));

  // Modal Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ActivityCategory>('College');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formDate, setFormDate] = useState(selectedDate);
  const [formPriority, setFormPriority] = useState<Priority>('High');
  const [formNotes, setFormNotes] = useState('');
  const [formRecurring, setFormRecurring] = useState<'once' | 'daily' | 'weekdays' | 'weekends'>('daily');
  const [formIsFixed, setFormIsFixed] = useState(false);

  const parseMin = (t: string) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Helper to get day-of-week string from YYYY-MM-DD
  const getDayOfWeekName = (dateStr: string): string => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'long' });
    } catch {
      return 'Monday';
    }
  };

  const currentDayName = getDayOfWeekName(selectedDate);

  // Open add modal
  const handleOpenAdd = () => {
    setEditingActivity(null);
    setFormTitle('');
    setFormCategory('DSA');
    setFormStartTime('14:30');
    setFormEndTime('16:00');
    setFormDate(selectedDate);
    setFormPriority('High');
    setFormNotes('');
    setFormRecurring('weekdays');
    setFormIsFixed(false);
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (act: Activity) => {
    setEditingActivity(act);
    setFormTitle(act.title);
    setFormCategory(act.category);
    setFormStartTime(act.startTime);
    setFormEndTime(act.endTime);
    setFormDate(act.date || selectedDate);
    setFormPriority(act.priority);
    setFormNotes(act.notes || '');
    setFormRecurring(act.recurring || 'once');
    setFormIsFixed(!!act.isFixed);
    setIsModalOpen(true);
  };

  // Submit modal form
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingActivity) {
      updateActivity(editingActivity.id, {
        title: formTitle.trim(),
        category: formCategory,
        startTime: formStartTime,
        endTime: formEndTime,
        date: formDate,
        dayOfWeek: getDayOfWeekName(formDate) as any,
        priority: formPriority,
        notes: formNotes.trim(),
        recurring: formRecurring,
        isFixed: formIsFixed,
      });
    } else {
      addActivity({
        title: formTitle.trim(),
        category: formCategory,
        startTime: formStartTime,
        endTime: formEndTime,
        date: formDate,
        dayOfWeek: getDayOfWeekName(formDate) as any,
        priority: formPriority,
        notes: formNotes.trim(),
        recurring: formRecurring,
        isFixed: formIsFixed,
      });
    }

    setIsModalOpen(false);
  };

  // Check if an activity matches a given date
  const isActivityOnDate = (act: Activity, dateStr: string) => {
    if (act.date && act.date === dateStr) return true;
    if (act.recurring === 'daily') return true;

    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDay(); // 0 is Sunday, 6 is Saturday
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });

    if (act.recurring === 'weekdays' && day >= 1 && day <= 5) return true;
    if (act.recurring === 'weekends' && (day === 0 || day === 6)) return true;
    if (act.dayOfWeek === dayName) return true;
    if (act.dayOfWeek === 'Today' && isDateToday(dateStr)) return true;

    return false;
  };

  // Filter activities for the currently selected date
  const dailyActivities = useMemo(() => {
    return schedule.filter((act) => {
      if (selectedCategory !== 'all' && act.category !== selectedCategory) return false;
      return isActivityOnDate(act, selectedDate);
    }).sort((a, b) => parseMin(a.startTime) - parseMin(b.startTime));
  }, [schedule, selectedDate, selectedCategory]);

  // Compute 7 days for the weekly view around selectedDate (Monday to Sunday)
  const weekDays = useMemo(() => {
    const curr = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = curr.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - distanceToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const name = d.toLocaleDateString('en-US', { weekday: 'short' });
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({ dateStr: iso, name, label, isCurrent: iso === selectedDate, isToday: iso === todayDate });
    }
    return days;
  }, [selectedDate, todayDate]);

  // Dynamic monthly grid computation
  const monthData = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastDayOfMonth.getDate();
    // 0 is Sun, 1 is Mon ... we want Mon as index 0
    let startDayIndex = firstDayOfMonth.getDay() - 1;
    if (startDayIndex < 0) startDayIndex = 6;

    const monthName = firstDayOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const cells: { dayNum: number; dateStr: string; inMonth: boolean }[] = [];
    // Padding before start of month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      cells.push({
        dayNum: d,
        dateStr: prevDate.toISOString().split('T')[0],
        inMonth: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDays; d++) {
      const curDate = new Date(year, month, d);
      cells.push({
        dayNum: d,
        dateStr: curDate.toISOString().split('T')[0],
        inMonth: true,
      });
    }

    // Padding after end of month
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      cells.push({
        dayNum: i,
        dateStr: nextDate.toISOString().split('T')[0],
        inMonth: false,
      });
    }

    return { monthName, cells };
  }, [monthDate]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 font-heading">
            Smart Timetable Maker
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Organize lectures, GATE prep, DSA coding, chores, meals, and sleep.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented View Switch */}
          <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-full">
            {(['daily', 'weekly', 'monthly'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition-colors ${
                  viewMode === m
                    ? 'bg-white dark:bg-[#1f2528] text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Print Timetable */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* AI Rebalance shortcut */}
          <button
            onClick={() => setActiveTab('ai-planner')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#FF986B] bg-[#FFF2DE] hover:bg-[#FFE7CE] border border-[#FFD2B5] rounded-full transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF986B]" />
            <span>AI Rebalance</span>
          </button>

          {/* Add Activity Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#FF9466] hover:bg-[#FF8550] rounded-full shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Block</span>
          </button>
        </div>
      </div>

      {/* Dynamic Date Navigation Bar */}
      <div className="bg-gradient-to-r from-[#FFF5ED] via-[#FFF9F0] to-[#FFF5ED] dark:from-[#211b19] dark:to-[#1a1c1d] border border-[#FFD6C2]/70 dark:border-stone-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevDay}
            className="p-1.5 rounded-full hover:bg-white dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
              {formatDateHeading(selectedDate)}
            </span>
            {isDateToday(selectedDate) ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#58B98A] text-white">
                Today
              </span>
            ) : (
              <button
                onClick={goToToday}
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FF936B] hover:bg-[#ff8454] text-white transition-colors"
              >
                Go to Today
              </button>
            )}
          </div>

          <button
            onClick={goToNextDay}
            className="p-1.5 rounded-full hover:bg-white dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Date input picker for jumping directly to any date */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-stone-500 font-medium hidden sm:inline">Jump to Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(e.target.value);
                setMonthDate(new Date(e.target.value + 'T00:00:00'));
              }
            }}
            className="text-xs bg-white dark:bg-stone-900 border border-[#FFD6C2] dark:border-stone-700 rounded-full px-3 py-1 font-mono text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#FF936B]"
          />

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3 h-3 text-stone-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full px-2.5 py-1 text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {Object.keys(CATEGORY_CONFIG).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conflicts Banner */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">
              Time Conflict Warning: {conflicts.length} overlapping block(s) detected!
            </p>
            <div className="mt-1 space-y-1 text-amber-800 dark:text-amber-300">
              {conflicts.map((c, i) => (
                <p key={i}>
                  • <strong>{c.title1}</strong> ({c.time1}) overlaps with{' '}
                  <strong>{c.title2}</strong> ({c.time2})
                </p>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-400">
              Tip: Click Edit on either activity to adjust the time, or ask the <strong>AI Planner</strong> to automatically resolve overlaps without touching sleep.
            </p>
          </div>
        </div>
      )}

      {/* DAILY VIEW */}
      {viewMode === 'daily' && (
        <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-[#FFFBF7] dark:bg-stone-900/30">
            <span className="font-semibold text-xs text-stone-700 dark:text-stone-300">
              Showing schedule for: <strong>{currentDayName}, {selectedDate}</strong> ({dailyActivities.length} blocks)
            </span>
            <span className="text-[11px] text-stone-500 font-mono">Asia/Kolkata IST</span>
          </div>

          <div className="divide-y divide-stone-200/70 dark:divide-stone-800">
            {dailyActivities.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarIcon className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                <p className="text-xs text-stone-500">No scheduled activities for this date.</p>
                <button
                  onClick={handleOpenAdd}
                  className="mt-3 text-xs font-semibold text-[#FF936B] hover:underline"
                >
                  + Add Time Block for {selectedDate}
                </button>
              </div>
            ) : (
              dailyActivities.map((act) => {
                const cat = CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.Personal;
                const isConflict = conflicts.some((c) => c.id1 === act.id || c.id2 === act.id);

                return (
                  <div
                    key={act.id}
                    className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isConflict
                        ? 'bg-amber-50/40 dark:bg-amber-950/20'
                        : 'hover:bg-stone-50/80 dark:hover:bg-stone-850/40'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Time display */}
                      <div className="w-24 shrink-0 font-mono text-xs font-semibold text-stone-800 dark:text-stone-200">
                        <span>{act.startTime}</span>
                        <span className="text-stone-400 mx-1">→</span>
                        <span>{act.endTime}</span>
                        {isConflict && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-sans font-medium flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Overlap</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                            {act.title}
                          </h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cat.bgLight} ${cat.textLight} ${cat.bgDark} ${cat.textDark}`}
                          >
                            {cat.label}
                          </span>
                          {act.isFixed && (
                            <span className="text-[10px] px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-full font-mono">
                              Fixed
                            </span>
                          )}
                          {act.recurring && act.recurring !== 'once' && (
                            <span className="text-[10px] text-stone-600 dark:text-stone-400 flex items-center gap-0.5">
                              <Repeat className="w-2.5 h-2.5" />
                              <span className="capitalize">{act.recurring}</span>
                            </span>
                          )}
                        </div>
                        {act.notes && (
                          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            {act.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono ${
                          act.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : act.priority === 'High'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                      >
                        {act.priority}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(act)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full"
                        title="Edit activity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteActivity(act.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full"
                        title="Delete activity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* WEEKLY MATRIX VIEW */}
      {viewMode === 'weekly' && (
        <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-2xl overflow-x-auto shadow-xs">
          <div className="min-w-[840px]">
            <div className="grid grid-cols-7 border-b border-stone-200/80 dark:border-stone-800 bg-[#FFFBF7] dark:bg-stone-900/40 text-center text-xs divide-x divide-stone-200/60 dark:divide-stone-800">
              {weekDays.map((d) => (
                <div
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`py-3 px-2 cursor-pointer transition-colors ${
                    d.isCurrent
                      ? 'bg-[#FFD6C2]/40 dark:bg-[#FF936B]/20 font-bold text-[#FF936B]'
                      : 'hover:bg-stone-100/50'
                  }`}
                >
                  <div className="text-[11px] text-stone-500 uppercase tracking-wide">{d.name}</div>
                  <div className="text-sm font-heading font-semibold text-stone-800 dark:text-stone-100">
                    {d.label}
                  </div>
                  {d.isToday && (
                    <span className="inline-block mt-0.5 text-[9px] bg-[#58B98A] text-white px-1.5 py-0.2 rounded-full">
                      Today
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-stone-200/60 dark:divide-stone-800 p-2 min-h-[480px]">
              {weekDays.map((d) => {
                const dayActs = schedule
                  .filter((a) => isActivityOnDate(a, d.dateStr))
                  .sort((a, b) => parseMin(a.startTime) - parseMin(b.startTime));

                return (
                  <div
                    key={d.dateStr}
                    className={`p-1.5 space-y-2 rounded-lg transition-colors ${
                      d.isCurrent ? 'bg-[#FFF9F5] dark:bg-[#1f1e1d]' : ''
                    }`}
                  >
                    {dayActs.map((act) => {
                      const cat = CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.Personal;
                      return (
                        <div
                          key={act.id}
                          onClick={() => handleOpenEdit(act)}
                          className={`p-2 rounded-xl text-[11px] cursor-pointer hover:shadow-xs transition-shadow border ${cat.bgLight} ${cat.textLight} ${cat.borderLight} ${cat.bgDark} ${cat.textDark} ${cat.borderDark}`}
                        >
                          <div className="font-mono text-[10px] font-semibold opacity-85">
                            {act.startTime}-{act.endTime}
                          </div>
                          <div className="font-medium truncate mt-0.5">{act.title}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC MONTHLY VIEW */}
      {viewMode === 'monthly' && (
        <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
          {/* Month Header with Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-[#FF936B]" />
              <h2 className="font-bold text-base text-stone-800 dark:text-stone-200 font-heading">
                {monthData.monthName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const prev = new Date(monthDate);
                  prev.setMonth(prev.getMonth() - 1);
                  setMonthDate(prev);
                }}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setMonthDate(new Date(todayDate + 'T00:00:00'));
                  setSelectedDate(todayDate);
                }}
                className="px-3 py-1 text-xs font-semibold rounded-full bg-[#FFE7CE] hover:bg-[#ffd7b3] text-[#FF936B]"
              >
                Current Month
              </button>
              <button
                onClick={() => {
                  const next = new Date(monthDate);
                  next.setMonth(next.getMonth() + 1);
                  setMonthDate(next);
                }}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-semibold text-stone-500 text-xs py-1">
                {day}
              </div>
            ))}

            {monthData.cells.map((cell, i) => {
              const isToday = cell.dateStr === todayDate;
              const isSelected = cell.dateStr === selectedDate;
              const cellActs = schedule.filter((a) => isActivityOnDate(a, cell.dateStr));

              return (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedDate(cell.dateStr);
                    setViewMode('daily');
                  }}
                  className={`min-h-[78px] p-2 rounded-xl border text-xs flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                    isSelected
                      ? 'border-[#FF936B] ring-2 ring-[#FF936B]/30 bg-[#FFF5EE] dark:bg-[#2b1f1a]'
                      : isToday
                      ? 'border-[#58B98A] bg-[#F2FAF5] dark:bg-[#1a2920]'
                      : cell.inMonth
                      ? 'border-stone-200/70 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/10 hover:border-stone-300'
                      : 'border-transparent opacity-40 bg-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span
                      className={`font-semibold ${
                        isToday
                          ? 'text-[#58B98A]'
                          : isSelected
                          ? 'text-[#FF936B] font-bold'
                          : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {isToday && (
                      <span className="text-[9px] bg-[#58B98A] text-white px-1.5 py-0.2 rounded-full font-sans">
                        Today
                      </span>
                    )}
                  </div>

                  {cellActs.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      <span className="text-[10px] font-medium text-stone-600 dark:text-stone-400 block truncate">
                        {cellActs.length} {cellActs.length === 1 ? 'block' : 'blocks'}
                      </span>
                      <div className="flex gap-1 overflow-hidden">
                        {cellActs.slice(0, 3).map((a) => {
                          const cat = CATEGORY_CONFIG[a.category] || CATEGORY_CONFIG.Personal;
                          return (
                            <span
                              key={a.id}
                              className={`w-2 h-2 rounded-full ${cat.bgLight} shrink-0`}
                              title={a.title}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161a1c] border border-stone-200 dark:border-stone-800 rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading">
                {editingActivity ? 'Edit Timetable Block' : 'Add Timetable Block'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abdul Bari DSA Dynamic Programming"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#FF936B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ActivityCategory)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                  >
                    {Object.keys(CATEGORY_CONFIG).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Start Time (HH:MM)
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    End Time (HH:MM)
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Specific Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Recurring Cadence
                  </label>
                  <select
                    value={formRecurring}
                    onChange={(e) => setFormRecurring(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                  >
                    <option value="once">Once on selected date</option>
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays (Mon-Fri)</option>
                    <option value="weekends">Weekends only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Notes & Key Checklist
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Chapter 4 problem set, submit lab report"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#FF936B]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isFixed"
                  checked={formIsFixed}
                  onChange={(e) => setFormIsFixed(e.target.checked)}
                  className="rounded text-[#FF936B] focus:ring-[#FF936B]"
                />
                <label htmlFor="isFixed" className="text-stone-700 dark:text-stone-300 select-none">
                  Lock as <strong>Fixed Commitment</strong> (e.g., college lecture, exam, sleep, or meal)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200/80 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF9466] hover:bg-[#FF8550] text-white font-bold rounded-full shadow-xs transition-colors"
                >
                  {editingActivity ? 'Save Changes' : 'Add to Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
