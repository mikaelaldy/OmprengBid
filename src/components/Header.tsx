import React, { useState } from 'react';
import { Volume2, VolumeX, Plus, ShieldCheck, Info, Award, ExternalLink, HelpCircle, Cloud } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  onOpenSubmit: () => void;
  onOpenRegulations: () => void;
  onOpenTutorial?: () => void;
  totalProjectsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSubmit,
  onOpenRegulations,
  onOpenTutorial,
  totalProjectsCount,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="bg-[#071E49] border-b border-slate-700/60 sticky top-0 z-30 shadow-xs">
      {/* Top micro bar */}
      <div className="bg-[#051636] text-slate-300 px-4 sm:px-8 py-1.5 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-slate-200">Global Cloud Sync (Firestore)</span>
          <span className="text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-400">
            Papan Peringkat Real-Time Multi-Player
          </span>
        </div>
        <div className="flex items-center space-x-3 shrink-0 text-xs">
          <span className="hidden md:inline text-slate-400">
            Material: <strong className="text-slate-200 font-medium">SUS 304 Stainless Steel</strong>
          </span>
          <span className="bg-slate-800 text-[#D1B06C] px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border border-slate-700 flex items-center space-x-1">
            <Cloud className="w-3 h-3 text-emerald-400" />
            <span>{totalProjectsCount} Proyek Global</span>
          </span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between">
        {/* Brand identity & Crest */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#162C5A] to-[#0A1D40] text-[#D1B06C] flex items-center justify-center border border-[#D1B06C]/40 shadow-xs shrink-0 font-mono font-bold text-sm">
            OB
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-white text-xl sm:text-2xl font-bold tracking-tight">
                Ompreng<span className="text-[#D1B06C]">Bid</span>
              </h1>
              <span className="hidden sm:inline-block text-[11px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 font-medium">
                2.5D Arcade
              </span>
            </div>
            <p className="text-slate-400 text-xs font-normal">
              Arena Menara Baki untuk Indie Hackers & Tech Founders
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
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
            title="Panduan & Regulasi"
          >
            <Info className="w-3.5 h-3.5 text-[#D1B06C]" />
            <span>Regulasi</span>
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

          {/* Submit New Project CTA */}
          <button
            id="btn-submit-project-header"
            onClick={onOpenSubmit}
            className="bg-[#D1B06C] hover:bg-[#c4a15b] text-[#071E49] font-semibold px-4 py-2 rounded-lg text-xs sm:text-sm shadow-xs flex items-center space-x-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Daftar Proyek</span>
          </button>
        </div>
      </div>
    </header>
  );
};
