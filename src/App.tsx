import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ScheduleView } from './components/schedule/ScheduleView';
import { AIPlannerView } from './components/ai/AIPlannerView';
import { TasksView } from './components/tasks/TasksView';
import { ExamsView } from './components/exams/ExamsView';
import { StudyAssistantView } from './components/assistant/StudyAssistantView';
import { HabitTrackerView } from './components/habits/HabitTrackerView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { PrintableTimetable } from './components/common/PrintableTimetable';
import { BackgroundGalleryModal } from './components/background/BackgroundGalleryModal';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    backgroundConfig,
    isBackgroundGalleryOpen,
    setIsBackgroundGalleryOpen,
  } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Helper for computing overlay background color based on tint & opacity
  const getOverlayColor = () => {
    if (!backgroundConfig || backgroundConfig.overlayTint === 'none' || !backgroundConfig.overlayOpacity) {
      return 'transparent';
    }
    const alpha = (backgroundConfig.overlayOpacity / 100).toFixed(2);
    switch (backgroundConfig.overlayTint) {
      case 'white':
        return `rgba(255, 255, 255, ${alpha})`;
      case 'dark':
        return `rgba(18, 20, 24, ${alpha})`;
      case 'warm':
        return `rgba(255, 147, 107, ${alpha})`;
      default:
        return 'transparent';
    }
  };

  return (
    <div className="min-h-screen py-5 sm:py-8 px-2 sm:px-5 lg:px-8 flex flex-col items-center justify-start select-none relative">
      {/* Dynamic Background Image & Filters Layer */}
      {backgroundConfig && backgroundConfig.type !== 'default' && (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden no-print">
          <div
            className="absolute -inset-4 transition-all duration-300"
            style={{
              backgroundImage: backgroundConfig.url
                ? `url(${backgroundConfig.url})`
                : backgroundConfig.fallbackGradient,
              backgroundPosition: backgroundConfig.imagePosition || 'center',
              backgroundSize: backgroundConfig.scaling || 'cover',
              backgroundRepeat: 'no-repeat',
              filter: `brightness(${backgroundConfig.brightness || 100}%) blur(${backgroundConfig.blur || 0}px)`,
            }}
          />

          {backgroundConfig.overlayTint !== 'none' && backgroundConfig.overlayOpacity > 0 && (
            <div
              className="absolute inset-0 transition-colors duration-300"
              style={{
                backgroundColor: getOverlayColor(),
              }}
            />
          )}
        </div>
      )}

      {/* Background Gallery & Personalization Modal */}
      <BackgroundGalleryModal
        isOpen={isBackgroundGalleryOpen}
        onClose={() => setIsBackgroundGalleryOpen(false)}
      />
      {/* Printable View (Visible only during window.print()) */}
      <PrintableTimetable />

      {/* Top Banner Header (Matches Reference image title & tagline) */}
      <div className="text-center mb-6 sm:mb-8 no-print">
        <h1 className="text-3xl sm:text-5xl font-bold text-white font-heading tracking-tight drop-shadow-xs">
          FocusMate
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-white/95 max-w-lg mx-auto font-medium leading-relaxed tracking-normal px-4">
          A product for students who want to stay focused, organized, and achieve their academic goals
        </p>
      </div>

      {/* Large Rounded Dashboard Container (Matches Reference image) */}
      <div className="w-full max-w-6xl mx-auto bg-white/92 dark:bg-[#15191c]/92 backdrop-blur-2xl rounded-[36px] sm:rounded-[44px] shadow-[0_20px_70px_-10px_rgba(255,140,90,0.28)] border border-white/80 dark:border-stone-800 p-4 sm:p-6 lg:p-7 transition-all flex flex-col lg:flex-row gap-5 items-stretch no-print">
        {/* Left Vertical Coral Sidebar */}
        <Sidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Right Dashboard Area: Top Bar + Active Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Top Bar */}
          <Header
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            mobileSidebarOpen={mobileSidebarOpen}
          />

          {/* Active Page Viewport */}
          <main className="flex-1 min-w-0">
            {(activeTab === 'overview' || activeTab === 'dashboard') && <DashboardView />}
            {(activeTab === 'timetable' || activeTab === 'schedule') && <ScheduleView />}
            {activeTab === 'tasks' && <TasksView />}
            {activeTab === 'ai-planner' && <AIPlannerView />}
            {activeTab === 'exams' && <ExamsView />}
            {activeTab === 'assistant' && <StudyAssistantView />}
            {activeTab === 'habits' && <HabitTrackerView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'settings' && <SettingsView />}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Thumb-friendly on mobile screens) */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-[#161a1c]/95 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800 lg:hidden flex justify-around items-center h-14 px-2 no-print shadow-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'overview' || activeTab === 'dashboard'
              ? 'text-[#FF986B]'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5 stroke-[2.2]" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'timetable' || activeTab === 'schedule'
              ? 'text-[#FF986B]'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <Calendar className="w-4 h-4 mb-0.5 stroke-[2.2]" />
          <span>Timetable</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-planner')}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-bold transition-colors ${
            activeTab === 'ai-planner'
              ? 'text-[#FF986B]'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <div className="w-7 h-7 -mt-3 rounded-full bg-[#FF9466] text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="mt-0.5">AI Plan</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'tasks'
              ? 'text-[#FF986B]'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <CheckSquare className="w-4 h-4 mb-0.5 stroke-[2.2]" />
          <span>Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'exams'
              ? 'text-[#FF986B]'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <GraduationCap className="w-4 h-4 mb-0.5 stroke-[2.2]" />
          <span>Exams</span>
        </button>
      </nav>

      {/* Footer Tagline */}
      <footer className="mt-6 text-center text-xs text-white/80 no-print">
        <p className="font-semibold">
          FocusMate — Your goals. Your time. Your balance.
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
