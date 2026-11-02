import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../types';
import { ProfilePhotoModal } from '../common/ProfilePhotoModal';
import { AuthModal } from '../auth/AuthModal';
import {
  Bell,
  Menu,
  Sun,
  Moon,
  Camera,
  Printer,
  Calendar,
  User,
  Sparkles,
  Palette,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  mobileSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
}) => {
  const {
    activeTab,
    setActiveTab,
    profile,
    updateProfile,
    focusMode,
    toggleFocusMode,
    requestNotificationPermission,
    notificationPermission,
    selectedDate,
    todayDate,
    goToToday,
    formatDateHeading,
    currentUser,
    setIsBackgroundGalleryOpen,
  } = useApp();

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const getPageTitle = (tab: NavTab) => {
    switch (tab) {
      case 'overview':
      case 'dashboard':
        return 'Overview';
      case 'timetable':
      case 'schedule':
        return 'Timetable';
      case 'tasks':
        return "Today's Tasks";
      case 'ai-planner':
        return 'AI Study Planner';
      case 'exams':
        return 'Exams & Goals';
      case 'assistant':
        return 'Study Assistant';
      case 'habits':
        return 'Habits';
      case 'analytics':
        return 'Productivity Analytics';
      case 'settings':
        return 'Settings';
      default:
        return 'Overview';
    }
  };

  const isToday = selectedDate === todayDate;
  const isDemo = !currentUser || currentUser.uid === 'demo-taly';

  return (
    <>
      <header className="bg-white dark:bg-[#1a1f22] rounded-[24px] px-5 sm:px-6 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-stone-100/90 dark:border-stone-800 flex items-center justify-between gap-3 sm:gap-4 transition-all no-print select-none">
        {/* Left: Mobile menu button + Page Title + Date indicator */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 shrink-0"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[#2D2D2D] dark:text-stone-100 font-heading tracking-tight truncate">
              {getPageTitle(activeTab)}
            </h1>
            <p className="text-[11px] text-stone-400 font-medium truncate hidden sm:block">
              {formatDateHeading(selectedDate)} {!isToday && '(Browsing date)'}
            </p>
          </div>
        </div>

        {/* Right Controls: Today Button + Focus Mood + Theme + Account */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* If viewing a non-today date, show a quick 'Jump to Today' chip */}
          {!isToday && (
            <button
              onClick={goToToday}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#FF936B] bg-[#FFF0B3]/50 hover:bg-[#FFF0B3] rounded-full border border-[#FFE0B8] transition-colors"
              title="Jump to today's schedule"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Today</span>
            </button>
          )}

          {/* Quick Print Button */}
          <button
            onClick={() => window.print()}
            title="Print schedule"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 rounded-full transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Focus Mood Toggle */}
          <button
            onClick={toggleFocusMode}
            className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full transition-all text-xs font-bold select-none ${
              focusMode
                ? 'bg-[#D8F5DF] text-[#1E6038] ring-1 ring-[#58B98A]/50 shadow-xs'
                : 'bg-[#F2F8F4] dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-[#D8F5DF]'
            }`}
            title="Toggle Focus Mode to minimize distractions and boost concentration"
          >
            <span className="text-xs hidden sm:inline">Focus Mood</span>
            <span className="text-xs sm:hidden">Focus</span>
            <div
              className={`w-7 sm:w-8 h-4 rounded-full flex items-center transition-colors p-0.5 ${
                focusMode ? 'bg-[#58B98A] justify-end' : 'bg-stone-300 dark:bg-stone-600 justify-start'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>

          {/* Notification Bell */}
          <button
            onClick={requestNotificationPermission}
            title={
              notificationPermission === 'granted'
                ? 'Notifications Active'
                : 'Click to enable study reminders'
            }
            className="w-9 h-9 rounded-full bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {notificationPermission !== 'granted' && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF936B]" />
            )}
          </button>

          {/* Wallpaper / Background Gallery Button */}
          <button
            onClick={() => setIsBackgroundGalleryOpen(true)}
            className="w-9 h-9 rounded-full bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-[#FFF5ED] hover:text-[#FF936B] hover:border-[#FFD6C2] transition-colors"
            title="Open Background Gallery & Wallpapers"
          >
            <Palette className="w-4 h-4 text-[#FF936B]" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => updateProfile({ darkMode: !profile.darkMode })}
            className="w-9 h-9 rounded-full bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 transition-colors"
            title="Toggle light/dark theme"
          >
            {profile.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-500" />}
          </button>

          {/* User Profile & Account Lockup */}
          <div className="flex items-center gap-2 pl-1 relative group">
            {/* Circular Avatar with Camera overlay */}
            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#FFD6C2] dark:ring-[#FFA45F]/40 bg-gradient-to-br from-[#FFB9B5] to-[#FFD6C2] flex items-center justify-center shrink-0 shadow-xs hover:ring-[#FF936B] transition-all"
              title="Click to change profile picture"
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold text-xs text-[#FF936B] font-heading">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}

              <div className="absolute inset-0 bg-black/35 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Account Info Button (Opens AuthModal) */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden sm:flex flex-col text-left leading-tight hover:opacity-85 transition-opacity"
              title="Click to manage account, login, or register"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#303030] dark:text-stone-100">
                  {profile.name}
                </span>
                {isDemo ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    Demo
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Active
                  </span>
                )}
              </div>
              <span className="text-[11px] text-stone-400 font-normal truncate max-w-[110px]">
                {profile.email || (isDemo ? 'Demo Mode' : 'Account')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Profile Photo Upload Modal */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />

      {/* Auth Modal for Login, Register, Logout, and Demo switching */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
