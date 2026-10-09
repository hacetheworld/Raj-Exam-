'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function AudioPlayer({ audioUrl, scriptText }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState('0:00');
  const [durationStr, setDurationStr] = useState('0:00');
  const [showScript, setShowScript] = useState(false);

  // Web Speech API fallback state
  const [speakingDeviceVoice, setSpeakingDeviceVoice] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setProgress((cur / dur) * 100);
    setCurrentTimeStr(formatTime(cur));
    setDurationStr(formatTime(dur));
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const seekTime = (e.target.value / 100) * (audioRef.current.duration || 0);
    audioRef.current.currentTime = seekTime;
    setProgress(e.target.value);
  };

  const changeSpeed = (speed) => {
    setPlaybackRate(speed);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDeviceVoiceSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speakingDeviceVoice) {
      window.speechSynthesis.cancel();
      setSpeakingDeviceVoice(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scriptText);
      utterance.lang = 'hi-IN';
      utterance.rate = playbackRate;
      utterance.onend = () => setSpeakingDeviceVoice(false);
      utterance.onerror = () => setSpeakingDeviceVoice(false);
      setSpeakingDeviceVoice(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-line p-5 mb-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h3 className="font-bold text-ink text-lg flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-brand" />
          <span>Daily Audio Digest</span>
        </h3>
        {!audioUrl && (
          <span className="text-xs bg-cream text-muted px-2 py-1 rounded border border-line">
            Using device voice
          </span>
        )}
      </div>

      {audioUrl ? (
        <div className="space-y-4">
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />

          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-brand hover:bg-brand-dark text-surface flex items-center justify-center transition-colors focus:ring-2 focus:ring-focus outline-none shrink-0"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full accent-brand h-2 bg-cream rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted">
                <span>{currentTimeStr}</span>
                <span>{durationStr}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <span className="text-xs font-medium text-muted">Speed:</span>
            {[1.0, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => changeSpeed(speed)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors focus:ring-2 focus:ring-focus outline-none min-h-[36px] ${
                  playbackRate === speed
                    ? 'bg-brand text-surface border-brand'
                    : 'bg-surface text-ink border-line hover:bg-cream'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={handleDeviceVoiceSpeech}
            className="w-full py-3 bg-brand hover:bg-brand-dark text-surface font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-focus outline-none min-h-[44px] flex items-center justify-center gap-2 text-base"
          >
            {speakingDeviceVoice ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{speakingDeviceVoice ? 'Stop Reading' : 'Listen with Device Voice'}</span>
          </button>
        </div>
      )}

      {/* Script Toggle */}
      <div className="pt-2 border-t border-line">
        <button
          onClick={() => setShowScript(!showScript)}
          className="flex items-center justify-between w-full text-sm font-semibold text-brand hover:text-brand-dark transition-colors py-1 focus:ring-2 focus:ring-focus outline-none rounded"
        >
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>{showScript ? 'Hide script' : 'Read script'}</span>
          </span>
          {showScript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showScript && (
          <div className="mt-3 p-4 bg-cream rounded-lg text-ink text-sm leading-relaxed whitespace-pre-line border border-line font-serif">
            {scriptText}
          </div>
        )}
      </div>
    </div>
  );
}
