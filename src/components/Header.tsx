import React, { useState } from 'react';
import { Volume2, VolumeX, Plus, Info, HelpCircle, Users, Eye, Play } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  onOpenSubmit: () => void;
  onOpenRegulations: () => void;
  onOpenTutorial?: () => void;
  onStartGame?: () => void;
  liveVisitors?: number;
  totalVisitors?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSubmit,
  onOpenRegulations,
  onOpenTutorial,
  onStartGame,
  liveVisitors = 1,
  totalVisitors = 1,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="bg-[#071E49] border-b border-slate-700/60 sticky top-0 z-30 shadow-xs">
      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between">
        {/* Brand identity & Crest */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-[#071E49] p-1 border border-slate-600/80 shadow-md shrink-0 flex items-center justify-center">
            {/* SVG MBG 5-Compartment Tray Logo */}
            <svg viewBox="0 0 100 75" className="w-full h-full drop-shadow-sm">
              <defs>
                <linearGradient id="mbg-rim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <linearGradient id="mbg-cavity" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>
              {/* Outer stainless steel frame */}
              <rect x="2" y="2" width="96" height="71" rx="6" fill="url(#mbg-rim)" stroke="#64748b" strokeWidth="2" />
              <rect x="5" y="5" width="90" height="65" rx="4" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
              
              {/* Top 3 compartments */}
              <rect x="8" y="8" width="24" height="26" rx="3" fill="url(#mbg-cavity)" stroke="#475569" strokeWidth="1" />
              <rect x="36" y="8" width="28" height="26" rx="3" fill="url(#mbg-cavity)" stroke="#475569" strokeWidth="1" />
              <rect x="68" y="8" width="24" height="26" rx="3" fill="url(#mbg-cavity)" stroke="#475569" strokeWidth="1" />
              
              {/* Bottom wide carb & round soup compartments */}
              <rect x="8" y="38" width="52" height="29" rx="3" fill="url(#mbg-cavity)" stroke="#475569" strokeWidth="1" />
              <circle cx="78" cy="52.5" r="14.5" fill="url(#mbg-cavity)" stroke="#475569" strokeWidth="1" />

              {/* Gold arcade accent on rice tray */}
              <circle cx="20" cy="46" r="2.5" fill="#D1B06C" opacity="0.9" />
              <circle cx="34" cy="52" r="2" fill="#D1B06C" opacity="0.7" />
              <circle cx="48" cy="46" r="2.5" fill="#D1B06C" opacity="0.9" />
            </svg>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-white text-xl sm:text-2xl font-bold tracking-tight">
                Ompreng<span className="text-[#D1B06C]">Bid</span>
              </h1>
            </div>
            <p className="text-slate-400 text-xs font-normal">
              Etalase Proyek Indie Hacker & Builder Nusantara
            </p>
          </div>
        </div>

        {/* Live Visitor & Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Real-time Visitor Stats Indicator */}
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs">
            <div className="flex items-center space-x-1.5" title="Pengunjung Online Saat Ini">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono font-bold text-emerald-400">{liveVisitors}</span>
              <span className="text-slate-400 hidden xs:inline text-[11px]">live</span>
            </div>

            <span className="text-slate-600">|</span>

            <div className="flex items-center space-x-1 text-slate-300" title="Total Kunjungan">
              <Eye className="w-3 h-3 text-slate-400" />
              <span className="font-mono font-medium text-slate-200">{totalVisitors.toLocaleString()}</span>
              <span className="text-slate-400 hidden md:inline text-[11px]">views</span>
            </div>
          </div>

          {/* Tutorial / Guide Button */}
          {onOpenTutorial && (
            <button
              id="btn-tutorial-header"
              onClick={onOpenTutorial}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition"
              title="Cara Bermain & Tutorial"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#D1B06C]" />
              <span>Tutorial</span>
            </button>
          )}

          {/* Regulations / Info */}
          <button
            id="btn-regulations"
            onClick={onOpenRegulations}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition"
            title="Cara Main & Aturan"
          >
            <Info className="w-3.5 h-3.5 text-[#D1B06C]" />
            <span>Cara Main</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={handleToggleMute}
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition"
            title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#D1B06C]" />
            )}
          </button>

          {/* Submit Project Secondary CTA */}
          <button
            id="btn-submit-project-header"
            onClick={onOpenSubmit}
            className="hidden md:flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition shrink-0"
            title="Daftarkan Proyek / Startup"
          >
            <Plus className="w-3.5 h-3.5 text-[#D1B06C]" />
            <span>Daftar Proyek</span>
          </button>

          {/* Primary Play Game CTA */}
          <button
            id="btn-play-game-header"
            onClick={() => {
              sound.playClick();
              if (onStartGame) onStartGame();
            }}
            className="bg-[#D1B06C] hover:bg-[#c4a15b] text-[#071E49] font-bold px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm shadow-xs flex items-center space-x-1.5 transition active:scale-95 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Main Sekarang</span>
          </button>
        </div>
      </div>
    </header>
  );
};

