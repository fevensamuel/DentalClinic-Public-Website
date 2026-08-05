/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Lock,
  ArrowRight,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  mockGetAvailableSlots,
  mockBookSlot,
  getMockConfig,
  getLocalYMDString,
  getServiceDisplayPrice,
  mockGetServices,
  mockGetStaff,
  getBlockedDates,
  getAvailability,
} from '../api';
import { User, Staff } from '../types';

interface BookingPageProps {
  user: User | null;
  onOpenAuth: (tab: 'login' | 'signup', pendingSlot?: string) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  pendingBookSlot: string | null;
  setPendingBookSlot: (slot: string | null) => void;
  onBookingSuccess: () => void;
  selectedService: string;
  setSelectedService: (service: string) => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  user,
  onOpenAuth,
  addToast,
  pendingBookSlot,
  setPendingBookSlot,
  onBookingSuccess,
  selectedService,
  setSelectedService,
}) => {
  const mockConfig = getMockConfig();
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [availableDoctorIds, setAvailableDoctorIds] = useState<string[]>([]);
  const [blockedDates, setBlockedDates] = useState<{ date: string; reason: string }[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(false);
  const bookingCutoffTime = mockConfig.bookingCutoffTime || '14:00';

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    if (date.getDay() === 0) date.setDate(date.getDate() + 1);
    return date;
  });

  const [viewDate, setViewDate] = useState<Date>(() => {
    const initial = new Date(selectedDate);
    initial.setDate(1);
    return initial;
  });

  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);

  // Fetch data (services, staff, blocked dates)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [services, staff, blocked] = await Promise.all([
          mockGetServices(),
          mockGetStaff(),
          getBlockedDates(),
        ]);
        setDbServices(services || []);
        setAllStaff(staff || []);
        setBlockedDates(blocked || []);
        console.log('✅ Staff loaded:', staff);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch availability when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate) return;
      setIsLoadingAvailability(true);
      try {
        const dateStr = getLocalYMDString(selectedDate);
        console.log('📡 Fetching availability for date:', dateStr);
        const avail = await getAvailability(dateStr);
        console.log('📡 Availability response:', avail);
        
        let doctorIds: string[] = [];
        if (avail) {
          // If avail is an array, find the matching date
          if (Array.isArray(avail)) {
            const found = avail.find((a: any) => a.date === dateStr);
            doctorIds = found?.doctorIds || [];
          } else if (avail.doctorIds && Array.isArray(avail.doctorIds)) {
            doctorIds = avail.doctorIds;
          }
        }
        console.log('📡 Extracted doctor IDs:', doctorIds);
        setAvailableDoctorIds(doctorIds);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setAvailableDoctorIds([]);
      } finally {
        setIsLoadingAvailability(false);
      }
    };
    fetchAvailability();
  }, [selectedDate]);

  // Fetch slots when service or date changes
  useEffect(() => {
    const loadSlots = async () => {
      setLoading(true);
      try {
        const dateYMD = getLocalYMDString(selectedDate);
        const available = await mockGetAvailableSlots(selectedService, dateYMD);
        setSlots(available);
      } catch (err: any) {
        addToast('error', 'Failed to retrieve available timeslots.');
      } finally {
        setLoading(false);
      }
    };
    loadSlots();
  }, [selectedService, selectedDate]);

  // Handle pending slot after login
  useEffect(() => {
    if (user && pendingBookSlot) {
      const slotToBook = pendingBookSlot;
      setPendingBookSlot(null);
      handleBookSlot(slotToBook);
    }
  }, [user, pendingBookSlot]);

  const handleBookSlot = async (slot: string) => {
    const dateYMD = getLocalYMDString(selectedDate);
    if (!user) {
      setPendingBookSlot(slot);
      addToast('info', 'Please log in or sign up to finalize this appointment booking.');
      onOpenAuth('login', slot);
      return;
    }

    setBookingSlot(slot);
    try {
      await mockBookSlot(user.id, slot, selectedService, dateYMD, undefined, 'Confirmed');
      const formattedDateStr = selectedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      addToast('success', `Appointment confirmed for ${formattedDateStr} at ${slot}.`);
      setSlots((prev) => prev.filter((s) => s !== slot));
      onBookingSuccess();
    } catch (err: any) {
      addToast('error', err.message || 'Booking failed.');
    } finally {
      setBookingSlot(null);
    }
  };

  // ✅ Filter staff based on availability - match by ID as string
  const availableStaff = allStaff.filter((doc) => {
    const docIdStr = String(doc.id);
    const isAvailable = availableDoctorIds.length > 0 && availableDoctorIds.includes(docIdStr);
    console.log(`🔍 Doctor ${doc.name} (ID: ${docIdStr}) - Available IDs: ${JSON.stringify(availableDoctorIds)} - Match: ${isAvailable}`);
    return isAvailable;
  });

  // ✅ Show all staff if no availability is configured (fallback)
  const displayStaff = availableDoctorIds.length > 0 ? availableStaff : allStaff;

  console.log('📋 All staff:', allStaff.map(d => ({ id: String(d.id), name: d.name })));
  console.log('📋 Available doctor IDs from backend:', availableDoctorIds);
  console.log('📋 Filtered staff count:', displayStaff.length);

  const servicesList = dbServices.map((ds) => ({
    title: ds.title,
    desc: ds.desc,
    duration: ds.duration || '30 mins',
    price: ds.price || '0 ETB',
    icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
    promotionActive: ds.promotionActive,
    promotionDetails: ds.promotionDetails,
    discountPercent: ds.discountPercent,
    discountAmount: ds.discountAmount,
  }));

  const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDaysInMonthGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();
    const grid: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) grid.push(null);
    for (let day = 1; day <= totalDays; day++) {
      grid.push(new Date(year, month, day));
    }
    return grid;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    if (dateCopy < today) return true;
    if (date.getDay() === 0) return true;

    const dateYMD = getLocalYMDString(date);
    if (blockedDates.some((b) => b.date === dateYMD)) return true;

    const currentDay = new Date();
    if (isSameDay(date, currentDay)) {
      const currentHour = currentDay.getHours();
      const currentMinute = currentDay.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      let adminCutoffMinutes = 14 * 60;
      if (bookingCutoffTime) {
        const parts = bookingCutoffTime.split(':');
        if (parts.length === 2) {
          adminCutoffMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }
      }
      const hardcodedCutoffMinutes = 16 * 60;
      const effectiveCutoffMinutes = Math.min(adminCutoffMinutes, hardcodedCutoffMinutes);
      if (currentTimeInMinutes >= effectiveCutoffMinutes) return true;
    }
    return false;
  };

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const activeServiceDetails =
    servicesList.find((s) => s.title === selectedService) || servicesList[0] || {
      title: selectedService || 'Consultation',
      desc: 'Specialist Consultation',
      duration: '30 mins',
      price: '0 ETB',
      icon: null,
      promotionActive: false,
    };

  const parseSlotTimeToMinutes = (slot: string): number => {
    const match = slot.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const getFilteredSlots = () => {
    let filtered = [...slots];
    filtered = filtered.filter((s) => s !== '12:00 PM');
    filtered = filtered.filter((s) => parseSlotTimeToMinutes(s) <= 16 * 60);
    const isSaturday = selectedDate.getDay() === 6;
    if (isSaturday) {
      filtered = filtered.filter((s) => {
        const mins = parseSlotTimeToMinutes(s);
        return mins >= 9 * 60 && mins <= 13 * 60;
      });
    }
    const now = new Date();
    const isToday = isSameDay(selectedDate, now);
    if (isToday) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const minRequiredMinutes = currentMinutes + 30;
      filtered = filtered.filter((s) => parseSlotTimeToMinutes(s) >= minRequiredMinutes);
    }
    return filtered;
  };

  const filteredSlotsForDisplay = getFilteredSlots();
  const morningSlots = filteredSlotsForDisplay.filter(
    (s) => s.endsWith('AM') || s.startsWith('11') || s.startsWith('09') || s.startsWith('10')
  );
  const afternoonSlots = filteredSlotsForDisplay.filter(
    (s) => s.endsWith('PM') && !s.startsWith('11')
  );

  const formattedSelectedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10" id="booking-page-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-8">
        <div className="space-y-1">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-clinic-primary tracking-tight">
            Schedule Appointment
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">
            Configure your personalized appointment by selecting a dental service and date.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-clinic-accent/10 flex items-center justify-center text-clinic-primary">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wide">
              Selected Date
            </span>
            <span className="text-sm font-extrabold text-clinic-primary block">
              {selectedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                weekday: 'short',
              })}
            </span>
          </div>
        </div>
      </div>

      {!user && (
        <div
          className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
          id="guest-booking-banner"
        >
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-clinic-accent/25 flex items-center justify-center text-clinic-primary flex-shrink-0 mt-0.5 sm:mt-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-semibold text-slate-900 text-sm">
                Browsing as a Guest
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Select your service, choose a day, and click any slot. Simply log in or sign up to
                finalize your live booking.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenAuth('login')}
            className="flex-shrink-0 px-4 py-2 bg-clinic-primary text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            id="guest-login-action-btn"
          >
            Log In First
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {(() => {
        let adminCutoffMinutes = 14 * 60;
        if (bookingCutoffTime) {
          const parts = bookingCutoffTime.split(':');
          if (parts.length === 2) {
            adminCutoffMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
          }
        }
        const hardcodedCutoffMinutes = 16 * 60;
        const finalMinutes = Math.min(adminCutoffMinutes, hardcodedCutoffMinutes);
        const h = Math.floor(finalMinutes / 60);
        const m = finalMinutes % 60;
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const displayTimeStr = `${displayH}:${m.toString().padStart(2, '0')} ${period}`;

        return (
          <div
            className="bg-amber-50/65 border border-amber-200/80 p-5 rounded-2xl flex items-start gap-4"
            id="booking-policy-banner"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-left">
              <h4 className="font-display font-bold text-amber-900 text-xs uppercase tracking-wider">
                Same-Day Booking Cut-off Policy
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Our clinic allows same-day appointments to be booked online, provided they are made
                before our daily same-day cutoff hour of{' '}
                <strong className="font-extrabold">{displayTimeStr}</strong>. Appointments booked
                after this time will need to be scheduled for tomorrow or a future available clinic
                day.
              </p>
            </div>
          </div>
        );
      })()}

      <div
        className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6"
        id="booking-step-1-service"
      >
        <div className="space-y-1">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-widest block">
            Step 1
          </span>
          <h2 className="font-display font-bold text-xl text-slate-950">Select Dental Treatment</h2>
          <p className="text-xs text-slate-500">
            Pick the dental service you wish to schedule today. Prices and durations are estimates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="booking-services-grid">
          {servicesList.map((service) => {
            const isSelected = selectedService === service.title;
            return (
              <button
                key={service.title}
                onClick={() => setSelectedService(service.title)}
                className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-clinic-primary bg-slate-50 ring-2 ring-clinic-primary/10 shadow-sm'
                    : 'border-slate-200/80 bg-white hover:border-slate-350 hover:bg-slate-50/50'
                }`}
                id={`service-card-${service.title.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div
                  className={`p-2 rounded-xl flex-shrink-0 ${
                    isSelected ? 'bg-clinic-primary text-white font-bold' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {service.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{service.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">{service.desc}</p>
                  {(() => {
                    const priceInfo = getServiceDisplayPrice(service);
                    return (
                      <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 font-medium">
                        <span>
                          Est: <strong className="text-slate-600 font-semibold">{service.duration}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Cost:{' '}
                          {priceInfo.hasDiscount ? (
                            <>
                              <span className="line-through text-slate-400 font-normal mr-1">
                                {priceInfo.original}
                              </span>
                              <strong className="text-emerald-600 font-extrabold text-xs">
                                {priceInfo.current}+
                              </strong>
                            </>
                          ) : (
                            <strong className="text-slate-600 font-semibold">{priceInfo.original}+</strong>
                          )}
                        </span>
                      </div>
                    );
                  })()}
                  {service.promotionActive && service.promotionDetails && (
                    <div className="mt-1.5 bg-emerald-50 text-emerald-700 font-bold text-[9px] uppercase tracking-wide px-2 py-0.5 rounded border border-emerald-200 w-fit flex items-center gap-1 animate-pulse">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      <span>PROMO: {service.promotionDetails}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6"
            id="booking-step-2-calendar"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-bold text-sky-700 uppercase tracking-widest block">
                  Step 2
                </span>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Choose Appointment Date
                </h3>
                <p className="text-xs text-slate-500">
                  Sundays are closed. Previous dates are greyed out.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  id="calendar-prev-month-btn"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-display font-bold text-sm text-slate-800 min-w-[110px] text-center">
                  {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  id="calendar-next-month-btn"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5" id="calendar-days-grid">
                {getDaysInMonthGrid().map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} className="aspect-square" />;
                  const isDisabled = isDateDisabled(date);
                  const isSelected = isSameDay(date, selectedDate);
                  const isToday = isSameDay(date, new Date());
                  return (
                    <button
                      key={getLocalYMDString(date)}
                      onClick={() => {
                        if (isDisabled) return;
                        setSelectedDate(date);
                      }}
                      className={`aspect-square rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                        isDisabled
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : isSelected
                          ? 'bg-clinic-primary text-white font-bold shadow-md shadow-clinic-primary/15'
                          : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-150'
                      }`}
                      id={`calendar-cell-${getLocalYMDString(date)}`}
                    >
                      <span>{date.getDate()}</span>
                      {isToday && !isSelected && !isDisabled && (
                        <span className="w-1.5 h-1.5 rounded-full bg-clinic-accent absolute bottom-1.5" />
                      )}
                      {date.getDay() === 0 && (
                        <span className="text-[8px] text-slate-400 mt-0.5 leading-none">Closed</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {(() => {
              const currentMonthBlockedDates = blockedDates.filter((b) => {
                const dObj = new Date(b.date + 'T00:00:00');
                return (
                  dObj.getFullYear() === viewDate.getFullYear() &&
                  dObj.getMonth() === viewDate.getMonth()
                );
              });
              if (currentMonthBlockedDates.length === 0) return null;
              return (
                <div
                  className="mt-4 p-4 bg-rose-50/50 border border-rose-100 rounded-2xl text-xs space-y-2"
                  id="blocked-reasons-notice"
                >
                  <span className="font-bold text-rose-900 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Clinic Closures & Special Blocked Dates (
                    {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentMonthBlockedDates.map((b) => {
                      const dObj = new Date(b.date + 'T00:00:00');
                      const formatted = dObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                      return (
                        <div
                          key={b.date}
                          className="flex items-center gap-2 text-slate-600 bg-white p-2 rounded-lg border border-slate-100 shadow-sm"
                        >
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-extrabold px-1.5 py-0.5 rounded">
                            ✖
                          </span>
                          <span>
                            <strong className="font-bold text-slate-800">{formatted}</strong>: {b.reason}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          <div
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6"
            id="booking-step-3-slots"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Clock className="w-5 h-5 text-clinic-primary" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-sky-700 uppercase tracking-widest block">
                  Step 3
                </span>
                <h3 className="font-display font-bold text-lg text-slate-800">
                  Available Timeslots
                </h3>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center space-y-4" id="slots-loading-indicator">
                <Loader2 className="w-8 h-8 animate-spin text-clinic-accent mx-auto" />
                <p className="text-xs font-medium text-slate-400">
                  Loading available slots for {formattedSelectedDate}...
                </p>
              </div>
            ) : filteredSlotsForDisplay.length === 0 ? (
              <div className="py-12 text-center space-y-3" id="no-slots-alert">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-slate-700">All appointment slots are fully booked</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  No slots are available for {formattedSelectedDate}. Please select another date or
                  call our clinic reception at (555) 234-5678 to standby for emergency openings.
                </p>
              </div>
            ) : (
              <div className="space-y-6" id="slots-categories">
                {morningSlots.length > 0 && (
                  <div className="space-y-3" id="morning-slots-group">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Morning Appointments
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {morningSlots.map((slot) => {
                        const isBooking = bookingSlot === slot;
                        return (
                          <button
                            key={slot}
                            disabled={bookingSlot !== null}
                            onClick={() => handleBookSlot(slot)}
                            className={`group p-3 sm:p-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex flex-col items-center justify-center gap-1.5 relative cursor-pointer ${
                              isBooking
                                ? 'bg-clinic-accent/10 border-clinic-accent text-clinic-primary font-bold animate-pulse'
                                : 'bg-slate-50 hover:bg-clinic-primary hover:text-white hover:border-clinic-primary border-slate-200 text-slate-700'
                            }`}
                            id={`timeslot-btn-${slot.replace(':', '-').replace(' ', '-')}`}
                          >
                            {isBooking ? (
                              <Loader2 className="w-4 h-4 animate-spin text-clinic-primary" />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                            )}
                            <span>{slot}</span>
                            {!user && (
                              <span className="text-[9px] text-slate-400 group-hover:text-slate-200 font-medium">
                                Guest Lock
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {afternoonSlots.length > 0 && (
                  <div className="space-y-3" id="afternoon-slots-group">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Afternoon Appointments
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {afternoonSlots.map((slot) => {
                        const isBooking = bookingSlot === slot;
                        return (
                          <button
                            key={slot}
                            disabled={bookingSlot !== null}
                            onClick={() => handleBookSlot(slot)}
                            className={`group p-3 sm:p-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex flex-col items-center justify-center gap-1.5 relative cursor-pointer ${
                              isBooking
                                ? 'bg-clinic-accent/10 border-clinic-accent text-clinic-primary font-bold animate-pulse'
                                : 'bg-slate-50 hover:bg-clinic-primary hover:text-white hover:border-clinic-primary border-slate-200 text-slate-700'
                            }`}
                            id={`timeslot-btn-${slot.replace(':', '-').replace(' ', '-')}`}
                          >
                            {isBooking ? (
                              <Loader2 className="w-4 h-4 animate-spin text-clinic-primary" />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                            )}
                            <span>{slot}</span>
                            {!user && (
                              <span className="text-[9px] text-slate-400 group-hover:text-slate-200 font-medium">
                                Guest Lock
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div
            className="bg-gradient-to-r from-clinic-primary to-slate-800 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-md relative overflow-hidden"
            id="booking-sidebar-summary"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white/80 animate-pulse" />
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-white/90">
                Booking Summary
              </h4>
            </div>

            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="space-y-0.5">
                <span className="text-[10px] text-white/70 block uppercase tracking-wider">
                  Dental Treatment
                </span>
                <span className="font-bold text-sm text-white block">{selectedService}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-white/70 block uppercase tracking-wider">
                  Selected Day
                </span>
                <span className="font-bold text-sm text-white block">{formattedSelectedDate}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-white/70 block uppercase tracking-wider">
                    Est. Cost
                  </span>
                  {(() => {
                    const priceInfo = getServiceDisplayPrice(activeServiceDetails);
                    return (
                      <span className="font-bold text-sm text-white block">
                        {priceInfo.hasDiscount ? (
                          <>
                            <span className="line-through text-white/50 mr-1.5">{priceInfo.original}</span>
                            <span className="text-emerald-300">{priceInfo.current}+</span>
                          </>
                        ) : (
                          `${priceInfo.original}+`
                        )}
                      </span>
                    );
                  })()}
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-white/70 block uppercase tracking-wider">
                    Duration
                  </span>
                  <span className="font-bold text-sm text-white block">
                    {activeServiceDetails.duration}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-[11px] text-white/70 leading-relaxed space-y-2">
              <p>
                Click any available timeslot on the left to finalize. Standard appointment
                consultation guidelines apply.
              </p>
            </div>
          </div>

          {/* Clinical Roster */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-slate-950 text-xs uppercase tracking-wide">
              Clinical Roster ({selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
            </h4>
            <div className="space-y-3.5">
              {isLoadingAvailability ? (
                <div className="py-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-clinic-primary mx-auto" />
                  <p className="text-xs text-slate-400 mt-1">Loading availability...</p>
                </div>
              ) : displayStaff.length === 0 ? (
                <div className="py-2 text-slate-400 text-xs leading-relaxed italic">
                  {availableDoctorIds.length > 0 
                    ? 'No specialists available on this day.' 
                    : 'No doctors configured yet.'}
                </div>
              ) : (
                displayStaff.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3" id={`clinical-roster-doc-${doc.id}`}>
                    {doc.image ? (
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-clinic-primary/10 text-clinic-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                        {doc.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs text-slate-900 block leading-none">{doc.name}</span>
                      <span className="text-[10px] text-slate-400 block">{doc.title}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-slate-950 text-xs uppercase tracking-wide">
              Clinic Policies
            </h4>
            <div className="space-y-3 text-xs text-slate-500">
              <p>
                <strong>No Deposit Required:</strong> We do not charge scheduling or holding fees.
                You pay only after your treatment.
              </p>
              <p>
                <strong>Free Rescheduling:</strong> Change or cancel your appointment free of charge
                anytime from your dashboard up to 2 hours prior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};