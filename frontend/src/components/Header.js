'use client';

import { useRouter } from 'next/navigation';
import { LogOut, BookOpen } from 'lucide-react';
import { createClient } from '../lib/supabase/client';

export default function Header() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <header className="bg-surface border-b border-line px-4 py-3 sticky top-0 z-10 shadow-sm">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-brand text-surface rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-ink">Raj Exam AI</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 text-sm font-medium text-muted hover:text-ink px-3 py-1.5 rounded-lg hover:bg-cream transition-colors focus:ring-2 focus:ring-focus outline-none min-h-[44px]"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
