/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: 'patient' | 'admin' | 'staff';
}

export interface Appointment {
  id: number;
  patientId: number;
  date: string;
  time: string;
  dentist: string;
  status: 'Pending' | 'Confirmed' | 'Arrived' | 'Completed' | 'No Show' | 'Canceled';
  service: string;
  autoCanceled?: boolean;
  patientName?: string;
}

export interface Staff {
  id: number;
  name: string;
  title: string;
  image: string;
  isFeatured: boolean;
  bio?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  category?: string;
  promotionActive?: boolean;
  promotionDetails?: string;
  discountPercent?: string;
  discountAmount?: string;
}