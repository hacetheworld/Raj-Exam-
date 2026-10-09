'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import SponsorBanner from '../components/SponsorBanner';
import AudioPlayer from '../components/AudioPlayer';
import QuizCard from '../components/QuizCard';
import ShareButtons from '../components/ShareButtons';
import StateCard from '../components/StateCard';
import { apiGet, ApiError } from '../lib/api';
import { formatDigestDate } from '../lib/dates';
import { Calendar } from 'lucide-react';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [digest, setDigest] = useState(null);
  const [banner, setBanner] = useState(null);
  const [errorState, setErrorState] = useState(null); // null | 'notReady' | 'error'
  const [latestDate, setLatestDate] = useState(null);
  const [isLatestAvailable, setIsLatestAvailable] = useState(false);

  const fetchBanner = async () => {
    try {
      const bannerData = await apiGet('/banner');
      setBanner(bannerData);
    } catch {
      setBanner(null);
    }
  };

  const fetchDigest = useCallback(async (dateParam = 'today') => {
    setLoading(true);
    setErrorState(null);
    try {
      const data = await apiGet(`/digests/${dateParam}`);
      setDigest(data);
      setIsLatestAvailable(dateParam !== 'today');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'DIGEST_NOT_FOUND') {
        setErrorState('notReady');
        setLatestDate(err.details?.latest_date || null);
      } else {
        setErrorState('error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDigest('today');
    fetchBanner();
  }, [fetchDigest]);

  const handleShowLatest = () => {
    if (latestDate) {
      fetchDigest(latestDate);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4">
        {/* Sponsor Banner at top */}
        <SponsorBanner banner={banner} />

        {loading ? (
          <StateCard variant="loading" />
        ) : errorState === 'notReady' ? (
          <StateCard
            variant="notReady"
            actionLabel={latestDate ? `Show latest available (${latestDate})` : null}
            onAction={latestDate ? handleShowLatest : null}
          />
        ) : errorState === 'error' ? (
          <StateCard variant="error" onAction={() => fetchDigest('today')} />
        ) : digest ? (
          <>
            {/* Date Heading */}
            <div className="bg-surface rounded-xl border border-line p-4 shadow-sm flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-ink">
                <Calendar className="w-5 h-5 text-brand" />
                <div>
                  <span className="text-xs text-muted font-medium uppercase tracking-wider block">
                    {isLatestAvailable ? 'Latest Available Digest' : 'Today'}
                  </span>
                  <h2 className="text-lg font-bold text-ink">
                    {formatDigestDate(digest.date)}
                  </h2>
                </div>
              </div>
              {digest.title && (
                <div className="text-right max-w-[50%]">
                  <span className="text-xs font-semibold text-brand truncate block">
                    {digest.title}
                  </span>
                </div>
              )}
            </div>

            {/* Audio Player Card */}
            <AudioPlayer audioUrl={digest.audio_url} scriptText={digest.script_text} />

            {/* Quiz Card */}
            <QuizCard questions={digest.questions} />

            {/* Share Buttons */}
            <ShareButtons />
          </>
        ) : null}
      </main>
    </div>
  );
}
