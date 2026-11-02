import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  LogOut,
  RefreshCw,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    login,
    register,
    logout,
    resetPassword,
    switchToDemo,
    triggerConfetti,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [education, setEducation] = useState('B.Tech CSE / Competitive Exam Aspirant');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password.');
        return;
      }
      const res = login(email.trim(), password.trim());
      if (res.success) {
        triggerConfetti();
        onClose();
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } else if (mode === 'register') {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all required fields.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      const res = register(name.trim(), email.trim(), password.trim(), education.trim());
      if (res.success) {
        triggerConfetti();
        onClose();
      } else {
        setError(res.error || 'Registration failed');
      }
    } else if (mode === 'forgot') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter your account email and new password.');
        return;
      }
      const res = resetPassword(email.trim(), password.trim());
      if (res.success) {
        setSuccess('Password updated successfully! You can now log in.');
        setMode('login');
      } else {
        setError(res.error || 'Could not find account with that email.');
      }
    }
  };

  const handleDemoLogin = () => {
    switchToDemo();
    triggerConfetti();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs select-none">
      <div className="bg-white dark:bg-[#1a1f22] border border-stone-200 dark:border-stone-800 rounded-[28px] max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFE7CE] text-[#FF936B] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#303030] dark:text-stone-100 font-heading">
                {currentUser
                  ? 'Account & Profile'
                  : mode === 'login'
                  ? 'Sign In to FocusMate'
                  : mode === 'register'
                  ? 'Create Student Account'
                  : 'Reset Password'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {currentUser
                  ? 'Manage your personal sync and records'
                  : 'Your goals. Your time. Your balance.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If Already Logged In: Show Account Summary */}
        {currentUser ? (
          <div className="py-5 space-y-4">
            <div className="flex items-center gap-3.5 p-3.5 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200/80 dark:border-stone-700">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#FFB9B5] to-[#FFD6C2] flex items-center justify-center font-bold text-white text-lg">
                {currentUser.profileImage ? (
                  <img
                    src={currentUser.profileImage}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[#303030] dark:text-stone-100 truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                <p className="text-[10px] text-stone-400 truncate mt-0.5">
                  {currentUser.education || 'Student Account'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  logout();
                  setMode('login');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-full text-xs font-bold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of Account</span>
              </button>

              <button
                onClick={handleDemoLogin}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 rounded-full text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#FF936B]" />
                <span>Switch to Demo Account (Taly)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form for Login / Register / Forgot Password */
          <form onSubmit={handleSubmit} className="py-4 space-y-3.5 text-xs">
            {error && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#FF936B]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#FF936B]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-stone-700 dark:text-stone-300">
                  {mode === 'forgot' ? 'New Password *' : 'Password *'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-[11px] text-[#FF936B] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#FF936B]"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Academic Focus / Degree
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. B.Tech Computer Science / GATE 2027"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#FF936B]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#FF9466] hover:bg-[#FF8550] text-white font-bold rounded-full shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <span>
                {mode === 'login'
                  ? 'Sign In'
                  : mode === 'register'
                  ? 'Create My Account'
                  : 'Save New Password'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Login Option */}
            <div className="pt-2">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
                <span className="flex-shrink mx-2 text-[10px] text-stone-400 font-medium">OR</span>
                <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2 px-3 bg-[#FFF5ED] hover:bg-[#FFE7CE] border border-[#FFD6C2] text-[#FF936B] font-bold rounded-full text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore with Demo Student Account (Taly)</span>
              </button>
            </div>

            {/* Switch between Login and Register */}
            <div className="text-center pt-2">
              {mode === 'login' ? (
                <p className="text-xs text-stone-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="font-bold text-[#FF936B] hover:underline"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p className="text-xs text-stone-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="font-bold text-[#FF936B] hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
