import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_CONFIG } from '../../data/initialData';
import { ActivityCategory } from '../../types';
import {
  Sparkles,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Plus,
  AlertTriangle,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Send,
  CalendarDays,
  CalendarCheck,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    profile,
    tasks,
    exams,
    conflicts,
    addTask,
    toggleTask,
    setActiveTab,
    toggleFocusMode,
    focusMode,
    triggerConfetti,
    selectedDate,
    todayDate,
    setSelectedDate,
    goToToday,
    goToPrevDay,
    goToNextDay,
    selectedDateActivities,
    selectedDateTasks,
    selectedDateStudyHours,
    isDateToday,
    formatDateHeading,
  } = useApp();

  const [quickTitle, setQuickTitle] = useState('');
  const [quickCat, setQuickCat] = useState<ActivityCategory>('College');
  const [quickTime, setQuickTime] = useState('8:00 AM');

  // Month navigation inside the mini-calendar widget
  const [calendarMonthDate, setCalendarMonthDate] = useState<Date>(() => {
    return new Date(selectedDate + 'T00:00:00');
  });

  // Keep calendar month view aligned if selectedDate jumps to a different month
  useEffect(() => {
    const sDate = new Date(selectedDate + 'T00:00:00');
    if (
      sDate.getMonth() !== calendarMonthDate.getMonth() ||
      sDate.getFullYear() !== calendarMonthDate.getFullYear()
    ) {
      setCalendarMonthDate(new Date(sDate.getFullYear(), sDate.getMonth(), 1));
    }
  }, [selectedDate]);

  // Greeting by hour for current local time
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const isCurrentDay = isDateToday(selectedDate);

  // Dynamic greeting title
  const getGreetingHeader = () => {
    if (isCurrentDay) {
      return `${timeGreeting}, ${profile.name}!`;
    }
    const todayObj = new Date(todayDate + 'T00:00:00');
    const selectedObj = new Date(selectedDate + 'T00:00:00');
    const diffTime = selectedObj.getTime() - todayObj.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) return `Tomorrow's Plan, ${profile.name}!`;
    if (diffDays === -1) return `Yesterday's Review, ${profile.name}`;
    if (diffDays > 0) return `${diffDays} Days Ahead, ${profile.name}`;
    return `Past Day Review, ${profile.name}`;
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      category: quickCat,
      priority: 'High',
      dueDate: selectedDate,
      dueTime: quickTime,
      completed: false,
      recurring: 'none',
      notes: `Added for ${selectedDate}`,
    });

    setQuickTitle('');
    triggerConfetti();
  };

  // Performance calculation for tasks
  const completedCount = selectedDateTasks.filter((t) => t.completed).length;
  const totalCount = selectedDateTasks.length;
  const performancePct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : isCurrentDay ? 72 : 100;

  // Dynamic calendar math (0-indexed month, Monday = 0)
  const viewYear = calendarMonthDate.getFullYear();
  const viewMonth = calendarMonthDate.getMonth();
  const monthName = calendarMonthDate.toLocaleDateString('en-US', { month: 'short' });

  const firstDayRaw = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sun
  const firstDayMondayOffset = (firstDayRaw + 6) % 7; // 0 is Mon, 6 is Sun
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCalendarMonthDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCalendarMonthDate(new Date(viewYear, viewMonth + 1, 1));
  };

  // 7-day productivity bar chart values
  const weeklyData = [
    { day: 'M', hours: 7.5, color: '#A9D7B5' },
    { day: 'T', hours: 8.2, color: '#55B88A' },
    { day: 'W', hours: 6.5, color: '#FFA45F' },
    { day: 'T', hours: 9.0, color: '#55B88A' },
    { day: 'F', hours: 7.0, color: '#A9D7B5' },
    { day: 'S', hours: 8.5, color: '#FF986B' },
    { day: 'S', hours: selectedDateStudyHours || 7.5, color: '#55B88A' },
  ];

  return (
    <div className="space-y-6 pb-6 select-none">
      {/* Date Navigation Strip (Allows moving day by day or jumping to today) */}
      <div className="bg-white/80 dark:bg-[#1a1f22]/80 backdrop-blur-md rounded-[22px] px-4 py-2.5 shadow-xs border border-stone-100/90 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-[#FF936B]" />
          <span className="font-bold text-[#2D2D2D] dark:text-stone-100 text-sm">
            {formatDateHeading(selectedDate)}
          </span>
          {isCurrentDay ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D8F5DF] text-[#1E6038]">
              Today
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFE0B8] text-[#9E511D]">
              Selected
            </span>
          )}
        </div>

        {/* Previous Day, Today, Next Day Controls */}
        <div className="flex items-center gap-1.5 font-semibold">
          <button
            onClick={goToPrevDay}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev Day</span>
          </button>

          {!isCurrentDay && (
            <button
              onClick={goToToday}
              className="px-3.5 py-1.5 rounded-full bg-[#FFF0B3] text-[#7A5800] hover:bg-[#ffe680] font-bold transition-colors"
              title="Jump to Today"
            >
              Today
            </button>
          )}

          <button
            onClick={goToNextDay}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 transition-colors"
            title="Next Day"
          >
            <span>Next Day</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Conflicts Alert if any */}
      {conflicts.length > 0 && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-[20px] flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{conflicts.length} schedule conflict detected</strong> between today's blocks ({conflicts[0].title1} & {conflicts[0].title2}).
            </span>
          </div>
          <button
            onClick={() => setActiveTab('timetable')}
            className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline shrink-0"
          >
            Resolve in Timetable
          </button>
        </div>
      )}

      {/* Focus Mode Banner (If active) */}
      {focusMode && (
        <div className="p-3 bg-[#D8F5DF] border border-[#58B98A] rounded-[20px] flex items-center justify-between text-xs text-[#1E6038] shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#58B98A] animate-ping" />
            <span className="font-bold">Focus Mode is ON</span>
            <span className="text-stone-600 dark:text-stone-400">· Concentrating on current tasks without distractions</span>
          </div>
          <button
            onClick={toggleFocusMode}
            className="text-[11px] font-bold text-[#1E6038] hover:underline"
          >
            Turn off
          </button>
        </div>
      )}

      {/* ROW 1: Dynamic Welcome Card & Today's Tasks Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Dynamic Welcome Card with Dynamic Month Calendar Widget (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1a1f22] rounded-[30px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-stone-100 dark:border-stone-800 flex flex-col justify-between relative group">
          {/* Card Body */}
          <div className="p-6 sm:p-7 relative z-10 flex flex-col sm:flex-row justify-between gap-6 h-full">
            {/* Left side: Dynamic Greeting + Task count + CTA Button */}
            <div className="flex flex-col justify-between space-y-4 max-w-xs z-10">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold text-[#2D2D2D] dark:text-stone-100 font-heading leading-tight">
                  {getGreetingHeader()}
                </h2>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 font-medium">
                  You have <strong className="text-[#FF936B] font-semibold">{selectedDateTasks.length} tasks</strong> scheduled for this day
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {selectedDateActivities.length} timetable blocks · {selectedDateStudyHours}h study target
                </p>
              </div>

              {/* Ready! Call-to-action button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toggleFocusMode();
                    triggerConfetti();
                  }}
                  className="px-6 py-2 rounded-full bg-white dark:bg-stone-800 text-[#2D2D2D] dark:text-stone-100 hover:text-[#FF936B] font-bold text-xs shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-md border border-stone-200/80 dark:border-stone-700 transition-all active:scale-95"
                >
                  Ready!
                </button>
                <button
                  onClick={() => setActiveTab('timetable')}
                  className="px-4 py-2 rounded-full bg-[#FFF0B3]/50 hover:bg-[#FFF0B3] text-[#7A5800] text-xs font-semibold transition-colors"
                >
                  View Schedule
                </button>
              </div>
            </div>

            {/* Right side: Dynamic Monthly Calendar Widget with Month Navigation */}
            <div className="bg-white/85 dark:bg-stone-900/85 backdrop-blur-md rounded-[22px] p-3.5 border border-white/60 dark:border-stone-800 w-full sm:w-60 shrink-0 shadow-xs z-10 self-center sm:self-auto">
              {/* Month Header with < > buttons */}
              <div className="flex items-center justify-between pb-2 mb-1 border-b border-stone-100 dark:border-stone-800">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
                  title="Previous month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  {monthName} {viewYear}
                </div>

                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
                  title="Next month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day Name Headers (Monday to Sunday) */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-stone-400 mb-1">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>

              {/* Dynamic Days Grid */}
              <div className="grid grid-cols-7 text-center text-[11px] font-mono gap-y-1">
                {/* Leading blanks */}
                {Array.from({ length: firstDayMondayOffset }).map((_, i) => (
                  <span key={`blank-${i}`} />
                ))}

                {/* Days of current month */}
                {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = dateStr === selectedDate;
                  const isActualToday = dateStr === todayDate;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-6 w-6 mx-auto rounded-full flex items-center justify-center text-[10px] font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#FF936B] text-white font-bold shadow-xs scale-105'
                          : isActualToday
                          ? 'border border-[#58B98A] text-[#1E6038] font-bold bg-[#D8F5DF]/40'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                      title={dateStr}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sunrise Art in warm blush/peach/gold */}
          <div className="absolute inset-0 pointer-events-none opacity-45 dark:opacity-20 overflow-hidden">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 600 300"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="skyGradBrighter" x1="0" y1="0" x2="600" y2="300" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFB9B5" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#FFD6C2" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#FFF0B3" stopOpacity="0.5" />
                </linearGradient>
                <radialGradient id="sunGlowBrighter" cx="200" cy="180" r="100" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFF0B3" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#FFA45F" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FFA45F" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="600" height="300" fill="url(#skyGradBrighter)" />
              <circle cx="210" cy="170" r="70" fill="url(#sunGlowBrighter)" />
              <circle cx="210" cy="170" r="32" fill="#FFFFFF" fillOpacity="0.9" />
              <ellipse cx="280" cy="160" rx="90" ry="16" fill="#FFFFFF" fillOpacity="0.4" />
              <ellipse cx="140" cy="180" rx="70" ry="12" fill="#FFFFFF" fillOpacity="0.3" />

              <path
                d="M0 300 L0 230 L30 230 L45 190 L50 190 L55 230 L80 230 L95 170 L100 170 L105 230 L130 230 L135 210 L150 210 L160 180 L165 180 L170 210 L200 210 L210 240 L260 240 L280 200 L285 200 L290 240 L340 240 L350 160 L355 160 L360 240 L400 240 L415 190 L420 190 L425 240 L480 240 L500 170 L505 170 L510 240 L560 240 L580 210 L600 210 L600 300 Z"
                fill="#C69492"
                fillOpacity="0.35"
              />
              <path
                d="M0 300 L0 250 L60 250 L75 220 L80 220 L85 250 L140 250 L155 200 L160 200 L165 250 L240 250 L255 210 L260 210 L265 250 L330 250 L340 180 L345 180 L350 250 L420 250 L435 220 L440 220 L445 250 L520 250 L535 200 L540 200 L545 250 L600 250 L600 300 Z"
                fill="#9F6B7E"
                fillOpacity="0.25"
              />
            </svg>
          </div>
        </div>

        {/* Tasks for the Selected Day Card (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1a1f22] rounded-[30px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-stone-100 dark:border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div>
                <h3 className="text-base font-bold text-[#2D2D2D] dark:text-stone-100 font-heading">
                  {isCurrentDay ? "Today's Tasks" : `Tasks (${selectedDate})`}
                </h3>
                <p className="text-[11px] text-stone-400">
                  {selectedDateTasks.length} task{selectedDateTasks.length === 1 ? '' : 's'} scheduled
                </p>
              </div>

              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-semibold text-[#FF936B] hover:underline"
              >
                View all ({tasks.length})
              </button>
            </div>

            {/* Selected Date Tasks List */}
            <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-56 overflow-y-auto pr-1">
              {selectedDateTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  <CalendarCheck className="w-7 h-7 text-stone-300 dark:text-stone-600 mx-auto mb-1.5" />
                  <p>No tasks scheduled for {selectedDate}.</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Use the quick add bar below to schedule one!</p>
                </div>
              ) : (
                selectedDateTasks.slice(0, 5).map((task) => {
                  const getDotColor = (category: string) => {
                    if (category === 'College' || category === 'Placements') return 'bg-[#58B98A]';
                    if (category === 'Python' || category === 'DSA' || category === 'GATE') return 'bg-[#FFA45F]';
                    if (category === 'Coding') return 'bg-[#58B98A]';
                    return 'bg-[#E8DFFF]';
                  };

                  const getCategoryLabel = (category: string) => {
                    if (category === 'College' || category === 'Placements') return 'Work';
                    if (category === 'Python' || category === 'DSA' || category === 'GATE') return 'Study';
                    return category;
                  };

                  return (
                    <div
                      key={task.id}
                      className="py-3 flex items-center justify-between gap-3 group hover:bg-stone-50/50 dark:hover:bg-stone-800/20 px-1 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                            task.completed
                              ? 'bg-[#58B98A] border-[#58B98A] text-white'
                              : 'border-stone-300 dark:border-stone-600 hover:border-[#FF936B]'
                          }`}
                        >
                          {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <div className="truncate">
                          <p
                            className={`text-xs font-bold truncate ${
                              task.completed
                                ? 'line-through text-stone-400'
                                : 'text-[#2D2D2D] dark:text-stone-100'
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(task.category)}`} />
                            <span>{getCategoryLabel(task.category)}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-mono text-stone-400 tabular-nums shrink-0">
                        {task.dueTime || '8:00 AM'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Add Bar */}
          <form onSubmit={handleQuickAdd} className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[#FFF9F0] dark:bg-stone-800 rounded-full px-3 py-1.5 border border-stone-200/60 dark:border-stone-700">
              <span className="text-[#FF936B] font-bold text-xs mr-1.5">+</span>
              <input
                type="text"
                placeholder={`Add task for ${selectedDate}...`}
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="w-full text-xs bg-transparent text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
              />
            </div>

            <select
              value={quickCat}
              onChange={(e) => setQuickCat(e.target.value as ActivityCategory)}
              className="text-[11px] font-semibold bg-[#FFF9F0] dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 rounded-full px-2.5 py-1.5 text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="College">• Work</option>
              <option value="Python">• Study</option>
              <option value="Coding">• Coding</option>
              <option value="Household Chores">• Chores</option>
            </select>

            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="w-8 h-8 rounded-full bg-[#D8F5DF] hover:bg-[#58B98A] text-[#1E6038] hover:text-white flex items-center justify-center transition-colors shrink-0 disabled:opacity-40"
              title="Add task"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ROW 2: Productivity Analysis & Task Performance for Selected Date */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Weekly Productivity Analysis Card (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1a1f22] rounded-[30px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between pb-3">
            <h3 className="text-base font-bold text-[#2D2D2D] dark:text-stone-100 font-heading">
              Weekly Productivity Analysis
            </h3>
            <span className="text-xs font-mono text-stone-400">
              Selected Day: {selectedDateStudyHours}h
            </span>
          </div>

          <div className="mt-3 relative pt-4">
            <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-stone-400">
              <span>10h Target</span>
              <div className="flex-1 border-b border-dashed border-stone-200 dark:border-stone-700" />
            </div>

            <div className="h-44 flex items-end justify-between px-3 sm:px-6">
              {weeklyData.map((item, idx) => {
                const heightPct = Math.min(100, Math.round((item.hours / 10) * 100));

                return (
                  <div key={idx} className="flex flex-col items-center gap-2.5 h-full justify-end group">
                    <span className="text-[10px] font-mono tabular-nums text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.hours}h
                    </span>

                    <div className="relative w-7 sm:w-8 h-32 bg-stone-50 dark:bg-stone-800/60 rounded-full flex items-end justify-center p-0.5 overflow-hidden">
                      <div
                        className="w-full rounded-full transition-all duration-500 relative flex items-start justify-center pt-1"
                        style={{
                          height: `${heightPct}%`,
                          backgroundColor: item.color,
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task Performance Card (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1a1f22] rounded-[30px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-stone-100 dark:border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-base font-bold text-[#2D2D2D] dark:text-stone-100 font-heading">
                Task Performance
              </h3>
              <span className="text-[11px] text-stone-400">
                {completedCount}/{totalCount} done
              </span>
            </div>
            <p className="text-xs text-stone-400">
              {isCurrentDay ? 'Today' : selectedDate}
            </p>
          </div>

          <div className="my-4 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-stone-100 dark:text-stone-800 stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-[#58B98A] stroke-current transition-all duration-700 ease-out"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - performancePct / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-[#2D2D2D] dark:text-stone-100">
                  {performancePct}%
                </span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                  Complete
                </span>
              </div>
            </div>

            <p className="mt-1 text-xs text-stone-500 text-center font-medium">
              {isCurrentDay
                ? "Great momentum! You're on track to achieve all planned goals."
                : `Tasks completion status for ${selectedDate}.`}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('ai-planner')}
            className="w-full py-2.5 rounded-full bg-[#FFF0B3]/50 hover:bg-[#FFF0B3] text-[#7A5800] font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-[#FFE0B8]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF936B]" />
            <span>AI Rebalance Today's Schedule</span>
          </button>
        </div>
      </div>

      {/* ROW 3: Milestones Countdown & Selected Date Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Deadlines (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#1a1f22] rounded-[30px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#FFA45F]" />
              <h3 className="text-sm font-bold text-[#2D2D2D] dark:text-stone-100 font-heading">
                Upcoming Examination Deadlines
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('exams')}
              className="text-xs font-semibold text-[#FF936B] hover:underline"
            >
              Track all
            </button>
          </div>

          <div className="mt-3 space-y-2.5">
            {exams.slice(0, 3).map((exam) => {
              const diffDays = Math.max(
                0,
                Math.ceil((new Date(exam.targetDate).getTime() - new Date(todayDate).getTime()) / (1000 * 60 * 60 * 24))
              );
              const doneTopics = exam.syllabusTopics.filter((t) => t.completed).length;
              const totalTopics = exam.syllabusTopics.length;
              const pct = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0;

              return (
                <div
                  key={exam.id}
                  className="p-3 bg-[#FFF9F0] dark:bg-stone-850 rounded-[18px] border border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-[#2D2D2D] dark:text-stone-100 truncate">
                      {exam.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      <span>Target: {exam.targetDate}</span>
                      <span aria-hidden="true">·</span>
                      <span>{pct}% syllabus</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="font-mono text-sm font-bold text-[#FF936B]">
                      {diffDays}d
                    </span>
                    <span className="block text-[10px] text-stone-400">remaining</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Date Timetable Sequence (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#1a1f22] rounded-[30px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#58B98A]" />
              <h3 className="text-sm font-bold text-[#2D2D2D] dark:text-stone-100 font-heading">
                Schedule for {selectedDate}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('timetable')}
              className="text-xs font-semibold text-[#FF936B] hover:underline"
            >
              Full timetable
            </button>
          </div>

          <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
            {selectedDateActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                <p>No activities scheduled for {selectedDate}.</p>
                <button
                  onClick={() => setActiveTab('timetable')}
                  className="mt-2 text-xs font-bold text-[#FF936B] hover:underline"
                >
                  + Add Block to Timetable
                </button>
              </div>
            ) : (
              selectedDateActivities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 bg-[#FFF9F0] dark:bg-stone-850 rounded-[16px] border border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono font-bold text-stone-700 dark:text-stone-300 text-[11px] w-24 shrink-0">
                      {act.startTime} - {act.endTime}
                    </span>
                    <p className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {act.title}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-500 font-mono shrink-0 ml-2">
                    {act.category}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
