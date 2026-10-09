'use client';

import { SHARE_TEXT } from '../lib/shareText';
import { Share2 } from 'lucide-react';

export default function ShareButtons() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const encodedText = encodeURIComponent(SHARE_TEXT);
  const encodedUrl = encodeURIComponent(siteUrl);

  const whatsappUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;

  return (
    <div className="bg-surface rounded-xl border border-line p-4 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-ink font-semibold text-sm">
        <Share2 className="w-4 h-4 text-brand" />
        <span>Share with fellow aspirants</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-focus outline-none min-h-[44px]"
        >
          <span>WhatsApp</span>
        </a>

        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0088cc] hover:bg-[#0077b3] text-white text-sm font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-focus outline-none min-h-[44px]"
        >
          <span>Telegram</span>
        </a>
      </div>
    </div>
  );
}
