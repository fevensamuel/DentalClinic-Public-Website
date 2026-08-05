/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Calendar,
  Clock,
  LogOut,
  Lock,
  PlusCircle,
  FileSpreadsheet,
  Activity,
  Award,
  Trash2,
  Loader2,
  ArrowRight,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'motion/react';
import { mockGetAppointments, cancelAppointment } from '../api';
import { User, Appointment } from '../types';

interface DashboardPageProps {
  user: User | null;
  onOpenAuth: (tab: 'login' | 'signup') => void;
  onLogout: () => void;
  onNavigateToBook: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onNavigateToBook,
  addToast,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await mockGetAppointments(user.id);
      setAppointments(data);
    } catch (err: any) {
      addToast('error', 'Failed to retrieve appointment history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleCancel = async (appId: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancelingId(appId);
    try {
      const ok = await cancelAppointment(appId);
      if (ok) {
        addToast('success', 'Appointment successfully canceled.');
        fetchAppointments();
      } else {
        addToast('error', 'Unable to cancel appointment.');
      }
    } catch (e: any) {
      addToast('error', e.message || 'Error canceling appointment.');
    } finally {
      setCancelingId(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6" id="dashboard-logged-out-guard">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl space-y-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-clinic-primary/5 text-clinic-primary flex items-center justify-center mx-auto border border-slate-100 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-2xl text-clinic-primary tracking-tight">
              Access Restricted
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your patient dashboard contains sensitive healthcare history, future appointments, and profile preferences. Please log in or register to view your dashboard.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="flex-1 px-5 py-3 bg-clinic-primary text-white font-semibold text-sm rounded-xl hover:bg-slate-800 transition-colors shadow-md cursor-pointer"
              id="guard-login-btn"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="flex-1 px-5 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm rounded-xl transition-all hover:bg-slate-50 cursor-pointer"
              id="guard-signup-btn"
            >
              Create Account
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Table A: Confirmed / Arrived / Completed
  const confirmedAppointments = appointments.filter(
    app => app.status === 'Confirmed' || app.status === 'Arrived' || app.status === 'Completed'
  );
  // Table B: Pending (doctor-assigned, awaiting confirmation)
  const pendingAppointments = appointments.filter(app => app.status === 'Pending');
  // Table C: Canceled / No Show
  const historyAppointments = appointments.filter(app => app.status === 'Canceled' || app.status === 'No Show');

  const nextAppointment = confirmedAppointments.length > 0 ? confirmedAppointments[0] : null;
  const patientIdFormatted = `PT-2026-00${user.id}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10" id="dashboard-page-container">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-8">
        <div className="space-y-1">
          <span className="text-xs font-bold text-clinic-accent uppercase tracking-wider block">Patient Area</span>
          <h1 className="font-display font-extrabold text-3xl text-clinic-primary tracking-tight">
            Patient Dashboard
          </h1>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-rose-600 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
          id="dashboard-logout-action-btn"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log Out
        </button>
      </div>

      {/* Arrival Policy Banner */}
      <div className="bg-amber-50 border border-amber-200 p-4 sm:p-5 rounded-3xl flex items-start gap-3.5 text-amber-800 text-xs sm:text-sm shadow-sm" id="auto-cancel-policy-banner">
        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-900 block">Clinic Arrival & No-Show Policy:</span>
          <p className="leading-relaxed">
            Please note that to respect all patients' and clinicians' schedules, <strong className="font-semibold text-amber-950">any appointment that has not checked in will be automatically canceled 30 minutes after the booked time.</strong> If you have arrived at our dental centre, please notify our reception staff immediately to ensure your status is marked as <strong className="font-bold text-amber-950">Arrived</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Profile */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6" id="patient-profile-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-clinic-primary/5 text-clinic-primary flex items-center justify-center border border-slate-100">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 leading-tight">
                  {user.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono tracking-wider">{patientIdFormatted}</span>
              </div>
            </div>
            <div className="space-y-3.5 pt-4 border-t border-slate-50 text-sm text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-800 break-all pl-2">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Class:</span>
                <span className="font-semibold text-slate-800">Regular Patient</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Insurance Status:</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Policy
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <Activity className="w-5 h-5 text-clinic-accent" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Visits</span>
              </div>
              <div>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                ) : (
                  <span className="font-display font-extrabold text-2xl text-clinic-primary block" id="counter-total-visits">
                    {appointments.length}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-medium">Recorded sessions</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <Award className="w-5 h-5 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Confirmed</span>
              </div>
              <div>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                ) : (
                  <span className="font-display font-extrabold text-2xl text-emerald-600 block" id="counter-confirmed-bookings">
                    {confirmedAppointments.length}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-medium">Active visits</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Appointments Tables */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Next Active Visit */}
          {nextAppointment && (
            <div className="space-y-4" id="upcoming-appointments-section">
              <h3 className="font-display font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-clinic-accent" />
                Next Active Visit
              </h3>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-clinic-primary to-slate-800 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-md relative overflow-hidden"
                id="next-appointment-card"
              >
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-clinic-accent text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      Confirmed Appointment
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-white font-display font-extrabold text-2xl" id="next-app-time">
                        {nextAppointment.time}
                      </h4>
                      <p className="text-slate-300 text-sm flex items-center gap-2" id="next-app-service">
                        <Award className="w-4 h-4 text-clinic-accent" />
                        <span>Treatment: <strong className="text-white font-semibold">{nextAppointment.service || 'General Consult'}</strong></span>
                      </p>
                      <p className="text-slate-300 text-sm flex items-center gap-2" id="next-app-date">
                        <Calendar className="w-4 h-4 text-clinic-accent" />
                        <span>Date: {nextAppointment.date}</span>
                      </p>
                      <p className="text-slate-300 text-sm flex items-center gap-2" id="next-app-dentist">
                        <Stethoscope className="w-4 h-4 text-clinic-accent" />
                        <span>Consulting dentist: <strong className="text-white font-semibold">{nextAppointment.dentist}</strong></span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <div className="text-center sm:text-right">
                      <span className="text-xs text-slate-400 block">Status</span>
                      <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full border ${
                        nextAppointment.status === 'Arrived'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/30 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {nextAppointment.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCancel(nextAppointment.id)}
                      disabled={cancelingId === nextAppointment.id}
                      className="mt-2 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      {cancelingId === nextAppointment.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Cancel Visit
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* TABLE A: Confirmed & Active */}
          <div className="space-y-4" id="table-a-confirmed-appointments">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                 My Confirmed & Active Appointments
              </h3>
              <button
                onClick={onNavigateToBook}
                className="px-3 py-1.5 bg-clinic-primary text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Book New
              </button>
            </div>

            {loading ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-clinic-accent" />
              </div>
            ) : confirmedAppointments.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center py-10 space-y-3" id="no-confirmed-state">
                <p className="text-xs text-slate-400">No confirmed or active visits.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="confirmed-appointments-table">
                <div className="overflow-x-auto block">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-4 px-6">ID</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Treatment</th>
                        <th className="py-4 px-6">Time</th>
                        <th className="py-4 px-6">Doctor</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
                      {confirmedAppointments.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors" id={`confirmed-app-row-${app.id}`}>
                          <td className="py-4 px-6 font-mono font-bold text-xs text-clinic-primary">V-{app.id}</td>
                          <td className="py-4 px-6 font-medium text-slate-900">{app.date}</td>
                          <td className="py-4 px-6 font-semibold text-slate-800">{app.service || 'Diagnostic Consult'}</td>
                          <td className="py-4 px-6">{app.time}</td>
                          <td className="py-4 px-6 font-medium">{app.dentist || 'N/A'}</td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-1 rounded-full border border-emerald-100">
                              {app.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleCancel(app.id)}
                              disabled={cancelingId === app.id}
                              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              {cancelingId === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* TABLE B: Pending (Doctor-Assigned) */}
          <div className="space-y-4" id="table-b-pending-appointments">
            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Doctor-Assigned & Pending Confirmations
              </h3>
              <p className="text-xs text-slate-500">
                These appointments are pending confirmation by our clinical team. You will receive a notification when they are confirmed.
              </p>
            </div>

            {loading ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-clinic-accent" />
              </div>
            ) : pendingAppointments.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center py-10" id="no-pending-state">
                <p className="text-xs text-slate-400">No appointments are currently pending admin confirmation.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="pending-appointments-table">
                <div className="overflow-x-auto block">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-indigo-50/50 text-indigo-900 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-4 px-6">ID</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Treatment</th>
                        <th className="py-4 px-6">Time</th>
                        <th className="py-4 px-6">Doctor</th>
                        <th className="py-4 px-6">Status Badge</th>
                        <th className="py-4 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
                      {pendingAppointments.map((app) => (
                        <tr key={app.id} className="hover:bg-indigo-50/20 transition-colors" id={`pending-app-row-${app.id}`}>
                          <td className="py-4 px-6 font-mono font-bold text-xs text-indigo-600">V-{app.id}</td>
                          <td className="py-4 px-6 font-medium text-slate-900">{app.date}</td>
                          <td className="py-4 px-6 font-semibold text-slate-800">{app.service || 'Diagnostic Consult'}</td>
                          <td className="py-4 px-6">{app.time}</td>
                          <td className="py-4 px-6 font-medium">{app.dentist || 'N/A'}</td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-800 font-bold text-xs px-3 py-1 rounded-full border border-indigo-200 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                              Awaiting Admin Confirmation
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-xs text-slate-400 italic bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150 inline-block">
                              Locked (Awaiting Admin)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* TABLE C: History */}
          <div className="space-y-4" id="past-appointments-section">
            <h3 className="font-display font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-slate-400" />
              Treatment History & Canceled Logs
            </h3>

            {loading ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-clinic-accent" />
              </div>
            ) : historyAppointments.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center py-10" id="no-past-appointments-state">
                <p className="text-xs text-slate-400">No canceled appointments or past records.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="past-appointments-table">
                <div className="max-h-80 overflow-y-auto block">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-50 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider sticky top-0 bg-slate-50 z-10">
                        <th className="py-4 px-6">ID</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Treatment</th>
                        <th className="py-4 px-6">Time</th>
                        <th className="py-4 px-6">Doctor</th>
                        <th className="py-4 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
                      {historyAppointments.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors" id={`past-app-row-${app.id}`}>
                          <td className="py-4 px-6 font-mono font-bold text-xs text-slate-400">V-{app.id}</td>
                          <td className="py-4 px-6 font-medium text-slate-900">{app.date}</td>
                          <td className="py-4 px-6 font-semibold text-slate-800">{app.service || 'Diagnostic Consult'}</td>
                          <td className="py-4 px-6">{app.time}</td>
                          <td className="py-4 px-6 font-medium">{app.dentist || 'N/A'}</td>
                          <td className="py-4 px-6">
                            {app.status === 'Canceled' ? (
                              <span className="inline-flex flex-col items-start gap-0.5">
                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-bold text-xs px-2.5 py-1 rounded-full border border-rose-100">
                                  Canceled
                                </span>
                                {app.autoCanceled && (
                                  <span className="text-[10px] text-rose-500 font-medium font-sans">
                                    No-show auto-canceled
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-bold text-xs px-2.5 py-1 rounded-full border border-amber-100">
                                {app.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};