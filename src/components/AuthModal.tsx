/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User as UserIcon, Loader2, KeyRound, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mockLogin, mockSignup } from '../api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: User) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onSuccess,
  addToast,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Reset fields on open/tab change
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, initialTab]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'login') {
      if (!email.trim()) {
        addToast('error', 'Please enter your email or login credential');
        return;
      }
      if (password.length < 4) {
        addToast('error', 'Password must be at least 4 characters long');
        return;
      }

      setLoading(true);
      try {
        const user = await mockLogin(email, password);
        addToast('success', `Welcome back, ${user.name}!`);
        onSuccess(user);
        onClose();
      } catch (err: any) {
        addToast('error', err.message || 'An error occurred during authentication.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!name.trim()) {
        addToast('error', 'Please enter your full name');
        return;
      }
      if (!phone.trim()) {
        addToast('error', 'Please enter your phone number');
        return;
      }
      if (email.trim() && !email.includes('@')) {
        addToast('error', 'Please enter a valid email address');
        return;
      }
      if (password.length < 4) {
        addToast('error', 'Password must be at least 4 characters long');
        return;
      }
      if (password !== confirmPassword) {
        addToast('error', 'Passwords do not match');
        return;
      }

      setLoading(true);
      try {
        const user = await mockSignup(name, phone, password, email.trim() || undefined);
        addToast('success', 'Account created successfully! Welcome to our clinic.');
        onSuccess(user);
        onClose();
      } catch (err: any) {
        addToast('error', err.message || 'An error occurred during registration.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={handleOverlayClick}
          id="auth-modal-overlay"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[95vh] flex flex-col"
            ref={modalRef}
            id="auth-modal"
          >
            <div className="h-2 bg-clinic-primary flex-shrink-0" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors z-10"
              id="close-auth-modal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 overflow-y-auto flex-1">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-clinic-primary text-white">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-clinic-primary leading-tight">
                    Dental Clinic Portal
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Secure Patient Portal Access</p>
                </div>
              </div>

              <div className="flex border-b border-slate-100 mb-6" id="auth-modal-tabs">
                <button
                  type="button"
                  onClick={() => !loading && setActiveTab('login')}
                  className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 text-center ${
                    activeTab === 'login'
                      ? 'border-clinic-primary text-clinic-primary'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                  id="tab-login"
                  disabled={loading}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => !loading && setActiveTab('signup')}
                  className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 text-center ${
                    activeTab === 'signup'
                      ? 'border-clinic-primary text-clinic-primary'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                  id="tab-signup"
                  disabled={loading}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" id="auth-form" autoComplete="off">
                {activeTab === 'signup' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="signup-name">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          id="signup-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinic-primary/20 focus:border-clinic-primary text-sm transition-all"
                          disabled={loading}
                          required
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="signup-phone">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          id="signup-phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+251 91 234 5678"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinic-primary/20 focus:border-clinic-primary text-sm transition-all"
                          disabled={loading}
                          required
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="signup-email">
                        Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          id="signup-email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com (optional)"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinic-primary/20 focus:border-clinic-primary text-sm transition-all"
                          disabled={loading}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'login' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="auth-email">
                      Email or Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="auth-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="demo@patient.com or phone"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinic-primary/20 focus:border-clinic-primary text-sm transition-all"
                        disabled={loading}
                        required
                        autoComplete="off"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="auth-password">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      id="auth-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinic-primary/20 focus:border-clinic-primary text-sm transition-all"
                      disabled={loading}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {activeTab === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="signup-confirm-password">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        id="signup-confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinic-primary/20 focus:border-clinic-primary text-sm transition-all"
                        disabled={loading}
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-clinic-primary text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-md shadow-clinic-primary/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  id="auth-submit-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {activeTab === 'login' ? 'Logging in...' : 'Registering...'}
                    </>
                  ) : activeTab === 'login' ? (
                    'Log In'
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-slate-500">
                  {activeTab === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        onClick={() => setActiveTab('signup')}
                        className="text-clinic-accent font-semibold hover:underline bg-transparent border-0 cursor-pointer p-0"
                        id="auth-toggle-to-signup"
                        disabled={loading}
                      >
                        Sign up now
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        onClick={() => setActiveTab('login')}
                        className="text-clinic-accent font-semibold hover:underline bg-transparent border-0 cursor-pointer p-0"
                        id="auth-toggle-to-login"
                        disabled={loading}
                      >
                        Log in here
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};