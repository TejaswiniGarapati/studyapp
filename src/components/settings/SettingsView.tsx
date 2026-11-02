import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuthModal } from '../auth/AuthModal';
import {
  User,
  Clock,
  Moon,
  Sun,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  Palette,
  Globe,
  Bell,
  Sparkles,
  LogOut,
  KeyRound,
  Image as ImageIcon,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    currentUser,
    logout,
    resetToDemoData,
    clearAllData,
    exportDataJSON,
    importDataJSON,
    notificationPermission,
    requestNotificationPermission,
    triggerConfetti,
    backgroundConfig,
    setIsBackgroundGalleryOpen,
    resetBackgroundToDefault,
  } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    triggerConfetti();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusmate_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const success = importDataJSON(importText.trim());
    if (success) {
      setImportStatus('Data successfully restored!');
      setImportText('');
    } else {
      setImportStatus('Invalid JSON format. Please verify and try again.');
    }
  };

  const isDemo = !currentUser || currentUser.uid === 'demo-taly';

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 font-heading">
            Student Profile & Preferences
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Configure your academic commitments, protected meal times, sleep requirements, and themes.
          </p>
        </div>

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FFF5ED] hover:bg-[#FFE7CE] border border-[#FFD6C2] text-[#FF936B] rounded-full text-xs font-bold transition-colors self-start sm:self-center"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>{isDemo ? 'Sign In / Register' : 'Manage Account'}</span>
        </button>
      </div>

      {/* Account Info Pill */}
      <div className="p-4 bg-gradient-to-r from-[#FFF5ED] via-white to-[#FFF5ED] dark:from-[#221c19] dark:to-[#171a1c] border border-[#FFD6C2] dark:border-stone-800 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFD6C2] text-[#FF936B] flex items-center justify-center font-bold font-heading">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 dark:text-stone-100">{profile.name}</span>
              {isDemo ? (
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Demo Mode
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Registered Account
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500">{profile.email || 'Local student profile'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isDemo && (
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 rounded-full text-xs font-semibold"
            >
              <LogOut className="w-3 h-3" />
              <span>Log Out</span>
            </button>
          )}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#FF9466] hover:bg-[#FF8550] text-white rounded-full text-xs font-bold"
          >
            {isDemo ? 'Create Account' : 'Switch Account'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <Check className="w-4 h-4 text-[#5b8266]" />
          <span>Profile and fixed schedule times updated successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Avatar Card */}
        <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
            <User className="w-4 h-4 text-[#FF936B]" />
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Profile Photo & Identity
            </h2>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#FFD6C2] dark:ring-[#FF936B]/30 bg-gradient-to-br from-[#FFB9B5] to-[#FFD6C2] shadow-sm flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white font-heading">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF936B] hover:bg-[#ff8454] text-white text-xs font-semibold rounded-full shadow-xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Custom Photo</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 4 * 1024 * 1024) {
                        alert('Image must be under 4MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          updateProfile({ avatarUrl: reader.result });
                          triggerConfetti();
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                {profile.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => updateProfile({ avatarUrl: undefined })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 hover:text-rose-600 text-stone-600 dark:text-stone-300 text-xs font-medium rounded-full transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-stone-500">
                Supports JPG, PNG, or WEBP up to 4MB. The photo appears in your top navigation and dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
            <User className="w-4 h-4 text-[#5b8266]" />
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#5b8266]"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Academic Program / Targets
              </label>
              <input
                type="text"
                value={profile.educationLevel}
                onChange={(e) => updateProfile({ educationLevel: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#5b8266]"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Timezone (Default: Asia/Kolkata)
              </label>
              <input
                type="text"
                value={profile.timezone}
                onChange={(e) => updateProfile({ timezone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#5b8266]"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Target Daily Study Hours: {profile.targetDailyStudyHours} hours
              </label>
              <input
                type="number"
                min={2}
                max={14}
                step={0.5}
                value={profile.targetDailyStudyHours}
                onChange={(e) =>
                  updateProfile({ targetDailyStudyHours: parseFloat(e.target.value) || 7.5 })
                }
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#5b8266]"
              />
            </div>
          </div>
        </div>

        {/* Fixed Non-Negotiable Hours */}
        <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
            <Clock className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Fixed & Protected Hours (Meals, Sleep, College)
            </h2>
          </div>

          <p className="text-xs text-stone-500">
            These slots are treated as immutable anchors by the <strong>Gemini AI Planner</strong>. AI will reschedule study and chores around these slots, never encroaching on them.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                College Hours
              </label>
              <input
                type="text"
                value={profile.collegeHours}
                onChange={(e) => updateProfile({ collegeHours: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg font-mono text-stone-900 dark:text-stone-100"
              />
              <span className="text-[10px] text-stone-400">e.g. 09:00 - 13:00</span>
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Lunch Time (Default: 1:30 PM)
              </label>
              <input
                type="time"
                value={profile.lunchTime}
                onChange={(e) => updateProfile({ lunchTime: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg font-mono text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Dinner Time (Default: 5:30 PM)
              </label>
              <input
                type="time"
                value={profile.dinnerTime}
                onChange={(e) => updateProfile({ dinnerTime: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg font-mono text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Sleep Bedtime & Wakeup
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={profile.sleepTime}
                  onChange={(e) => updateProfile({ sleepTime: e.target.value })}
                  className="w-1/2 px-2 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg font-mono text-stone-900 dark:text-stone-100"
                />
                <input
                  type="time"
                  value={profile.wakeTime}
                  onChange={(e) => updateProfile({ wakeTime: e.target.value })}
                  className="w-1/2 px-2 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg font-mono text-stone-900 dark:text-stone-100"
                />
              </div>
              <span className="text-[10px] text-stone-400">Sleep: 23:00 to 06:30</span>
            </div>
          </div>
        </div>

        {/* Theme & Notifications */}
        <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
            <Palette className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Visual Appearance & Alerts
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <label className="block font-medium text-stone-700 dark:text-stone-300">
                Dark Mode
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateProfile({ darkMode: false })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
                    !profile.darkMode
                      ? 'border-[#5b8266] bg-[#eef5f0] text-[#2b4433]'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Warm Ivory (Light)</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateProfile({ darkMode: true })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
                    profile.darkMode
                      ? 'border-[#5b8266] bg-[#1f2d24] text-[#a8d5b5]'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Moon className="w-4 h-4 text-stone-300" />
                  <span>Night Slate (Dark)</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-stone-700 dark:text-stone-300">
                Browser Reminders
              </label>
              <div className="flex items-center gap-3">
                <span className="text-stone-500 font-mono text-[11px]">
                  Status: {notificationPermission}
                </span>
                {notificationPermission !== 'granted' && (
                  <button
                    type="button"
                    onClick={requestNotificationPermission}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-lg hover:bg-stone-200"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Request Permission</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Appearance → Background Gallery */}
        <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#FF936B]" />
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Appearance → Background Gallery & Personalization
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFEDE3] text-[#FF936B] border border-[#FFD6C2]">
              3 Tabs • 30+ Styles
            </span>
          </div>

          <p className="text-xs text-stone-500">
            Customize the ambient atmosphere of your FocusMate workspace. Choose between our official FocusMate collection, explore aesthetic photography, or upload your personal study wallpapers.
          </p>

          {/* Current Active Background Preview Card */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className="w-20 h-14 rounded-xl shadow-xs border border-white/80 dark:border-stone-700 relative overflow-hidden flex-shrink-0 bg-cover bg-center"
                style={{
                  background:
                    backgroundConfig.type === 'default'
                      ? backgroundConfig.fallbackGradient
                      : backgroundConfig.url
                      ? `url(${backgroundConfig.url})`
                      : backgroundConfig.fallbackGradient,
                  backgroundPosition: backgroundConfig.imagePosition,
                  backgroundSize: backgroundConfig.scaling,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    filter: `brightness(${backgroundConfig.brightness}%) blur(${backgroundConfig.blur}px)`,
                  }}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 font-heading">
                    {backgroundConfig.title || 'FocusMate Warm Sunlight (Default)'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-md uppercase font-semibold">
                    {backgroundConfig.type}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Brightness: {backgroundConfig.brightness}% • Blur: {backgroundConfig.blur}px • Overlay:{' '}
                  {backgroundConfig.overlayOpacity}% ({backgroundConfig.overlayTint})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {backgroundConfig.type !== 'default' && (
                <button
                  type="button"
                  onClick={resetBackgroundToDefault}
                  className="px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-medium hover:bg-stone-100 transition-colors"
                >
                  Reset Default
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsBackgroundGalleryOpen(true)}
                className="px-4 py-1.5 rounded-full bg-[#FF936B] hover:bg-[#FF8550] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Open Background Gallery</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#FF9466] hover:bg-[#FF8550] text-white text-xs font-bold rounded-full shadow-xs transition-colors"
          >
            Save All Preferences
          </button>
        </div>
      </form>

      {/* Backup & Demo Data Management */}
      <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 pb-2 border-b border-stone-200/80 dark:border-stone-800">
          Data Management & Demo State
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center justify-center gap-2 p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-100 text-stone-800 dark:text-stone-200 font-medium"
          >
            <Download className="w-4 h-4 text-[#5b8266]" />
            <span>Export Backup (JSON)</span>
          </button>

          <button
            onClick={resetToDemoData}
            className="flex items-center justify-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg hover:bg-amber-100 text-amber-800 dark:text-amber-200 font-medium"
          >
            <RefreshCw className="w-4 h-4 text-amber-600" />
            <span>Reset to Demo Student</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Clear all schedule activities, tasks, and exams?')) {
                clearAllData();
              }
            }}
            className="flex items-center justify-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg hover:bg-rose-100 text-rose-800 dark:text-rose-200 font-medium"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Clear All Data</span>
          </button>
        </div>

        {/* Restore from JSON textarea */}
        <div className="pt-2 text-xs space-y-2">
          <label className="block font-medium text-stone-700 dark:text-stone-300">
            Restore / Import JSON Data:
          </label>
          <div className="flex gap-2">
            <textarea
              rows={2}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste exported FocusMate JSON backup here..."
              className="flex-1 p-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg font-mono text-[11px] text-stone-800 dark:text-stone-200"
            />
            <button
              onClick={handleImportSubmit}
              disabled={!importText.trim()}
              className="px-4 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-40 shrink-0 font-medium text-xs"
            >
              Restore
            </button>
          </div>
          {importStatus && (
            <p className="text-[11px] text-[#5b8266] dark:text-[#88b695]">{importStatus}</p>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
