import './globals.css';
import { Noto_Sans_Devanagari } from 'next/font/google';

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari', 'latin'],
  variable: '--font-noto',
  display: 'swap',
});

export const metadata = {
  title: 'Raj Exam AI - Daily Audio Digest & MCQs',
  description: 'Daily 2.5-minute audio digest + 5 MCQs for Rajasthan competitive exam aspirants (RPSC, REET, Rajasthan Police, CET, Patwari).',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={notoSansDevanagari.variable}>
      <body className="bg-cream text-ink min-h-screen font-sans antialiased">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
