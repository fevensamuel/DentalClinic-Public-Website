/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import { getPublicAnnouncement } from '../api';

export const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    getPublicAnnouncement()
      .then(text => {
        if (text) setAnnouncement(text);
      })
      .catch(() => {});
  }, []);

  if (!announcement || announcement.toUpperCase().includes('DISCOUNTTTTT')) return null;

  return (
    <div
      className="bg-sky-600 text-white px-4 py-2 text-center font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border-b border-sky-700 shadow-2xs"
      id="public-announcement-banner"
    >
      <Megaphone className="w-4 h-4 shrink-0 text-sky-200" />
      <span>📢 {announcement}</span>
    </div>
  );
};
