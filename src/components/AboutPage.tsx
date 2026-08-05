/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, Users, ShieldCheck, Heart, Star, Sparkles, Smile, ArrowRight, Stethoscope } from 'lucide-react';
import { mockGetStaff } from '../api';
import { Staff } from '../types';

interface AboutPageProps {
  onNavigateToBook: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigateToBook }) => {
  const [specialists, setSpecialists] = useState<Staff[]>([]);

  useEffect(() => {
    mockGetStaff().then(data => {
      setSpecialists(data || []);
    }).catch(err => console.error(err));
  }, []);

  const highlights = [
    {
      icon: <Award className="w-5 h-5 text-clinic-primary" />,
      title: 'Award-Winning Care',
      desc: 'Consistently voted top dental practice in the region for general & aesthetic dentistry.'
    },
    {
      icon: <Users className="w-5 h-5 text-clinic-primary" />,
      title: 'Expert Specialists',
      desc: 'Our top-tier certified board dentists carry extensive clinical experience.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-clinic-primary" />,
      title: '100% Pain-Free Focus',
      desc: 'Pioneering gentle laser treatment techniques, noise-cancelling setups, and conscious dental sedation.'
    }
  ];

  const coreValues = [
    {
      title: 'Uncompromised Safety',
      desc: 'We exceed EPA, OSHA, and CDC sterilization guidelines. All digital instrumentation is strictly autoclave-verified.'
    },
    {
      title: 'Patient Empowerment',
      desc: 'We believe you deserve complete command of your care. We show high-resolution scans of everything we find and discuss all alternatives.'
    },
    {
      title: 'Modern Comfort',
      desc: 'Dental anxiety is real. We provide heated blankets, premium noise-cancelling headphones, ceiling-mounted entertainment, and painless injection systems.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16" id="about-page-container">
      
      {/* 1. Header and Mission */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-sky-700 uppercase tracking-widest block">About Our Practice</span>
        <h1 className="font-display font-bold text-4xl text-clinic-primary tracking-tight sm:text-5xl">
          Redefining the Dental Experience
        </h1>
        <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
          At Dental Clinic, we believe a visit to the dentist should not be feared. We pair certified clinicians with advanced therapeutic comforts to make every visit quick, painless, and completely transparent.
        </p>
      </div>

      {/* 2. Visual Split Row: Introduction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" id="about-intro-split">
        <div className="space-y-6">
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            Our Care Philosophy
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Founded in 2018, Dental Clinic was built from the ground up to solve the most common issues patients face: extreme anxiety, lack of clear billing transparency, and outdated, painful treatment tools. 
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            By investing in quiet, painless dental lasers, 3D intraoral digital scanners, and digital planning systems, we eliminate the traditional drills and gooey molds. Every treatment is mapped on screen, enabling you to inspect your diagnostics alongside our doctors.
          </p>
          <div className="pt-4 flex items-center gap-4 border-t border-slate-100">
            <div>
              <span className="font-display font-black text-3xl text-clinic-primary block">30+</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Years Combined Exp</span>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <span className="font-display font-black text-3xl text-clinic-primary block">99%</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Painless Rating</span>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <span className="font-display font-black text-3xl text-clinic-primary block">5,000+</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Smiles Perfected</span>
            </div>
          </div>
        </div>
        
        {/* Decorative Quote Panel */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50/50 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-6 relative z-10">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="text-slate-700 font-medium italic text-base sm:text-lg leading-relaxed">
              "We designed Dental Clinic to be a sanctuary, not a sterile clinic. Every detail, from the calming aroma to our pain-free therapeutic lasers, is built with your ultimate comfort in mind."
            </blockquote>
          </div>
          <div className="flex items-center gap-3 mt-8">
            <div className="w-10 h-10 rounded-full bg-clinic-primary text-white font-bold flex items-center justify-center text-xs">
              DC
            </div>
            <div>
              <cite className="font-bold text-slate-800 not-italic block text-sm">Clinical Leadership</cite>
              <span className="text-xs text-slate-400 block">Dental Clinic Health Centre</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Core Values Section */}
      <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/80 space-y-8" id="about-core-values">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-clinic-primary tracking-tight">Our Core Pledges</h2>
          <p className="text-slate-500 text-xs sm:text-sm">We hold ourselves to a higher clinical standard because your trust is irreplaceable.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coreValues.map((val, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm space-y-3">
              <span className="text-xs font-bold text-clinic-primary/20 font-mono block">0{idx + 1}</span>
              <h4 className="font-display font-bold text-slate-900 text-base">{val.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Unique Highlights Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="about-highlights-grid">
        {highlights.map((item, idx) => (
          <div
            key={idx}
            className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-200/80"
          >
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

      {/* CTA section */}
      <div className="text-center pt-4">
        <button
          onClick={onNavigateToBook}
          className="px-8 py-3.5 bg-clinic-primary text-white hover:bg-slate-800 font-semibold text-sm rounded-xl transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
        >
          Book Your Appointment Online
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};