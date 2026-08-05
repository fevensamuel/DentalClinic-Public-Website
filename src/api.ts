/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Appointment, Staff } from './components/types';
import { API_BASE, API_BASE_URL, getAuthToken, getAuthHeaders, apiCall } from './lib/apiClient';

export { API_BASE, API_BASE_URL, getAuthToken, getAuthHeaders, apiCall };

export interface DisplayPrice {
  original: string;
  current: string;
  hasDiscount: boolean;
  rawCurrent: number;
}

export function formatPrice(priceStr: string): string {
  if (!priceStr) return '0 ETB';
  const clean = priceStr.replace(/[^0-9]/g, '');
  if (!clean) {
    if (priceStr.toLowerCase().includes('free')) return '0 ETB';
    return priceStr;
  }
  return `${clean} ETB`;
}

export function getServiceDisplayPrice(service?: {
  price?: string;
  promotionActive?: boolean;
  discountPercent?: string;
  discountAmount?: string;
} | null): DisplayPrice {
  if (!service) {
    return { original: '0 ETB', current: '0 ETB', hasDiscount: false, rawCurrent: 0 };
  }
  const originalPriceStr = service.price || '0';
  const originalPriceNum = parseInt(originalPriceStr.replace(/[^0-9]/g, ''), 10) || 0;
  let hasDiscount = false;
  let currentPriceNum = originalPriceNum;

  if (service.promotionActive) {
    if (service.discountPercent && parseInt(service.discountPercent, 10) > 0) {
      hasDiscount = true;
      const pct = parseInt(service.discountPercent, 10);
      currentPriceNum = Math.round(originalPriceNum * (1 - pct / 100));
    } else if (service.discountAmount && service.discountAmount.trim() !== '') {
      hasDiscount = true;
      const amtNum = parseInt(service.discountAmount.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(amtNum)) currentPriceNum = amtNum;
    }
  }

  return {
    original: formatPrice(originalPriceStr),
    current: formatPrice(String(currentPriceNum)),
    hasDiscount,
    rawCurrent: currentPriceNum
  };
}

export function getLocalYMDString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ==========================================
// AUTH ENDPOINTS
// ==========================================

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Login failed. Please check your credentials.');
  }
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('dental_portal_auth_token', data.token);
    localStorage.setItem('token', data.token);
  }
  return data.user;
}

export async function signup(name: string, phone: string, password: string, email?: string): Promise<User> {
  const payload: any = { name: name.trim(), phone: phone.trim(), password };
  if (email && email.trim()) payload.email = email.trim().toLowerCase();

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Registration failed. Please try again.');
  }
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('dental_portal_auth_token', data.token);
    localStorage.setItem('token', data.token);
  }
  return data.user;
}

export async function getMe(): Promise<User> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const response = await fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to get user profile');
  const data = await response.json();
  return data.user;
}

// ==========================================
// APPOINTMENT ENDPOINTS
// ==========================================

export async function getAppointments(patientId: number): Promise<Appointment[]> {
  try {
    const token = getAuthToken();
    if (token) {
      const response = await fetch(`${API_BASE_URL}/appointments/me`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return data.map((a: any) => ({
            id: typeof a.id === 'string' ? parseInt(a.id.replace(/[^0-9]/g, '')) || a.id : a.id,
            patientId: typeof a.patientId === 'string' ? parseInt(a.patientId.replace(/[^0-9]/g, '')) || a.patientId : a.patientId,
            date: a.date || a.appointmentDate,
            time: a.time || a.appointmentTime,
            dentist: a.dentist || a.dentistName,
            status: a.status || 'Pending',
            service: a.service || a.serviceTitle,
            autoCanceled: a.autoCanceled || false
          }));
        }
        if (data && Array.isArray(data.appointments)) return data.appointments;
      }
    }
    return [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

export async function getAllAppointments(): Promise<(Appointment & { patientName?: string })[]> {
  try {
    const token = getAuthToken();
    if (!token) return [];
    const response = await fetch(`${API_BASE_URL}/admin/appointments`, { headers: getAuthHeaders() });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((a: any) => ({
          id: typeof a.id === 'string' ? parseInt(a.id.replace(/[^0-9]/g, '')) || a.id : a.id,
          patientId: typeof a.patientId === 'string' ? parseInt(a.patientId.replace(/[^0-9]/g, '')) || a.patientId : a.patientId,
          patientName: a.patientName || 'Unknown Patient',
          date: a.date || a.appointmentDate,
          time: a.time || a.appointmentTime,
          dentist: a.dentist || a.dentistName,
          status: a.status || 'Pending',
          service: a.service || a.serviceTitle,
          autoCanceled: a.autoCanceled || false
        }));
      }
    }
    return [];
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    return [];
  }
}

export async function cancelAppointment(appointmentId: string | number): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const id = typeof appointmentId === 'number' ? `app${appointmentId}` : appointmentId;
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    if (response.ok) {
      const data = await response.json();
      return data.success !== false;
    }
    return false;
  } catch (error) {
    console.error('Error canceling appointment:', error);
    return false;
  }
}

export async function updateAppointmentStatus(appointmentId: string | number, status: string): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const id = typeof appointmentId === 'number' ? `app${appointmentId}` : appointmentId;
    const response = await fetch(`${API_BASE_URL}/admin/appointments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status })
    });
    if (response.ok) {
      const data = await response.json();
      return data.success !== false;
    }
    return false;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return false;
  }
}

export async function bookSlot(
  patientId: number,
  timeSlot: string,
  serviceTitle: string = 'General Consultation',
  dateStr?: string,
  dentistName?: string,
  status: string = 'Confirmed'
): Promise<any> {
  let finalDate = dateStr;
  if (!finalDate) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    finalDate = getLocalYMDString(tomorrow);
  }
  const token = getAuthToken();
  if (!token) throw new Error('Please log in to book an appointment.');
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      serviceTitle,
      date: finalDate,
      time: timeSlot,
      dentistName: dentistName || 'Assigned Dentist',
      status
    })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to book appointment');
  }
  const data = await response.json();
  return data.appointment || data;
}

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

export async function getPublicAnnouncement(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/announcement`);
    if (response.ok) {
      const data = await response.json();
      return data.text || data.announcement || '';
    }
  } catch (error) { console.error('Error fetching announcement:', error); }
  return '';
}

export async function getServices(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/services`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.services)) return data.services;
    }
  } catch (error) { console.error('Error fetching services:', error); }
  return [];
}

export async function getDoctors(): Promise<{ id: string; name: string; title?: string; imageUrl?: string; isFeatured?: boolean; email?: string; phone?: string; bio?: string }[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((d: any) => ({
          id: d.id || d._id,
          name: d.name,
          title: d.title || d.specialty,
          imageUrl: d.imageUrl || '',
          isFeatured: d.isFeatured || false,
          email: d.email || '',
          phone: d.phone || '',
          bio: d.bio || ''
        }));
      }
    }
  } catch (error) { console.error('Error fetching doctors:', error); }
  return [];
}

export async function getStaff(): Promise<Staff[]> {
  const doctors = await getDoctors();
  return doctors.map((d, idx) => ({
    id: d.id, // ✅ Use the actual doctor ID from backend
    name: d.name,
    title: d.title || 'Dental Specialist',
    image: d.imageUrl || '',
    isFeatured: d.isFeatured || false,
    bio: d.bio || 'Experienced dental professional at our clinic.'
  }));
}

export async function getBlockedDates(): Promise<{ date: string; reason: string }[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/blocked-dates`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((b: any) => ({
          date: b.date,
          reason: b.reason || 'Clinic Closed / Under Maintenance'
        }));
      }
    }
  } catch (error) { console.error('Error fetching blocked dates:', error); }
  return [];
}

export async function getAvailableSlots(
  serviceTitle: string = 'General Consultation',
  dateStr?: string
): Promise<string[]> {
  let finalDate = dateStr;
  if (!finalDate) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    finalDate = getLocalYMDString(tomorrow);
  }
  try {
    const encodedService = encodeURIComponent(serviceTitle);
    const response = await fetch(`${API_BASE_URL}/slots?date=${finalDate}&serviceTitle=${encodedService}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.slots)) return data.slots;
    }
  } catch (error) { console.error('Error fetching slots:', error); }
  return ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM'];
}

export async function getAvailability(date: string): Promise<{ date: string; doctorIds: string[] } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/availability?date=${encodeURIComponent(date)}`);
    if (response.ok) {
      const data = await response.json();
      console.log('📡 Raw availability response:', data);
      
      // Case 1: It's an array of availability objects
      if (Array.isArray(data)) {
        const found = data.find((a: any) => a.date === date);
        console.log('📡 Found availability for date:', found);
        if (found) {
          return {
            date: found.date,
            doctorIds: found.doctorIds || []
          };
        }
        return null;
      }
      
      // Case 2: It's a single object with date and doctorIds
      if (data && typeof data === 'object') {
        // If it has the matching date
        if (data.date === date) {
          return {
            date: data.date,
            doctorIds: data.doctorIds || []
          };
        }
        // If it has a 'doctorIds' property but different date, it's the one we want
        if (data.doctorIds && Array.isArray(data.doctorIds)) {
          return {
            date: data.date || date,
            doctorIds: data.doctorIds
          };
        }
      }
      
      // Case 3: It's an empty object or null
      return null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching availability:', error);
    return null;
  }
}

export async function getClinicConfig(): Promise<any> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_BASE_URL}/admin/config`, { headers: getAuthHeaders() });
    if (response.ok) return await response.json();
    return null;
  } catch (error) { console.error('Error fetching clinic config:', error); return null; }
}

// ==========================================
// DEPRECATED MOCK FUNCTIONS
// ==========================================

export async function mockLogin(email: string, password: string): Promise<User> {
  return login(email, password);
}
export async function mockSignup(name: string, phone: string, password: string, email?: string): Promise<User> {
  return signup(name, phone, password, email);
}
export async function mockGetAppointments(patientId: number): Promise<Appointment[]> {
  return getAppointments(patientId);
}
export async function mockGetAllAppointments(): Promise<(Appointment & { patientName?: string })[]> {
  return getAllAppointments();
}
export async function mockUpdateAppointmentStatus(appointmentId: number, status: string): Promise<boolean> {
  return updateAppointmentStatus(`app${appointmentId}`, status);
}
export async function mockGetAvailableSlots(serviceTitle?: string, dateStr?: string): Promise<string[]> {
  return getAvailableSlots(serviceTitle || 'General Consultation', dateStr);
}
export async function mockBookSlot(
  patientId: number,
  timeSlot: string,
  serviceTitle?: string,
  dateStr?: string,
  dentistName?: string,
  status?: string
): Promise<any> {
  return bookSlot(patientId, timeSlot, serviceTitle || 'General Consultation', dateStr, dentistName, status || 'Confirmed');
}
export async function mockGetAnnouncement(): Promise<string> {
  return getPublicAnnouncement();
}
export async function mockGetServices(): Promise<any[]> {
  return getServices();
}
export async function mockGetStaff(): Promise<Staff[]> {
  return getStaff();
}
export async function mockCancelAppointment(appointmentId: number): Promise<boolean> {
  return cancelAppointment(`app${appointmentId}`);
}
export function resetMockData(): void {
  localStorage.removeItem('dental_portal_auth_token');
  localStorage.removeItem('token');
  localStorage.removeItem('dental_portal_users');
  localStorage.removeItem('dental_portal_appointments');
  localStorage.removeItem('dental_portal_slots');
  localStorage.removeItem('dental_portal_staff');
  window.location.reload();
}
export const getMockConfig = () => ({ 
  announcement: '', 
  services: [], 
  availability: {}, 
  blockedDates: [],
  doctorsList: [],
  featuredDoctorId: '',
  featuredDoctorBio: '',
  featuredDoctorImage: '',
  bookingCutoffTime: '14:00'
});