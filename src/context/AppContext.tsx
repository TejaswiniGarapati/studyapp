import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Activity,
  Task,
  ExamGoal,
  Habit,
  StudentProfile,
  NavTab,
  AIProposal,
  ChatMessage,
  UserAccount,
  BackgroundConfig,
  CustomBackground,
} from '../types';
import {
  INITIAL_PROFILE,
  INITIAL_SCHEDULE,
  INITIAL_TASKS,
  INITIAL_EXAMS,
  INITIAL_HABITS,
} from '../data/initialData';
import { DEFAULT_BACKGROUND_CONFIG } from '../data/backgroundsData';

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  // Auth & Account
  currentUser: UserAccount | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string, education?: string) => { success: boolean; error?: string };
  logout: () => void;
  resetPassword: (email: string, newPass: string) => { success: boolean; error?: string };
  switchToDemo: () => void;
  // Student Profile
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  updateProfileAvatar: (dataUrl: string | null) => void;
  // Background Customization & Gallery
  backgroundConfig: BackgroundConfig;
  customBackgrounds: CustomBackground[];
  favoriteBackgroundIds: string[];
  updateBackgroundConfig: (updates: Partial<BackgroundConfig>) => void;
  applyBackground: (config: BackgroundConfig) => void;
  addCustomBackground: (fileData: { title: string; dataUrl: string; size: number; format: 'jpg' | 'jpeg' | 'png' | 'webp' }) => CustomBackground;
  deleteCustomBackground: (id: string) => void;
  toggleFavoriteBackground: (id: string) => void;
  resetBackgroundToDefault: () => void;
  isBackgroundGalleryOpen: boolean;
  setIsBackgroundGalleryOpen: (open: boolean) => void;
  // Schedule
  schedule: Activity[];
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  replaceScheduleWithProposed: (newActivities: Activity[]) => void;
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  // Exams & Goals
  exams: ExamGoal[];
  addExam: (exam: Omit<ExamGoal, 'id'>) => void;
  updateExam: (id: string, updates: Partial<ExamGoal>) => void;
  deleteExam: (id: string) => void;
  toggleSyllabusTopic: (examId: string, topicId: string) => void;
  // Habits
  habits: Habit[];
  toggleHabitDate: (habitId: string, dateStr: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'streak'>) => void;
  deleteHabit: (id: string) => void;
  // AI Planner & Chat
  pendingProposal: AIProposal | null;
  setPendingProposal: (proposal: AIProposal | null) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  // Backup / Data Management
  resetToDemoData: () => void;
  clearAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  // Notifications & Focus
  notificationPermission: NotificationPermission | 'unsupported';
  requestNotificationPermission: () => Promise<void>;
  notify: (title: string, options?: NotificationOptions) => void;
  focusMode: boolean;
  toggleFocusMode: () => void;
  setFocusMode: (val: boolean) => void;
  // Dynamic Calendar Navigation
  selectedDate: string;
  todayDate: string;
  setSelectedDate: (date: string) => void;
  goToToday: () => void;
  goToPrevDay: () => void;
  goToNextDay: () => void;
  selectedDateActivities: Activity[];
  selectedDateTasks: Task[];
  selectedDateStudyHours: number;
  isDateToday: (dateStr: string) => boolean;
  formatDateHeading: (dateStr: string) => string;
  conflicts: { id1: string; id2: string; title1: string; title2: string; time1: string; time2: string }[];
  todayStudyHours: number;
  completedTasksCount: number;
  pendingTasksCount: number;
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  CURRENT_USER: 'focusmate_active_user_v2',
  USERS_REGISTRY: 'focusmate_users_registry_v2',
  PASSWORDS: 'focusmate_passwords_v2',
};

const DEMO_USER: UserAccount = {
  uid: 'demo-taly',
  name: 'Taly',
  email: 'taly@focusmate.app',
  profileImage: undefined,
  education: 'Computer Science & Engineering • GATE 2027 Aspirant',
  timezone: 'Asia/Kolkata',
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
};

export function getTodayDateStr(tz: string = 'Asia/Kolkata'): string {
  try {
    const cleanTz = tz && tz.includes('/') ? tz.split(' ')[0] : 'Asia/Kolkata';
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: cleanTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const toggleFocusMode = () => setFocusMode((prev) => !prev);

  // Active User session
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : DEMO_USER;
    } catch {
      return DEMO_USER;
    }
  });

  // Storage partition key helper
  const getUserKey = (category: string, uid?: string) => {
    const activeUid = uid || currentUser?.uid || 'demo-taly';
    return `focusmate_${activeUid}_${category}`;
  };

  // Profile State
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const key = getUserKey('profile');
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      if (currentUser?.uid === 'demo-taly') return INITIAL_PROFILE;
      return {
        uid: currentUser?.uid,
        name: currentUser?.name || 'Student',
        email: currentUser?.email || '',
        educationLevel: currentUser?.education || 'University Student',
        collegeHours: '09:00 - 13:00',
        lunchTime: '13:30',
        dinnerTime: '17:30',
        sleepTime: '23:00',
        wakeTime: '06:30',
        timezone: currentUser?.timezone || 'Asia/Kolkata',
        theme: 'sage',
        darkMode: false,
        targetDailyStudyHours: 7.5,
        isDemoUser: false,
      };
    } catch {
      return INITIAL_PROFILE;
    }
  });

  // Dynamic Date state
  const [todayDate, setTodayDate] = useState<string>(() => getTodayDateStr(profile.timezone));
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateStr(profile.timezone));

  // Auto-refresh todayDate every 30 seconds for midnight rollover
  useEffect(() => {
    const interval = setInterval(() => {
      const nowToday = getTodayDateStr(profile.timezone);
      setTodayDate((prev) => (prev !== nowToday ? nowToday : prev));
    }, 30000);
    return () => clearInterval(interval);
  }, [profile.timezone]);

  const goToToday = () => setSelectedDate(todayDate);

  const goToPrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isDateToday = (dateStr: string) => dateStr === todayDate;

  const formatDateHeading = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Schedule State
  const [schedule, setSchedule] = useState<Activity[]>(() => {
    try {
      const key = getUserKey('schedule');
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      return currentUser?.uid === 'demo-taly' ? INITIAL_SCHEDULE : [];
    } catch {
      return currentUser?.uid === 'demo-taly' ? INITIAL_SCHEDULE : [];
    }
  });

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const key = getUserKey('tasks');
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      return currentUser?.uid === 'demo-taly' ? INITIAL_TASKS : [];
    } catch {
      return currentUser?.uid === 'demo-taly' ? INITIAL_TASKS : [];
    }
  });

  // Exams State
  const [exams, setExams] = useState<ExamGoal[]>(() => {
    try {
      const key = getUserKey('exams');
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      return currentUser?.uid === 'demo-taly' ? INITIAL_EXAMS : [];
    } catch {
      return currentUser?.uid === 'demo-taly' ? INITIAL_EXAMS : [];
    }
  });

  // Habits State
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const key = getUserKey('habits');
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      return currentUser?.uid === 'demo-taly' ? INITIAL_HABITS : [];
    } catch {
      return currentUser?.uid === 'demo-taly' ? INITIAL_HABITS : [];
    }
  });

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const key = getUserKey('chat');
      const stored = localStorage.getItem(key);
      return stored
        ? JSON.parse(stored)
        : [
            {
              id: 'msg-init',
              role: 'assistant',
              text: "Hello! I'm your **FocusMate AI** study and routine companion. Ask me to rebalance your day, resolve conflicting study blocks, or plan preparation for university and competitive exams!",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ];
    } catch {
      return [];
    }
  });

  const [pendingProposal, setPendingProposal] = useState<AIProposal | null>(null);

  // Background Customization & Gallery State
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>(() => {
    try {
      const key = getUserKey('background_config');
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      return profile.backgroundConfig || DEFAULT_BACKGROUND_CONFIG;
    } catch {
      return DEFAULT_BACKGROUND_CONFIG;
    }
  });

  const [customBackgrounds, setCustomBackgrounds] = useState<CustomBackground[]>(() => {
    try {
      const key = getUserKey('custom_backgrounds');
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [favoriteBackgroundIds, setFavoriteBackgroundIds] = useState<string[]>(() => {
    try {
      const key = getUserKey('favorite_backgrounds');
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isBackgroundGalleryOpen, setIsBackgroundGalleryOpen] = useState(false);

  // Synchronize on user switch
  const switchUserSession = (user: UserAccount | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    const uid = user?.uid || 'demo-taly';
    try {
      const p = localStorage.getItem(`focusmate_${uid}_profile`);
      setProfile(
        p
          ? JSON.parse(p)
          : user?.uid === 'demo-taly'
          ? INITIAL_PROFILE
          : {
              uid: user?.uid,
              name: user?.name || 'Student',
              email: user?.email || '',
              educationLevel: user?.education || 'University Student',
              collegeHours: '09:00 - 13:00',
              lunchTime: '13:30',
              dinnerTime: '17:30',
              sleepTime: '23:00',
              wakeTime: '06:30',
              timezone: user?.timezone || 'Asia/Kolkata',
              theme: 'sage',
              darkMode: false,
              targetDailyStudyHours: 7.5,
              isDemoUser: false,
              backgroundConfig: DEFAULT_BACKGROUND_CONFIG,
            }
      );

      const s = localStorage.getItem(`focusmate_${uid}_schedule`);
      setSchedule(s ? JSON.parse(s) : user?.uid === 'demo-taly' ? INITIAL_SCHEDULE : []);

      const t = localStorage.getItem(`focusmate_${uid}_tasks`);
      setTasks(t ? JSON.parse(t) : user?.uid === 'demo-taly' ? INITIAL_TASKS : []);

      const e = localStorage.getItem(`focusmate_${uid}_exams`);
      setExams(e ? JSON.parse(e) : user?.uid === 'demo-taly' ? INITIAL_EXAMS : []);

      const h = localStorage.getItem(`focusmate_${uid}_habits`);
      setHabits(h ? JSON.parse(h) : user?.uid === 'demo-taly' ? INITIAL_HABITS : []);

      const bg = localStorage.getItem(`focusmate_${uid}_background_config`);
      setBackgroundConfig(bg ? JSON.parse(bg) : DEFAULT_BACKGROUND_CONFIG);

      const cb = localStorage.getItem(`focusmate_${uid}_custom_backgrounds`);
      setCustomBackgrounds(cb ? JSON.parse(cb) : []);

      const fb = localStorage.getItem(`focusmate_${uid}_favorite_backgrounds`);
      setFavoriteBackgroundIds(fb ? JSON.parse(fb) : []);
    } catch (err) {
      console.error('Failed to load user state:', err);
    }
  };

  // Auth Functions
  const register = (name: string, email: string, pass: string, education?: string) => {
    try {
      const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS_REGISTRY);
      const users: UserAccount[] = usersRaw ? JSON.parse(usersRaw) : [DEMO_USER];

      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const uid = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const newUser: UserAccount = {
        uid,
        name,
        email,
        education: education || 'Student',
        timezone: 'Asia/Kolkata',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS_REGISTRY, JSON.stringify(users));

      // Save password hash/secret locally
      const passwordsRaw = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
      const passwords: Record<string, string> = passwordsRaw ? JSON.parse(passwordsRaw) : {};
      passwords[email.toLowerCase()] = pass;
      localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));

      // Save initial user profile
      const newProfile: StudentProfile = {
        uid,
        name,
        email,
        educationLevel: education || 'Student',
        collegeHours: '09:00 - 13:00',
        lunchTime: '13:30',
        dinnerTime: '17:30',
        sleepTime: '23:00',
        wakeTime: '06:30',
        timezone: 'Asia/Kolkata',
        theme: 'sage',
        darkMode: false,
        targetDailyStudyHours: 7.5,
        isDemoUser: false,
      };
      localStorage.setItem(`focusmate_${uid}_profile`, JSON.stringify(newProfile));

      switchUserSession(newUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration failed' };
    }
  };

  const login = (email: string, pass: string) => {
    try {
      if (email.toLowerCase() === DEMO_USER.email.toLowerCase()) {
        switchUserSession(DEMO_USER);
        return { success: true };
      }

      const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS_REGISTRY);
      const users: UserAccount[] = usersRaw ? JSON.parse(usersRaw) : [DEMO_USER];
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return { success: false, error: 'Account not found with this email.' };
      }

      const passwordsRaw = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
      const passwords: Record<string, string> = passwordsRaw ? JSON.parse(passwordsRaw) : {};
      if (passwords[email.toLowerCase()] !== pass) {
        return { success: false, error: 'Incorrect password.' };
      }

      switchUserSession(user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
    }
  };

  const logout = () => {
    switchUserSession(null);
  };

  const resetPassword = (email: string, newPass: string) => {
    try {
      const passwordsRaw = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
      const passwords: Record<string, string> = passwordsRaw ? JSON.parse(passwordsRaw) : {};
      passwords[email.toLowerCase()] = newPass;
      localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Reset failed' };
    }
  };

  const switchToDemo = () => {
    switchUserSession(DEMO_USER);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(getUserKey('profile'), JSON.stringify(profile));
    if (profile.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile, currentUser]);

  useEffect(() => {
    localStorage.setItem(getUserKey('schedule'), JSON.stringify(schedule));
  }, [schedule, currentUser]);

  useEffect(() => {
    localStorage.setItem(getUserKey('tasks'), JSON.stringify(tasks));
  }, [tasks, currentUser]);

  useEffect(() => {
    localStorage.setItem(getUserKey('exams'), JSON.stringify(exams));
  }, [exams, currentUser]);

  useEffect(() => {
    localStorage.setItem(getUserKey('habits'), JSON.stringify(habits));
  }, [habits, currentUser]);

  useEffect(() => {
    localStorage.setItem(getUserKey('chat'), JSON.stringify(chatMessages));
  }, [chatMessages, currentUser]);

  useEffect(() => {
    localStorage.setItem(getUserKey('background_config'), JSON.stringify(backgroundConfig));
  }, [backgroundConfig, currentUser]);

  useEffect(() => {
    localStorage.setItem(getUserKey('custom_backgrounds'), JSON.stringify(customBackgrounds));
  }, [customBackgrounds, currentUser]);

  useEffect(() => {
    localStorage.setItem(getUserKey('favorite_backgrounds'), JSON.stringify(favoriteBackgroundIds));
  }, [favoriteBackgroundIds, currentUser]);

  // Background Customization operations
  const updateBackgroundConfig = (updates: Partial<BackgroundConfig>) => {
    setBackgroundConfig((prev) => {
      const next = { ...prev, ...updates };
      setProfile((p) => ({ ...p, backgroundConfig: next }));
      return next;
    });
  };

  const applyBackground = (newConfig: BackgroundConfig) => {
    setBackgroundConfig(newConfig);
    setProfile((p) => ({ ...p, backgroundConfig: newConfig }));
    triggerConfetti();
  };

  const addCustomBackground = (fileData: {
    title: string;
    dataUrl: string;
    size: number;
    format: 'jpg' | 'jpeg' | 'png' | 'webp';
  }): CustomBackground => {
    const newBg: CustomBackground = {
      id: 'custom-bg-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: fileData.title || 'My Wallpaper',
      url: fileData.dataUrl,
      size: fileData.size,
      format: fileData.format,
      uploadedAt: new Date().toISOString(),
      favorite: false,
    };
    setCustomBackgrounds((prev) => [newBg, ...prev]);
    return newBg;
  };

  const deleteCustomBackground = (id: string) => {
    setCustomBackgrounds((prev) => prev.filter((bg) => bg.id !== id));
    if (backgroundConfig.id === id) {
      applyBackground(DEFAULT_BACKGROUND_CONFIG);
    }
  };

  const toggleFavoriteBackground = (id: string) => {
    setFavoriteBackgroundIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetBackgroundToDefault = () => {
    applyBackground(DEFAULT_BACKGROUND_CONFIG);
  };

  // Profile operations
  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      if (currentUser && (updates.name || updates.educationLevel || updates.avatarUrl)) {
        const updatedUser = {
          ...currentUser,
          name: updates.name || currentUser.name,
          education: updates.educationLevel || currentUser.education,
          profileImage: updates.avatarUrl !== undefined ? updates.avatarUrl : currentUser.profileImage,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      }
      return next;
    });
  };

  const updateProfileAvatar = (dataUrl: string | null) => {
    updateProfile({ avatarUrl: dataUrl || undefined });
    triggerConfetti();
  };

  // Activity Operations
  const addActivity = (act: Omit<Activity, 'id'>) => {
    const newAct: Activity = {
      ...act,
      id: 'act-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      userId: currentUser?.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSchedule((prev) => [...prev, newAct]);
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setSchedule((prev) =>
      prev.map((act) =>
        act.id === id ? { ...act, ...updates, updatedAt: new Date().toISOString() } : act
      )
    );
  };

  const deleteActivity = (id: string) => {
    setSchedule((prev) => prev.filter((act) => act.id !== id));
  };

  const replaceScheduleWithProposed = (newActivities: Activity[]) => {
    const formatted = newActivities.map((act) => ({
      ...act,
      id: act.id || 'act-' + Math.random().toString(36).substring(2, 7),
      userId: currentUser?.uid,
      date: act.date || selectedDate,
      createdAt: act.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setSchedule(formatted);
    triggerConfetti();
  };

  // Task Operations
  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: 'task-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      userId: currentUser?.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = !t.completed;
          if (next) triggerConfetti();
          return { ...t, completed: next, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Exam Operations
  const addExam = (exam: Omit<ExamGoal, 'id'>) => {
    const newExam: ExamGoal = {
      ...exam,
      id: 'exam-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      userId: currentUser?.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setExams((prev) => [...prev, newExam]);
  };

  const updateExam = (id: string, updates: Partial<ExamGoal>) => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      )
    );
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleSyllabusTopic = (examId: string, topicId: string) => {
    setExams((prev) =>
      prev.map((exam) => {
        if (exam.id !== examId) return exam;
        const updatedTopics = exam.syllabusTopics.map((topic) =>
          topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
        );
        return { ...exam, syllabusTopics: updatedTopics, updatedAt: new Date().toISOString() };
      })
    );
  };

  // Habits Operations
  const toggleHabitDate = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const currentVal = !!h.history[dateStr];
        const nextHistory = { ...h.history, [dateStr]: !currentVal };
        const newStreak = !currentVal ? h.streak + 1 : Math.max(0, h.streak - 1);
        if (!currentVal) triggerConfetti();
        return {
          ...h,
          history: nextHistory,
          completionHistory: nextHistory,
          streak: newStreak,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addHabit = (habit: Omit<Habit, 'id' | 'streak'>) => {
    const newH: Habit = {
      ...habit,
      id: 'h-' + Date.now().toString(36),
      userId: currentUser?.uid,
      streak: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newH]);
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  // Chat Operations
  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: 'msg-' + Date.now().toString(36),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  // Data management
  const resetToDemoData = () => {
    setProfile(INITIAL_PROFILE);
    setSchedule(INITIAL_SCHEDULE);
    setTasks(INITIAL_TASKS);
    setExams(INITIAL_EXAMS);
    setHabits(INITIAL_HABITS);
    setBackgroundConfig(DEFAULT_BACKGROUND_CONFIG);
    setCustomBackgrounds([]);
    setFavoriteBackgroundIds([]);
    triggerConfetti();
  };

  const clearAllData = () => {
    setSchedule([]);
    setTasks([]);
    setExams([]);
    setHabits([]);
    setChatMessages([]);
  };

  const exportDataJSON = () => {
    const data = {
      user: currentUser,
      profile,
      schedule,
      tasks,
      exams,
      habits,
      backgroundConfig,
      customBackgrounds,
      favoriteBackgroundIds,
      exportedAt: new Date().toISOString(),
      version: '2.1.0',
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) setProfile(data.profile);
      if (Array.isArray(data.schedule)) setSchedule(data.schedule);
      if (Array.isArray(data.tasks)) setTasks(data.tasks);
      if (Array.isArray(data.exams)) setExams(data.exams);
      if (Array.isArray(data.habits)) setHabits(data.habits);
      if (data.backgroundConfig) setBackgroundConfig(data.backgroundConfig);
      if (Array.isArray(data.customBackgrounds)) setCustomBackgrounds(data.customBackgrounds);
      if (Array.isArray(data.favoriteBackgroundIds)) setFavoriteBackgroundIds(data.favoriteBackgroundIds);
      triggerConfetti();
      return true;
    } catch {
      return false;
    }
  };

  // Notifications
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const notify = (title: string, options?: NotificationOptions) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  };

  // Date-filtered Activities
  const selectedDateActivities = useMemo(() => {
    return schedule.filter((act) => {
      if (act.date && act.date === selectedDate) return true;
      if (act.recurring === 'daily') return true;

      const d = new Date(selectedDate + 'T00:00:00');
      const day = d.getDay();
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });

      if (act.recurring === 'weekdays' && day >= 1 && day <= 5) return true;
      if (act.recurring === 'weekends' && (day === 0 || day === 6)) return true;
      if (act.dayOfWeek === dayName) return true;
      if (act.dayOfWeek === 'Today' && isDateToday(selectedDate)) return true;

      return false;
    });
  }, [schedule, selectedDate, todayDate]);

  // Date-filtered Tasks
  const selectedDateTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === selectedDate || (!t.completed && t.dueDate <= selectedDate));
  }, [tasks, selectedDate]);

  // Conflict Detection
  const parseMin = (t: string) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const conflicts = useMemo(() => {
    const list: {
      id1: string;
      id2: string;
      title1: string;
      title2: string;
      time1: string;
      time2: string;
    }[] = [];
    const acts = selectedDateActivities;

    for (let i = 0; i < acts.length; i++) {
      for (let j = i + 1; j < acts.length; j++) {
        const a1 = acts[i];
        const a2 = acts[j];
        const s1 = parseMin(a1.startTime);
        const e1 = parseMin(a1.endTime);
        const s2 = parseMin(a2.startTime);
        const e2 = parseMin(a2.endTime);

        if (s1 < e2 && s2 < e1) {
          list.push({
            id1: a1.id,
            id2: a2.id,
            title1: a1.title,
            title2: a2.title,
            time1: `${a1.startTime}-${a1.endTime}`,
            time2: `${a2.startTime}-${a2.endTime}`,
          });
        }
      }
    }
    return list;
  }, [selectedDateActivities]);

  // Study Hours Computation
  const selectedDateStudyHours = useMemo(() => {
    return selectedDateActivities
      .filter((a) => !['Meals', 'Sleep', 'Breaks', 'Household Chores', 'Personal'].includes(a.category))
      .reduce((acc, a) => {
        const s = parseMin(a.startTime);
        const e = parseMin(a.endTime);
        const diff = Math.max(0, e - s) / 60;
        return acc + diff;
      }, 0);
  }, [selectedDateActivities]);

  const todayStudyHours = selectedDateStudyHours;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#FF936B', '#58B98A', '#FFA45F', '#FFF0B3'],
      });
    } catch {
      // ignore
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        login,
        register,
        logout,
        resetPassword,
        switchToDemo,
        profile,
        updateProfile,
        updateProfileAvatar,
        backgroundConfig,
        customBackgrounds,
        favoriteBackgroundIds,
        updateBackgroundConfig,
        applyBackground,
        addCustomBackground,
        deleteCustomBackground,
        toggleFavoriteBackground,
        resetBackgroundToDefault,
        isBackgroundGalleryOpen,
        setIsBackgroundGalleryOpen,
        schedule,
        addActivity,
        updateActivity,
        deleteActivity,
        replaceScheduleWithProposed,
        tasks,
        addTask,
        toggleTask,
        updateTask,
        deleteTask,
        exams,
        addExam,
        updateExam,
        deleteExam,
        toggleSyllabusTopic,
        habits,
        toggleHabitDate,
        addHabit,
        deleteHabit,
        pendingProposal,
        setPendingProposal,
        chatMessages,
        addChatMessage,
        clearChat,
        resetToDemoData,
        clearAllData,
        exportDataJSON,
        importDataJSON,
        notificationPermission,
        requestNotificationPermission,
        notify,
        focusMode,
        toggleFocusMode,
        setFocusMode,
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
        conflicts,
        todayStudyHours,
        completedTasksCount,
        pendingTasksCount,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
