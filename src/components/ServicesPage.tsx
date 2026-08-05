/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Search, CheckCircle2 } from 'lucide-react';
import { mockGetServices, getServiceDisplayPrice } from '../api';

interface ServicesPageProps {
  onNavigateToBook: (serviceTitle?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigateToBook }) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await mockGetServices();
        setServices(data || []);
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter(s =>
    s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description || s.desc || '')?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-clinic-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-sky-700 uppercase tracking-widest block">Our Treatments</span>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-clinic-primary tracking-tight">
          Comprehensive Dental Services
        </h1>
        <p className="text-slate-500 text-sm">
          Explore our full range of dental procedures designed to restore, enhance, and maintain your smile.
        </p>
        <div className="relative max-w-md mx-auto mt-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-clinic-primary/20 focus:border-clinic-primary"
          />
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">No services match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, idx) => {
            const priceInfo = getServiceDisplayPrice(service);
            const description = service.description || service.desc || 'No description available.';
            return (
              <motion.div
                key={service.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-display font-bold text-lg text-slate-900">{service.title}</h3>
                  {service.promotionActive && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">PROMO</span>
                  )}
                </div>
                <p className="text-slate-500 text-sm mt-2 flex-1">{description}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Est. Duration</span>
                    <span className="font-semibold text-sm">{service.duration || '30 mins'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Price</span>
                    {priceInfo.hasDiscount ? (
                      <div>
                        <span className="line-through text-slate-400 text-xs mr-1">{priceInfo.original}</span>
                        <span className="font-bold text-emerald-600 text-sm">{priceInfo.current}</span>
                      </div>
                    ) : (
                      <span className="font-bold text-slate-800 text-sm">{priceInfo.original}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onNavigateToBook(service.title)}
                  className="mt-4 w-full py-2 bg-clinic-primary hover:bg-clinic-primary-dark text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Book This Service
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};