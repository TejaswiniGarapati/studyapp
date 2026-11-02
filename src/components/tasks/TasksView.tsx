import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_CONFIG } from '../../data/initialData';
import { Task, ActivityCategory, Priority } from '../../types';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  AlertCircle,
  Bell,
  Search,
  CheckCircle2,
  X,
  Filter,
  Repeat,
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const {
    tasks,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    notificationPermission,
    requestNotificationPermission,
    notify,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ActivityCategory>('Assignments');
  const [formPriority, setFormPriority] = useState<Priority>('High');
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueTime, setFormDueTime] = useState('18:00');
  const [formRecurring, setFormRecurring] = useState<'none' | 'daily' | 'weekly'>('none');
  const [formNotes, setFormNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormCategory('Assignments');
    setFormPriority('High');
    setFormDueDate(todayStr);
    setFormDueTime('18:00');
    setFormRecurring('none');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormCategory(task.category);
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate);
    setFormDueTime(task.dueTime || '18:00');
    setFormRecurring(task.recurring || 'none');
    setFormNotes(task.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formTitle.trim(),
        category: formCategory,
        priority: formPriority,
        dueDate: formDueDate,
        dueTime: formDueTime,
        recurring: formRecurring,
        notes: formNotes.trim(),
      });
    } else {
      addTask({
        title: formTitle.trim(),
        category: formCategory,
        priority: formPriority,
        dueDate: formDueDate,
        dueTime: formDueTime,
        completed: false,
        recurring: formRecurring,
        notes: formNotes.trim(),
      });

      notify('Task Added', {
        body: `${formTitle} due on ${formDueDate}`,
      });
    }

    setIsModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search query
    if (searchQuery.trim()) {
      const matchTitle = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchNotes = (task.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchTitle && !matchNotes) return false;
    }

    // Status filter
    const isOverdue = !task.completed && task.dueDate < todayStr;
    if (activeFilter === 'pending' && task.completed) return false;
    if (activeFilter === 'completed' && !task.completed) return false;
    if (activeFilter === 'overdue' && !isOverdue) return false;

    // Category filter
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;

    // Priority filter
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;

    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const overdueCount = tasks.filter((t) => !t.completed && t.dueDate < todayStr).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 font-heading">
            Tasks & Reminders
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Keep track of homework, project deliverables, GATE revision sets, and chores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notificationPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Browser Alerts</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#FF9466] hover:bg-[#FF8550] rounded-full shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Segmented Buttons */}
          <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-lg overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-[#1f2528] text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeFilter === 'pending'
                  ? 'bg-white dark:bg-[#1f2528] text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeFilter === 'completed'
                  ? 'bg-white dark:bg-[#1f2528] text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setActiveFilter('overdue')}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeFilter === 'overdue'
                  ? 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-rose-600'
              }`}
            >
              Overdue ({overdueCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#5b8266]"
            />
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-200/60 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded px-2 py-0.5 text-stone-800 dark:text-stone-200"
            >
              <option value="all">All Categories</option>
              {Object.keys(CATEGORY_CONFIG).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded px-2 py-0.5 text-stone-800 dark:text-stone-200"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs divide-y divide-stone-200/70 dark:divide-stone-800">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckSquare className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
            <p className="text-xs text-stone-500">No tasks found matching your filter criteria.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 text-xs font-semibold text-[#5b8266] hover:underline"
            >
              + Create a New Task
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.Personal;
            const isOverdue = !task.completed && task.dueDate < todayStr;
            const isDueToday = task.dueDate === todayStr;

            return (
              <div
                key={task.id}
                className={`p-4 transition-colors flex items-start justify-between gap-3 ${
                  task.completed
                    ? 'bg-stone-50/50 dark:bg-stone-900/10 opacity-70'
                    : isOverdue
                    ? 'bg-rose-50/30 dark:bg-rose-950/20'
                    : 'hover:bg-stone-50/70 dark:hover:bg-stone-850/30'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-stone-400 hover:text-[#5b8266] transition-colors shrink-0"
                    title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        task.completed
                          ? 'text-[#5b8266] fill-[#5b8266]/20'
                          : 'text-stone-300 dark:text-stone-600'
                      }`}
                    />
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`text-sm font-semibold truncate ${
                          task.completed
                            ? 'line-through text-stone-400 dark:text-stone-500'
                            : 'text-stone-900 dark:text-stone-100'
                        }`}
                      >
                        {task.title}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${cat.bgLight} ${cat.textLight} ${cat.bgDark} ${cat.textDark}`}
                      >
                        {cat.label}
                      </span>
                      {task.recurring && task.recurring !== 'none' && (
                        <span className="text-[10px] text-stone-500 flex items-center gap-0.5">
                          <Repeat className="w-2.5 h-2.5" />
                          <span className="capitalize">{task.recurring}</span>
                        </span>
                      )}
                    </div>

                    {task.notes && (
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                        {task.notes}
                      </p>
                    )}

                    {/* Metadata line */}
                    <div className="flex items-center gap-3 text-xs text-stone-500 pt-0.5">
                      <span
                        className={`flex items-center gap-1 font-mono tabular-nums ${
                          isOverdue
                            ? 'text-rose-600 dark:text-rose-400 font-semibold'
                            : isDueToday
                            ? 'text-amber-600 dark:text-amber-400 font-medium'
                            : ''
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{task.dueDate}</span>
                        {task.dueTime && <span>· {task.dueTime}</span>}
                        {isOverdue && <span>(Overdue)</span>}
                        {isDueToday && <span>(Today)</span>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      task.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : task.priority === 'High'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded"
                    title="Edit task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161a1c] border border-stone-200 dark:border-stone-800 rounded-xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading">
                {editingTask ? 'Edit Task' : 'New Task & Reminder'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wash clothes and fold clean laundry"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#5b8266]"
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
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                  >
                    {Object.keys(CATEGORY_CONFIG).map((c) => (
                      <option key={c} value={c}>
                        {c}
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
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
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
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Due Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Recurring
                </label>
                <select
                  value={formRecurring}
                  onChange={(e) => setFormRecurring(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                >
                  <option value="none">One-time task</option>
                  <option value="daily">Daily repeat</option>
                  <option value="weekly">Weekly repeat</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Notes or Checklist
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Additional instructions or deliverables"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#5b8266]"
                />
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
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
