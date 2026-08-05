/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Homepage } from './components/Homepage';
import { BookingPage } from './components/BookingPage';
import { DashboardPage } from './components/DashboardPage';
import { ServicesPage } from './components/ServicesPage';
import { AboutPage } from './components/AboutPage';
import { StaffPage } from './components/StaffPage';
import { ContactPage } from './components/ContactPage';
import { AuthModal } from './components/AuthModal';
import { ToastContainer, Toast } from './components/Toast';
import { User } from './types';
import { Smile, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

const SESSION_USER_KEY = 'dental_portal_session_user';

export default function App() {
  const [currentTab, setCurrentTabState] = useState<'home' | 'services' | 'about' | 'contact' | 'book' | 'dashboard' | 'staff'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [selectedService, setSelectedService] = useState<string>('Preventative Cleaning & Exam');

  const setCurrentTab = (tab: any) => {
    setCurrentTabState(tab);
    let path = '/';
    if (tab !== 'home') path = `/${tab}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  const handleNavigateToBook = (serviceTitle?: string) => {
    if (serviceTitle) setSelectedService(serviceTitle);
    setCurrentTab('book');
  };

  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [pendingBookSlot, setPendingBookSlot] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handlePathChange = () => {
      const path = window.location.pathname;
      if (path === '/') setCurrentTabState('home');
      else {
        const cleaned = path.replace('/', '');
        if (['services', 'about', 'contact', 'book', 'dashboard', 'staff'].includes(cleaned)) {
          setCurrentTabState(cleaned as any);
        } else setCurrentTabState('home');
      }
    };
    handlePathChange();
    window.addEventListener('popstate', handlePathChange);
    return () => window.removeEventListener('popstate', handlePathChange);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem(SESSION_USER_KEY);
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { localStorage.removeItem(SESSION_USER_KEY); }
    }
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(loggedInUser));
    if (currentTab === 'home' && !pendingBookSlot) setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_USER_KEY);
    setPendingBookSlot(null);
    setCurrentTab('home');
    addToast('success', 'You have been successfully logged out. Have a great day!');
  };

  const handleOpenAuth = (tab: 'login' | 'signup', pendingSlot?: string) => {
    setAuthTab(tab);
    if (pendingSlot) setPendingBookSlot(pendingSlot);
    setAuthOpen(true);
  };

  const handleBookingSuccess = () => {
    setTimeout(() => setCurrentTab('dashboard'), 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* ❌ Announcement banner removed */}
      
      <Navbar
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={(tab) => handleOpenAuth(tab)}
      />

      <main className="flex-grow pt-4">
        {currentTab === 'home' && (
          <Homepage
            onNavigateToBook={() => handleNavigateToBook()}
            onNavigateToServices={() => setCurrentTab('services')}
            onNavigateToStaff={() => setCurrentTab('staff')}
          />
        )}
        {currentTab === 'services' && <ServicesPage onNavigateToBook={handleNavigateToBook} />}
        {currentTab === 'about' && <AboutPage onNavigateToBook={() => handleNavigateToBook()} />}
        {currentTab === 'staff' && <StaffPage onNavigateToBook={() => handleNavigateToBook()} />}
        {currentTab === 'contact' && <ContactPage onNavigateToBook={() => handleNavigateToBook()} addToast={addToast} />}
        {currentTab === 'book' && (
          <BookingPage
            user={user}
            onOpenAuth={handleOpenAuth}
            addToast={addToast}
            pendingBookSlot={pendingBookSlot}
            setPendingBookSlot={setPendingBookSlot}
            onBookingSuccess={handleBookingSuccess}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
          />
        )}
        {currentTab === 'dashboard' && (
          <DashboardPage
            user={user}
            onOpenAuth={(tab) => handleOpenAuth(tab)}
            onLogout={handleLogout}
            onNavigateToBook={() => handleNavigateToBook()}
            addToast={addToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-clinic-primary to-slate-800 text-white p-6 sm:p-8 shadow-md relative overflow-hidden" id="clinic-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Branding */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white">
                  <Smile className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-lg text-white">Dental Clinic</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                State-of-the-art restorative, aesthetic, and preventive healthcare services delivered with compassionate care.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white/70 hover:text-white flex items-center justify-center transition-all">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V2h-3a5 5 0 0 0-5 5v1z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white/70 hover:text-white flex items-center justify-center transition-all">
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://telegram.org" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white/70 hover:text-white flex items-center justify-center transition-all">
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21.198 2.43a2.242 2.242 0 0 0-2.235.078L1.93 11.025a1.867 1.867 0 0 0-.102 3.327l5.053 2.112 1.82 5.46a1.121 1.121 0 0 0 1.953.255l3.14-3.837 5.101 3.738a1.867 1.867 0 0 0 2.924-1.12l3.411-16.03a1.867 1.867 0 0 0-2.032-2.522zM7.5 15.5l9.5-8.5-6.5 9.5-3 1z"/></svg>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white/70 hover:text-white flex items-center justify-center transition-all">
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white/80 uppercase tracking-widest">Office Hours</h4>
              <ul className="text-xs text-white/70 space-y-2">
                <li>Monday - Friday: 8:00 AM - 6:00 PM</li>
                <li>Saturday: 9:00 AM - 3:00 PM</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white/80 uppercase tracking-widest">Quick Links</h4>
              <ul className="text-xs text-white/70 space-y-2">
                <li><button onClick={() => setCurrentTab('home')} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-0 text-left">Home Page</button></li>
                <li><button onClick={() => setCurrentTab('services')} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-0 text-left">Services & Treatments</button></li>
                <li><button onClick={() => setCurrentTab('about')} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-0 text-left">About Our Clinic</button></li>
                <li><button onClick={() => setCurrentTab('staff')} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-0 text-left">Meet Our Team</button></li>
                <li><button onClick={() => setCurrentTab('contact')} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-0 text-left">Contact & Visit Us</button></li>
                <li><button onClick={() => setCurrentTab('book')} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-0 text-left">Schedule Appointment</button></li>
                <li><button onClick={() => { if (user) setCurrentTab('dashboard'); else handleOpenAuth('login'); }} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-0 text-left">Patient Area</button></li>
              </ul>
            </div>

            {/* Contacts */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white/80 uppercase tracking-widest">Inquiries</h4>
              <ul className="text-xs text-white/70 space-y-2.5">
                <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-white/80 flex-shrink-0" /> +251 911223344</li>
                <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-white/80 flex-shrink-0" /> care@dentalclinic.com</li>
                <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-white/80 flex-shrink-0" /> Bole, around Edna Mall</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 mt-6 border-t border-white/10 text-center">
            <p className="text-xs text-white/60">&copy; {new Date().getFullYear()} Dental Clinic Health Centers. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authOpen}
        initialTab={authTab}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleLoginSuccess}
        addToast={addToast}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}