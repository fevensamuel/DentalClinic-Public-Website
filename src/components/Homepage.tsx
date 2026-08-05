/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sparkles,
  Smile,
  Shield,
  Activity,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  Award,
  Users,
  CheckCircle,
  Star,
} from 'lucide-react';
import { motion } from 'motion/react';
import { getMockConfig, mockGetStaff, mockGetServices } from '../api';
import { Staff } from '../types';
import { useState, useEffect } from 'react';

interface HomepageProps {
  onNavigateToBook: () => void;
  onNavigateToServices: () => void;
  onNavigateToStaff: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({ onNavigateToBook, onNavigateToServices, onNavigateToStaff }) => {
  const config = getMockConfig();
  const announcement = config.announcement;

  const [featuredStaffList, setFeaturedStaffList] = useState<Staff[]>([]);
  const [promoServices, setPromoServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const staff = await mockGetStaff();
        const featured = staff.filter(s => s.isFeatured).slice(0, 3);
        setFeaturedStaffList(featured);

        const services = await mockGetServices();
        const activePromos = services.filter(s => s.promotionActive) || [];
        setPromoServices(activePromos);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      }
    };
    fetchData();
  }, []);

  const highlights = [
    {
      icon: <Award className="w-5 h-5 text-clinic-primary" />,
      title: 'Award-Winning Care',
      desc: 'Consistently voted top dental practice in the region.',
    },
    {
      icon: <Users className="w-5 h-5 text-clinic-primary" />,
      title: 'Expert Specialists',
      desc: 'Our top-tier certified board dentists and clinical specialists.',
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-clinic-primary" />,
      title: '100% Pain-Free Focus',
      desc: 'Pioneering gentle techniques and conscious dental sedation.',
    },
  ];

  return (
    <div className="space-y-16 pb-20" id="homepage-container">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white text-slate-800 py-20 px-6 sm:px-12 lg:px-16 rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 border border-slate-200/80 shadow-sm" id="hero-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          {announcement && !announcement.toUpperCase().includes('DISCOUNTTTTT') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mx-auto shadow-sm"
              id="homepage-announcement-banner"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
              <span>{announcement}</span>
            </motion.div>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-clinic-primary tracking-tight leading-tight"
          >
            Your Smile. Our Passion. <br />
            <span className="text-slate-900 font-medium">Complete Dental Excellence.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Experience compassionate, advanced dental care tailored to your family. Book your visit online today in under a minute without any upfront commitments.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-4 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={onNavigateToBook}
              className="px-8 py-3.5 bg-clinic-primary text-white hover:bg-slate-800 font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              id="hero-book-now-btn"
            >
              Book an Appointment
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateToServices}
              className="px-8 py-3.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Our Services
            </button>
          </motion.div>
        </div>
      </section>

      {/* PROMOTIONAL BANNER – with blue button */}
      {promoServices.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="promo-banner-section">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-45 h-45 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  Special Promotion Active
                </div>
                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                  Exclusive Dental Treatment Offers!
                </h3>
                <p className="text-emerald-50 max-w-2xl text-xs sm:text-sm">
                  Our clinical treatments have special discount pricing available for a limited time. Save on your next session!
                </p>
              </div>
              <div className="flex flex-wrap gap-3 items-center justify-center">
                <div className="flex flex-wrap gap-2 justify-center">
                  {promoServices.slice(0, 2).map((ps, idx) => (
                    <div key={idx} className="inline-block px-3 py-1.5 rounded-xl bg-white text-emerald-800 text-xs font-extrabold border border-emerald-100 shadow-sm">
                      {ps.discountPercent ? `${ps.discountPercent}% Off` : 'Promo Active'} {ps.title}
                    </div>
                  ))}
                </div>
                <button
                  onClick={onNavigateToServices}
                  className="px-5 py-2.5 bg-clinic-primary hover:bg-clinic-primary-dark text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Claim Discount Now
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="highlights-section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item, idx) => (
            <div key={idx} className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-200/80">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-slate-900 text-base">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STAFF PROMO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="meet-team-promo-section">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-clinic-primary/5 text-clinic-primary flex items-center justify-center">
              <Users className="w-6 h-6 text-clinic-accent fill-clinic-accent/10" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
                Meet our expert team of dental specialists.
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                Get to know our highly qualified, board-certified dental professionals and their focus areas.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToStaff}
            className="px-6 py-3 bg-clinic-primary hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0"
            id="homepage-see-staff-btn"
          >
            See Our Staff
            <ArrowRight className="w-4 h-4 text-clinic-accent" />
          </button>
        </div>
      </section>

      {/* FEATURED DOCTORS */}
      {featuredStaffList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="featured-doctor-section">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-clinic-gold uppercase tracking-widest block">
              Featured Clinical Spotlight
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Meet Our Spotlight Specialists
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Our clinical leaders are board-certified specialists committed to providing gentle, high-tech dental care with a personalized touch.
            </p>
          </div>
          <div className={`grid gap-6 ${
            featuredStaffList.length === 1 
              ? 'grid-cols-1 max-w-4xl mx-auto' 
              : featuredStaffList.length === 2 
                ? 'grid-cols-1 md:grid-cols-2' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {featuredStaffList.map((staff) => (
              <div key={staff.id} className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row md:flex-col lg:flex-row gap-6 items-center text-left hover:border-clinic-gold/50 transition-all duration-300 relative group">
                <div className="shrink-0 relative">
                  <div className="absolute inset-0 bg-clinic-primary/5 rounded-2xl rotate-3 scale-102 group-hover:rotate-6 transition-transform duration-300" />
                  {staff.image ? (
                    <img src={staff.image} alt={staff.name} className="w-32 h-32 sm:w-36 sm:h-36 object-cover rounded-2xl relative z-10 border border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-clinic-primary to-clinic-accent text-white flex items-center justify-center font-display font-extrabold text-3xl shadow-md tracking-wider relative z-10 border border-slate-200">
                      {staff.name.replace(/^(Dr\.|Dr)\s+/i, '').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                    </div>
                  )}
                </div>
                <div className="space-y-3 flex-grow">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-clinic-gold/10 text-amber-800 text-[9px] font-bold uppercase tracking-wider">
                      <Award className="w-2.5 h-2.5" /> Spotlight
                    </span>
                    <h3 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">{staff.name}</h3>
                    <p className="text-xs font-semibold text-clinic-primary uppercase tracking-wider">{staff.title}</p>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">{staff.bio}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-clinic-gold" />
                    <span>Board Certified Expert</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CLINIC INFO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="clinic-info-section">
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
          <div className="p-8 sm:p-12 lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-widest block">Plan Your Visit</span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-clinic-primary tracking-tight">
                Modern Clinic, Convenient Scheduling
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                We respect your time. Our modern appointment scheduling system is designed to minimize wait times, ensuring you get top-quality dental care with maximum efficiency.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-clinic-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Working Hours</h4>
                  <ul className="text-xs text-slate-500 space-y-1 mt-1">
                    <li>Mon - Fri: 8:00 AM - 6:00 PM</li>
                    <li>Saturday: 9:00 AM - 3:00 PM</li>
                    <li className="text-rose-500 font-medium">Sunday: Closed</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-clinic-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Clinic Location</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Dental Clinic Health Center<br />
                    Addis Ababa, Ethiopia<br />
                    Bole, Around Edna Mall
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-clinic-primary">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Direct Contact</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Support: <span className="font-semibold text-slate-700">+251 911223344</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-clinic-primary">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Highly Rated Care</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Over 500+ five-star reviews on Google and Healthgrades. Committed to safety.
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <button onClick={onNavigateToBook} className="px-6 py-3 bg-clinic-primary text-white hover:bg-slate-800 font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer" id="info-book-btn">
                Go To Booking Page
                <ArrowRight className="w-4 h-4" />
              </button>
              <a href="tel:+251911223344" className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-clinic-primary font-semibold text-sm rounded-xl transition-all flex items-center gap-2">
                Call Clinic Reception
              </a>
            </div>
          </div>
          <div className="lg:col-span-5 relative w-full h-[350px] lg:h-auto min-h-[350px] bg-slate-50 border-l border-slate-200/80" id="homepage-map-column">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.728368232322!2d38.784105375018385!3d8.997123291062955!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b8502fe44f345%3A0x209cbe597069517f!2sEdna%20Mall!5e0!3m2!1sen!2set!4v1785937398792!5m2!1sen!2set"
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Dental Clinic Location Map"
            />
          </div>
        </div>
      </section>
    </div>
  );
};