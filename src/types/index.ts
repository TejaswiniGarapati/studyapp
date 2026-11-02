export type ActivityCategory =
  | 'College'
  | 'GATE'
  | 'Placements'
  | 'DSA'
  | 'Java'
  | 'Python'
  | 'Coding'
  | 'Networking'
  | 'System Administration'
  | 'Exams'
  | 'Assignments'
  | 'Household Chores'
  | 'Meals'
  | 'Sleep'
  | 'Breaks'
  | 'Personal';

export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'
  | 'Today';

export interface UserAccount {
  uid: string;
  name: string;
  email: string;
  profileImage?: string;
  education?: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  userId?: string;
  title: string;
  category: ActivityCategory;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  date?: string;     // YYYY-MM-DD
  dayOfWeek?: DayOfWeek;
  priority: Priority;
  notes?: string;
  recurring?: 'once' | 'daily' | 'weekdays' | 'weekends';
  isRecurring?: boolean;
  isFixed?: boolean;
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CalendarEvent = Activity;

export interface Task {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  category: ActivityCategory;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM or 8:00 AM
  completed: boolean;
  recurring?: 'none' | 'daily' | 'weekly';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SyllabusTopic {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

export interface ExamGoal {
  id: string;
  userId?: string;
  name: string;
  title?: string;
  description?: string;
  category: 'GATE' | 'University' | 'Placements' | 'Competitions' | 'Custom';
  targetDate: string; // YYYY-MM-DD
  targetScoreOrRank?: string;
  notes?: string;
  progress?: number;
  status?: 'not_started' | 'in_progress' | 'completed';
  syllabusTopics: SyllabusTopic[];
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Habit {
  id: string;
  userId?: string;
  title: string;
  category: ActivityCategory;
  iconName: string;
  targetDaysPerWeek: number;
  frequency?: string;
  streak: number;
  history: Record<string, boolean>; // 'YYYY-MM-DD': boolean
  completionHistory?: Record<string, boolean>;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudySession {
  id: string;
  userId?: string;
  subject: string;
  duration: number; // minutes
  date: string;     // YYYY-MM-DD
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reminder {
  id: string;
  userId?: string;
  title: string;
  scheduledTime: string; // ISO or HH:MM
  status: 'pending' | 'triggered' | 'dismissed';
  createdAt?: string;
  updatedAt?: string;
}

export type BackgroundCategory =
  | 'All'
  | 'Nature & Landscapes'
  | 'Sky & Sunset'
  | 'Aesthetic Study'
  | 'Floral & Botanical'
  | 'Abstract & Pastel';

export interface BackgroundOption {
  id: string;
  title: string;
  category: Exclude<BackgroundCategory, 'All'>;
  url: string;
  thumbnailUrl: string;
  fallbackGradient: string;
  author?: string;
  isOfficial?: boolean;
  tags: string[];
}

export interface CustomBackground {
  id: string;
  title: string;
  url: string; // base64 or object URL
  size: number; // in bytes
  format: 'jpg' | 'jpeg' | 'png' | 'webp';
  uploadedAt: string;
  favorite?: boolean;
}

export interface BackgroundConfig {
  type: 'default' | 'official' | 'explore' | 'custom';
  id: string;
  title?: string;
  url?: string;
  fallbackGradient?: string;
  brightness: number; // 50 to 150 (percentage)
  blur: number; // 0 to 20 (px)
  overlayOpacity: number; // 0 to 80 (percentage)
  overlayTint: 'none' | 'white' | 'dark' | 'warm';
  imagePosition: 'center' | 'top' | 'bottom';
  scaling: 'cover' | 'contain';
}

export interface StudentProfile {
  uid?: string;
  name: string;
  email?: string;
  avatarUrl?: string; // custom base64 or photo URL
  educationLevel: string;
  collegeHours: string; // e.g. "09:00 - 13:00"
  lunchTime: string;    // e.g. "13:30"
  dinnerTime: string;   // e.g. "17:30"
  sleepTime: string;    // e.g. "23:00"
  wakeTime: string;     // e.g. "06:30"
  timezone: string;     // e.g. "Asia/Kolkata"
  theme: 'sage' | 'ivory' | 'lavender' | 'emerald' | 'dusk';
  darkMode: boolean;
  targetDailyStudyHours: number; // e.g. 7.5
  isDemoUser?: boolean;
  backgroundConfig?: BackgroundConfig;
}

export interface AIProposal {
  summary: string;
  movedActivities: string[];
  proposedSchedule: Activity[];
  advice: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'apply_plan';
    plan: AIProposal;
  };
}

export type NavTab =
  | 'overview'
  | 'dashboard'
  | 'timetable'
  | 'schedule'
  | 'tasks'
  | 'ai-planner'
  | 'exams'
  | 'assistant'
  | 'habits'
  | 'analytics'
  | 'settings';
