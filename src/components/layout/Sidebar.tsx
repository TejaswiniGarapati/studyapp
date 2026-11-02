import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../types';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Sparkles,
  GraduationCap,
  MessageSquare,
  Repeat,
  BarChart3,
  Settings,
  X,
  Clock,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, pendingProposal, pendingTasksCount } = useApp();

  const navItems: {
    id: NavTab;
    aliases: string[];
    label: string;
    icon: React.ElementType;
    badge?: number | string;
  }[] = [
    {
      id: 'overview',
      aliases: ['overview', 'dashboard'],
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'timetable',
      aliases: ['timetable', 'schedule'],
      label: 'Timetable',
      icon: Calendar,
    },
    {
      id: 'tasks',
      aliases: ['tasks'],
      label: 'Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'ai-planner',
      aliases: ['ai-planner'],
      label: 'AI Planner',
      icon: Sparkles,
      badge: pendingProposal ? '●' : undefined,
    },
    {
      id: 'exams',
      aliases: ['exams'],
      label: 'Exams & Goals',
      icon: GraduationCap,
    },
    {
      id: 'assistant',
      aliases: ['assistant'],
      label: 'Study Assistant',
      icon: MessageSquare,
    },
    {
      id: 'habits',
      aliases: ['habits'],
      label: 'Habits',
      icon: Repeat,
    },
    {
      id: 'analytics',
      aliases: ['analytics'],
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings',
      aliases: ['settings'],
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleSelect = (tab: NavTab) => {
    setActiveTab(tab);
    onClose();
  };

  const isCurrentActive = (item: typeof navItems[0]) => {
    return item.aliases.includes(activeTab);
  };

  return (
    <>
      {/* Desktop Vertical Pod Sidebar */}
      <aside className="hidden lg:flex flex-col items-center gap-3 shrink-0 no-print select-none">
        {/* App Logo: Speed Clock matching reference */}
        <button
          onClick={() => setActiveTab('overview')}
          className="mb-1 p-2 rounded-2xl hover:scale-105 transition-transform group flex items-center justify-center"
          title="FocusMate — Home"
        >
          <div className="relative flex items-center justify-center">
            {/* Speed trails */}
            <div className="absolute -left-1.5 flex flex-col gap-0.5">
              <span className="w-2.5 h-0.5 bg-[#FF986B] rounded-full" />
              <span className="w-3.5 h-0.5 bg-[#FF986B] rounded-full" />
              <span className="w-2 h-0.5 bg-[#FF986B] rounded-full" />
            </div>
            {/* Clock icon badge */}
            <div className="w-9 h-9 rounded-full bg-[#FFF0B8] border-2 border-[#FF986B] flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4 text-[#FF986B] stroke-[2.5]" />
            </div>
          </div>
        </button>

        {/* Coral Vertical Pod */}
        <div className="w-[72px] bg-gradient-to-b from-[#FFA45F] to-[#FF8A58] rounded-[28px] py-4 px-2.5 flex flex-col items-center gap-2 shadow-[0_10px_25px_-5px_rgba(255,140,90,0.35)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item);

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleSelect(item.id)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 relative ${
                    active
                      ? 'bg-white/35 text-white shadow-xs backdrop-blur-xs scale-102'
                      : 'text-white/85 hover:text-white hover:bg-white/15'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />

                  {item.badge !== undefined && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white ring-2 ring-[#FF8A58]" />
                  )}
                </button>

                {/* Hover Tooltip on desktop */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 pl-2">
                  <div className="bg-[#303030] text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md">
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#FFF8F5] dark:bg-[#1a1f22] border-r border-stone-200 dark:border-stone-800 p-5 flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FFF0B8] border-2 border-[#FF986B] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#FF986B] stroke-[2.5]" />
              </div>
              <div>
                <span className="font-bold text-[#303030] dark:text-stone-100 font-heading text-base">
                  FocusMate
                </span>
                <p className="text-[10px] text-stone-500">Student Productivity</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mt-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrentActive(item);

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    active
                      ? 'bg-[#FF9466] text-white shadow-xs'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        active
                          ? 'bg-white/30 text-white'
                          : 'bg-[#FF986B]/20 text-[#FF986B]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 text-xs text-stone-500">
          <p className="font-semibold text-stone-700 dark:text-stone-300">FocusMate Study App</p>
          <p className="text-[11px] text-stone-400 mt-0.5">Stay focused & achieve your goals.</p>
        </div>
      </aside>
    </>
  );
};
