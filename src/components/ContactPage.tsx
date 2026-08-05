/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, Phone, Star, ShieldCheck, Mail, ArrowRight, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface ContactPageProps {
  onNavigateToBook: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigateToBook, addToast }) => {
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Do you accept dental insurance?',
      answer: 'Yes, we are in-network with most major PPO dental insurance providers (including Delta Dental, Aetna, Cigna, MetLife, and Guardian). Our administrative team will happily file claims on your behalf and provide a complete breakdown of co-pays before any treatment begins.'
    },
    {
      question: 'What options do you have for patients with dental anxiety?',
      answer: 'We specialize in compassionate, stress-free care. We offer nitrous oxide (laughing gas) dental sedation, noise-canceling headphones, ceiling-mounted entertainment screens, warm micro-fleece blankets, and ultra-quiet laser handpieces that completely replace noisy drills.'
    },
    {
      question: 'How do I handle a dental emergency outside working hours?',
      answer: 'If you are experiencing severe dental pain, swelling, or a broken tooth, please dial our direct reception line at +251 911223344 or our dedicated emergency hotline at (555) 999-0000. We maintain an on-call clinical specialist 24/7 to advise patients and schedule immediate emergency triage.'
    },
    {
      question: 'What is your appointment cancellation policy?',
      answer: 'We ask for at least 24 hours\' notice for any cancellations or rescheduling requests. This allows us to offer the slot to other patients on our active waiting list. Late cancellations or no-shows may be subject to a nominal fee.'
    },
    {
      question: 'What should I bring to my first appointment?',
      answer: 'Please bring a valid photo ID, your active dental insurance card, and any relevant medical/dental histories or recent X-rays if you have them. If you register through our secure online portal, you can fill out all patient intake forms digitally before arriving.'
    },
    {
      question: 'How often should I get a dental cleaning and checkup?',
      answer: 'For most patients with healthy teeth and gums, we recommend a routine preventative cleaning and clinical examination twice a year (every 6 months). Patients with active gum treatment, orthodontic appliances, or specific restorations may be advised to visit more frequently.'
    }
  ];

  const filteredFaqs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16" id="contact-page-container">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-sky-700 uppercase tracking-widest block">Contact Us</span>
        <h1 className="font-display font-bold text-4xl text-clinic-primary tracking-tight sm:text-5xl">
          Get in Touch With Our Team
        </h1>
        <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
          Have an inquiry, insurance query, or need help with a complex booking? Our dedicated reception desks are standing by to guide you through.
        </p>
      </div>

      {/* FAQ SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-8 animate-fade-in animate-delay-150" id="contact-faq-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest block">Frequently Asked Questions</span>
            <h3 className="font-display font-bold text-2xl text-clinic-primary tracking-tight">
              Patient Help & Resources
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              Can't find the answer you're looking for? Reach out using the inquiry form below or call reception.
            </p>
          </div>
          
          {/* FAQ Search Bar */}
          <div className="relative w-full md:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <HelpCircle className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search active FAQs..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-clinic-primary/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        {filteredFaqs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="faq-accordion-list">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl p-5 transition-all duration-200 text-left ${
                    isOpen
                      ? 'border-clinic-primary bg-slate-50/50 shadow-sm'
                      : 'border-slate-200/80 bg-white hover:border-slate-350 hover:shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full flex items-start justify-between gap-4 font-semibold text-slate-900 text-sm hover:text-clinic-primary transition-colors text-left bg-transparent border-0 cursor-pointer p-0"
                  >
                    <span className="font-display font-bold leading-snug">{faq.question}</span>
                    <span className="flex-shrink-0 mt-0.5 text-slate-400">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-clinic-primary" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.15 }}
                      className="mt-3 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-150" id="faq-no-results">
            <p className="text-slate-500 text-xs">No FAQs match your search. Try another word or fill in our inquiry form below!</p>
          </div>
        )}
      </div>

      {/* Grid: Info on left, Map on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12" id="contact-content-grid">
        
        {/* Plan Your Visit Info Box (Left) */}
        <div className="lg:col-span-7" id="contact-visit-plan-block">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-widest block">
                Plan Your Visit
              </span>
              <h3 className="font-display font-bold text-xl text-clinic-primary tracking-tight">
                Modern Clinic, Convenient Scheduling
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                We respect your time. Our modern appointment scheduling system is designed to minimize wait times, ensuring you get top-quality dental care with maximum efficiency.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="flex gap-2.5">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-clinic-primary">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs">Working Hours</h4>
                  <ul className="text-[11px] text-slate-500 space-y-0.5 mt-0.5">
                    <li>Mon - Fri: 8:00 AM - 6:00 PM</li>
                    <li>Saturday: 9:00 AM - 3:00 PM</li>
                    <li className="text-rose-500 font-medium">Sunday: Closed</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-clinic-primary">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs">Clinic Location</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Dental Clinic Health Center<br />
                    Addis Ababa, Ethiopia<br />
                    Bole around Edna Mall
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-clinic-primary">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs">Direct Contact</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Support: <span className="font-semibold text-slate-700">+251 911223344</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-clinic-primary">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs">Highly Rated Care</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Over 500+ five-star reviews on Google and Healthgrades. Committed to safety.
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-4 flex flex-wrap gap-3 items-center border-t border-slate-100">
              <button
                onClick={onNavigateToBook}
                className="px-5 py-2.5 bg-clinic-primary text-white hover:bg-slate-800 font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                id="contact-info-book-btn"
              >
                Go To Booking Page
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <a
                href="tel:+251911223344"
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-clinic-primary font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                Call Clinic Reception
              </a>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Follow & Connect</span>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-50 text-slate-600 hover:text-sky-600 rounded-xl border border-slate-200 transition-all font-semibold text-[11px]"
                  id="contact-social-facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V2h-3a5 5 0 0 0-5 5v1z"/></svg>
                  <span>Facebook</span>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-pink-500 hover:bg-pink-50 text-slate-600 hover:text-pink-600 rounded-xl border border-slate-200 transition-all font-semibold text-[11px]"
                  id="contact-social-instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  <span>Instagram</span>
                </a>
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-50 text-slate-600 hover:text-sky-500 rounded-xl border border-slate-200 transition-all font-semibold text-[11px]"
                  id="contact-social-telegram"
                >
                  <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21.198 2.43a2.242 2.242 0 0 0-2.235.078L1.93 11.025a1.867 1.867 0 0 0-.102 3.327l5.053 2.112 1.82 5.46a1.121 1.121 0 0 0 1.953.255l3.14-3.837 5.101 3.738a1.867 1.867 0 0 0 2.924-1.12l3.411-16.03a1.867 1.867 0 0 0-2.032-2.522zM7.5 15.5l9.5-8.5-6.5 9.5-3 1z"/></svg>
                  <span>Telegram</span>
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white hover:bg-slate-600 hover:text-white text-slate-600 rounded-xl border border-slate-200 transition-all font-semibold text-[11px]"
                  id="contact-social-tiktok"
                >
                  <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                  <span>TikTok</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Google Map */}
        <div className="lg:col-span-5 h-[400px] md:h-[500px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm" id="contact-map-block">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11463.354148419688!2d-123.02324978250005!3d44.05380531557022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54c1140026e6f987%3A0xc3b811802dc90729!2sSpringfield%2C%20OR!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
            className="w-full h-full border-0"
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Dental Clinic Location Map"
          />
        </div>

      </div>

    </div>
  );
};