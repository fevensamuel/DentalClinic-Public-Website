/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Sparkles, Star, UserCheck, HeartPulse, Stethoscope, ArrowRight } from 'lucide-react';
import { mockGetStaff } from '../api';
import { Staff } from '../types';

interface StaffPageProps {
  onNavigateToBook: () => void;
}

export const StaffPage: React.FC<StaffPageProps> = ({ onNavigateToBook }) => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await mockGetStaff();
        setStaffList(data);
      } catch (err) {
        console.error('Failed to load staff list', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // Get initials for profile picture fallback
  const getInitials = (name: string) => {
    return name
      .replace(/^(Dr\.|Dr)\s+/i, '') // Remove Dr. prefix
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12" id="staff-page-container">
      
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-clinic-primary/5 text-clinic-primary text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-clinic-accent fill-clinic-accent/20" />
          Meet Our Dental Specialists
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Exceptional Care From Certified Specialists
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Our team combines decades of clinical experience, advanced digital technologies, and compassionate patient care to design your perfect smile.
        </p>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4" id="staff-loading">
          <div className="w-10 h-10 border-4 border-clinic-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading our specialists...</p>
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/85 p-8 shadow-sm max-w-md mx-auto" id="staff-empty">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm mb-1">No Staff Listed</h3>
          <p className="text-xs text-slate-500 mb-4">Our providers are currently being updated by the administration. Please check back shortly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="staff-grid">
          {staffList.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between"
              id={`staff-card-${doc.id}`}
            >
              <div>
                {/* Featured Badge */}
                {doc.isFeatured && (
                  <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-clinic-gold/15 text-amber-700 border border-clinic-gold/30 text-[10px] font-extrabold uppercase tracking-wider" id={`staff-featured-badge-${doc.id}`}>
                    <Star className="w-3 h-3 fill-current" />
                    Featured Specialist
                  </div>
                )}

                {/* Avatar / Profile Picture */}
                <div className="flex justify-center mb-6 pt-2">
                  {doc.image ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-slate-100 shadow-inner flex-shrink-0">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // fallback to initials on error
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-clinic-primary to-teal-500 text-white flex items-center justify-center font-display font-extrabold text-2xl shadow-md tracking-wider ring-4 ring-slate-100 flex-shrink-0">
                      {getInitials(doc.name)}
                    </div>
                  )}
                </div>

                {/* Staff Info */}
                <div className="text-center space-y-2 mb-6">
                  <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight leading-tight">
                    {doc.name}
                  </h3>
                  <div className="text-xs font-bold text-clinic-primary uppercase tracking-wide px-3 py-1 bg-clinic-primary/5 rounded-xl inline-block">
                    {doc.title}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed text-left pt-3 border-t border-slate-100 mt-4">
                    {doc.bio}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking CTA Section */}
      <div className="bg-gradient-to-r from-clinic-primary to-teal-600 text-white rounded-3xl p-6 sm:p-10 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden" id="staff-booking-cta">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-45 h-45 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 text-center md:text-left relative z-10">
          <h3 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-white">
            Ready to schedule a dental checkup?
          </h3>
          <p className="text-teal-50 max-w-2xl text-xs sm:text-sm">
            Book your session online with any of our certified dental care specialists and start your digital smile makeover journey today.
          </p>
        </div>

        <button
          onClick={onNavigateToBook}
          className="px-6 py-3 bg-white text-clinic-primary hover:bg-slate-50 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 relative z-10 shrink-0"
        >
          Book An Appointment
          <ArrowRight className="w-4 h-4 text-clinic-primary" />
        </button>
      </div>

    </div>
  );
};