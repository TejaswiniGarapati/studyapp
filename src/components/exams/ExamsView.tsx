import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamGoal, SyllabusTopic } from '../../types';
import {
  GraduationCap,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  Edit2,
  X,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ExamsView: React.FC = () => {
  const { exams, addExam, updateExam, deleteExam, toggleSyllabusTopic, triggerConfetti } = useApp();

  const [expandedExamId, setExpandedExamId] = useState<string | null>(exams[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamGoal | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ExamGoal['category']>('GATE');
  const [formTargetDate, setFormTargetDate] = useState('2027-02-06');
  const [formTargetScore, setFormTargetScore] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formTopicsText, setFormTopicsText] = useState('');

  // Live countdown timer state (ticks every minute)
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const calculateCountdown = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, passed: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, passed: false };
  };

  const handleOpenAdd = () => {
    setEditingExam(null);
    setFormName('');
    setFormCategory('GATE');
    setFormTargetDate('2027-02-06');
    setFormTargetScore('AIR < 100');
    setFormNotes('');
    setFormTopicsText('Linear Algebra\nCalculus\nAlgorithms\nOperating Systems\nDBMS');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: ExamGoal) => {
    setEditingExam(exam);
    setFormName(exam.name);
    setFormCategory(exam.category);
    setFormTargetDate(exam.targetDate);
    setFormTargetScore(exam.targetScoreOrRank || '');
    setFormNotes(exam.notes || '');
    setFormTopicsText(exam.syllabusTopics.map((t) => t.title).join('\n'));
    setIsModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const topics: SyllabusTopic[] = formTopicsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((t, idx) => ({
        id: `topic-${Date.now()}-${idx}`,
        title: t,
        completed: false,
      }));

    if (editingExam) {
      updateExam(editingExam.id, {
        name: formName.trim(),
        category: formCategory,
        targetDate: formTargetDate,
        targetScoreOrRank: formTargetScore.trim(),
        notes: formNotes.trim(),
        syllabusTopics:
          topics.length > 0
            ? topics
            : editingExam.syllabusTopics,
      });
    } else {
      addExam({
        name: formName.trim(),
        category: formCategory,
        targetDate: formTargetDate,
        targetScoreOrRank: formTargetScore.trim(),
        notes: formNotes.trim(),
        syllabusTopics: topics,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 font-heading">
            Exams & Goals Tracker
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Precision preparation for GATE 2027, University Exams, Placements, and Coding Competitions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#FF9466] hover:bg-[#FF8550] rounded-full shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Goal / Exam</span>
        </button>
      </div>

      {/* Main Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {exams.map((exam) => {
          const cd = calculateCountdown(exam.targetDate);
          const doneTopics = exam.syllabusTopics.filter((t) => t.completed).length;
          const totalTopics = exam.syllabusTopics.length;
          const pct = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0;
          const isExpanded = expandedExamId === exam.id;

          return (
            <div
              key={exam.id}
              className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-shadow hover:shadow-sm"
            >
              <div>
                {/* Header Strip */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400">
                      {exam.category}
                    </span>
                    <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading mt-0.5">
                      {exam.name}
                    </h2>
                    {exam.targetScoreOrRank && (
                      <p className="text-xs font-medium text-[#5b8266] dark:text-[#88b695] mt-0.5">
                        Target: {exam.targetScoreOrRank}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(exam)}
                      className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Countdown Timer Block */}
                <div className="mt-4 p-3 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200/70 dark:border-stone-800">
                  <div className="text-[10px] text-stone-500 flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#5b8266]" />
                      <span>Countdown to {exam.targetDate}</span>
                    </span>
                    <span className="font-mono">{cd.passed ? 'Passed' : 'Active'}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white dark:bg-stone-800 rounded-lg border border-stone-200/60 dark:border-stone-700">
                      <div className="text-xl font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100">
                        {cd.days}
                      </div>
                      <div className="text-[10px] text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                        Days
                      </div>
                    </div>
                    <div className="p-2 bg-white dark:bg-stone-800 rounded-lg border border-stone-200/60 dark:border-stone-700">
                      <div className="text-xl font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100">
                        {cd.hours}
                      </div>
                      <div className="text-[10px] text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                        Hours
                      </div>
                    </div>
                    <div className="p-2 bg-white dark:bg-stone-800 rounded-lg border border-stone-200/60 dark:border-stone-700">
                      <div className="text-xl font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100">
                        {cd.minutes}
                      </div>
                      <div className="text-[10px] text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                        Mins
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
                    <span>Syllabus Mastered</span>
                    <span className="font-mono tabular-nums font-semibold text-stone-900 dark:text-stone-100">
                      {pct}% ({doneTopics}/{totalTopics} topics)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#5b8266] h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {exam.notes && (
                  <p className="mt-3 text-xs text-stone-500 leading-relaxed italic">
                    "{exam.notes}"
                  </p>
                )}
              </div>

              {/* Syllabus Topic Checklist Toggle */}
              <div className="mt-4 pt-3 border-t border-stone-200/80 dark:border-stone-800">
                <button
                  onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-[#5b8266] dark:text-[#88b695] hover:underline"
                >
                  <span>
                    {isExpanded ? 'Hide Syllabus Breakdown' : `View Syllabus (${totalTopics} topics)`}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="mt-3 space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {exam.syllabusTopics.length === 0 ? (
                      <p className="text-xs text-stone-400 py-2">No syllabus topics added yet.</p>
                    ) : (
                      exam.syllabusTopics.map((topic) => (
                        <div
                          key={topic.id}
                          onClick={() => {
                            toggleSyllabusTopic(exam.id, topic.id);
                            if (!topic.completed) triggerConfetti();
                          }}
                          className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                            topic.completed
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-stone-700 dark:text-stone-300'
                              : 'bg-stone-50/40 dark:bg-stone-900/20 border-stone-200/60 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 ${
                                topic.completed
                                  ? 'text-[#5b8266] fill-[#5b8266]/20'
                                  : 'text-stone-300 dark:text-stone-600'
                              }`}
                            />
                            <span className={topic.completed ? 'line-through text-stone-400' : ''}>
                              {topic.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-stone-600 dark:text-stone-400">
                            {topic.completed ? 'Mastered' : 'Pending'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161a1c] border border-stone-200 dark:border-stone-800 rounded-xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading">
                {editingExam ? 'Edit Goal / Exam' : 'Add Goal / Exam'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Examination / Goal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GATE 2027 Computer Science"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
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
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                  >
                    <option value="GATE">GATE 2027</option>
                    <option value="University">University Exams</option>
                    <option value="Placements">Placements</option>
                    <option value="Competitions">Coding Competitions</option>
                    <option value="Custom">Custom Milestone</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Target Score / Rank / Aim
                </label>
                <input
                  type="text"
                  placeholder="e.g. AIR < 100, 9.0+ SGPA, SDE Offer"
                  value={formTargetScore}
                  onChange={(e) => setFormTargetScore(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#5b8266]"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Syllabus Topics (One per line)
                </label>
                <textarea
                  rows={4}
                  value={formTopicsText}
                  onChange={(e) => setFormTopicsText(e.target.value)}
                  placeholder="Engineering Mathematics&#10;Data Structures & Algorithms&#10;Theory of Computation"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#5b8266]"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Preparation Strategy / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daily 90 mins revision + solve 10 years of PYQs"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
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
                  {editingExam ? 'Save Changes' : 'Create Exam Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
