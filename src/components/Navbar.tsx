/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Smile, Calendar, LayoutDashboard, LogOut, Menu, X, Lock, Sparkles, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentTab: 'home' | 'services' | 'about' | 'contact' | 'book' | 'dashboard' | 'staff';
  onChangeTab: (tab: 'home' | 'services' | 'about' | 'contact' | 'book' | 'dashboard' | 'staff') => void;
  user: User | null;
  onLogout: () => void;
  onOpenAuth: (tab: 'login' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onChangeTab,
  user,
  onLogout,
  onOpenAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: 'home' | 'services' | 'about' | 'contact' | 'book' | 'dashboard' | 'staff') => {
    setMobileMenuOpen(false);
    if (tab === 'dashboard' && !user) {
      // Trigger login modal if clicking restricted link while logged out
      onOpenAuth('login');
      return;
    }
    onChangeTab(tab);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm" id="main-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* Logo Brand */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 text-left focus:outline-none"
              id="brand-logo-btn"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-clinic-primary text-white shadow-md shadow-clinic-primary/10">
                <Smile className="w-6 h-6 text-clinic-accent" />
              </div>
              <div>
                <span className="font-display font-bold text-xl text-clinic-primary tracking-tight block">
                  Dental Clinic
                </span>
                <span className="text-[10px] font-semibold text-clinic-accent tracking-widest uppercase block -mt-1">
                  Care & Trust
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5" id="desktop-nav-links">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'home'
                  ? 'bg-clinic-primary/5 text-clinic-primary font-bold'
                  : 'text-slate-500 hover:text-clinic-primary hover:bg-slate-50'
              }`}
              id="nav-link-home"
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('services')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'services'
                  ? 'bg-clinic-primary/5 text-clinic-primary font-bold'
                  : 'text-slate-500 hover:text-clinic-primary hover:bg-slate-50'
              }`}
              id="nav-link-services"
            >
              Services
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'about'
                  ? 'bg-clinic-primary/5 text-clinic-primary font-bold'
                  : 'text-slate-500 hover:text-clinic-primary hover:bg-slate-50'
              }`}
              id="nav-link-about"
            >
              About
            </button>

            <button
              onClick={() => handleNavClick('staff')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'staff'
                  ? 'bg-clinic-primary/5 text-clinic-primary font-bold'
                  : 'text-slate-500 hover:text-clinic-primary hover:bg-slate-50'
              }`}
              id="nav-link-staff"
            >
              Our Staff
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'contact'
                  ? 'bg-clinic-primary/5 text-clinic-primary font-bold'
                  : 'text-slate-500 hover:text-clinic-primary hover:bg-slate-50'
              }`}
              id="nav-link-contact"
            >
              Contact Us and FAQ
            </button>

            <button
              onClick={() => handleNavClick('book')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'book'
                  ? 'bg-clinic-primary/5 text-clinic-primary font-bold'
                  : 'text-slate-500 hover:text-clinic-primary hover:bg-slate-50'
              }`}
              id="nav-link-book"
            >
              <Calendar className="w-4 h-4" />
              Book
            </button>

            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                user
                  ? currentTab === 'dashboard'
                    ? 'bg-clinic-primary/5 text-clinic-primary font-bold'
                    : 'text-slate-500 hover:text-clinic-primary hover:bg-slate-50'
                  : 'text-slate-300 hover:text-slate-400'
              }`}
              id="nav-link-dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
              {!user && <Lock className="w-3 h-3 text-slate-300 ml-0.5" />}
            </button>
          </div>

          {/* User Session Action Section (Desktop) */}
          <div className="hidden md:flex items-center gap-3" id="desktop-session-actions">
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-150">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Signed in as</span>
                  <span className="text-sm font-bold text-clinic-primary block">{user.name}</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-clinic-accent/10 text-clinic-primary font-bold flex items-center justify-center text-sm">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-rose-600 text-sm font-semibold rounded-xl border border-slate-200 flex items-center gap-2 transition-all cursor-pointer"
                  id="nav-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2.5 text-slate-600 hover:text-clinic-primary hover:bg-slate-50 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                  id="nav-login-btn"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-5 py-2.5 bg-clinic-primary text-white hover:bg-slate-800 text-sm font-semibold rounded-xl transition-all shadow-md shadow-clinic-primary/5 flex items-center gap-1.5 cursor-pointer"
                  id="nav-signup-btn"
                >
                  <Sparkles className="w-4 h-4 text-clinic-accent" />
                  Register Now
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-clinic-primary hover:bg-slate-50 transition-colors"
              id="mobile-menu-toggle"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 shadow-inner" id="mobile-navigation-menu">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all block ${
              currentTab === 'home'
                ? 'bg-clinic-primary/5 text-clinic-primary font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            id="mobile-nav-link-home"
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('services')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all block ${
              currentTab === 'services'
                ? 'bg-clinic-primary/5 text-clinic-primary font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            id="mobile-nav-link-services"
          >
            Services
          </button>

          <button
            onClick={() => handleNavClick('about')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all block ${
              currentTab === 'about'
                ? 'bg-clinic-primary/5 text-clinic-primary font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            id="mobile-nav-link-about"
          >
            About Us
          </button>

          <button
            onClick={() => handleNavClick('staff')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all block ${
              currentTab === 'staff'
                ? 'bg-clinic-primary/5 text-clinic-primary font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            id="mobile-nav-link-staff"
          >
            Our Staff
          </button>

          <button
            onClick={() => handleNavClick('contact')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all block ${
              currentTab === 'contact'
                ? 'bg-clinic-primary/5 text-clinic-primary font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            id="mobile-nav-link-contact"
          >
            Contact Us
          </button>

          <button
            onClick={() => handleNavClick('book')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5 ${
              currentTab === 'book'
                ? 'bg-clinic-primary/5 text-clinic-primary font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            id="mobile-nav-link-book"
          >
            <Calendar className="w-4 h-4" />
            Book Appointment
          </button>

          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5 ${
              user
                ? currentTab === 'dashboard'
                  ? 'bg-clinic-primary/5 text-clinic-primary font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
                : 'text-slate-300'
            }`}
            id="mobile-nav-link-dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
            {!user && <Lock className="w-3.5 h-3.5 ml-auto text-slate-300" />}
          </button>

          {/* Mobile User Controls */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-xl bg-clinic-accent/10 text-clinic-primary font-bold flex items-center justify-center text-sm">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Signed in as</span>
                    <span className="text-sm font-bold text-clinic-primary block">{user.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-rose-100"
                  id="mobile-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full text-center py-3 text-slate-600 hover:bg-slate-50 text-sm font-semibold rounded-xl border border-slate-150"
                  id="mobile-login-btn"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="w-full py-3 bg-clinic-primary text-white hover:bg-slate-800 text-sm font-semibold rounded-xl text-center shadow-md shadow-clinic-primary/5 flex items-center justify-center gap-1.5 cursor-pointer"
                  id="mobile-signup-btn"
                >
                  <Sparkles className="w-4 h-4 text-clinic-accent animate-pulse" />
                  Register Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
