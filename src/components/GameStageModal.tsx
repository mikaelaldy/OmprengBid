import React, { useState } from 'react';
import { X, Volume2, VolumeX, ShieldCheck, Trophy, Sparkles, HelpCircle } from 'lucide-react';
import { Project, GameStats } from '../types';
import { ThreeStackEngine } from './ThreeStackEngine';
import { TutorialModal } from './TutorialModal';
import { sound } from '../utils/audio';

interface GameStageModalProps {
  isOpen: boolean;
  project: Project;
  rank1Project?: Project;
  onClose: () => void;
  onGameOver: (stats: {
    score: number;
    traysStacked: number;
    maxCombo: number;
    perfectDrops: number;
    heightMeters: number;
  }) => void;
}

export const GameStageModal: React.FC<GameStageModalProps> = ({
  isOpen,
  project,
  rank1Project,
  onClose,
  onGameOver,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [showTutorial, setShowTutorial] = useState(true);

  if (!isOpen) return null;

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F8FAFC] select-none animate-in fade-in duration-150">
      
      {/* Tutorial Overlay Modal before or during the game */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onStartGame={() => setShowTutorial(false)}
        isPreGame={true}
      />

      {/* Top Game Stage Nav */}
      <div className="bg-[#071E49] text-white px-4 sm:px-6 h-14 flex items-center justify-between border-b border-slate-700 shadow-xs z-30 shrink-0">
        
        {/* Left: Project Representation */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#162C5A] to-[#0A1D40] text-[#D1B06C] flex items-center justify-center font-mono font-bold text-xs border border-[#D1B06C]/40">
            OB
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-slate-400">
                Memperkokoh:
              </span>
              <span className="font-semibold text-sm text-white truncate max-w-[140px] sm:max-w-[260px]">
                {project.name}
              </span>
              {project.verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-[#D1B06C]" />
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Builder: {project.handle} • Rekor: {project.bestScore} baki
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center space-x-2">
          {/* Tutorial / Guide Button */}
          <button
            onClick={() => {
              sound.playClick();
              setShowTutorial(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            title="Buka Tutorial & Cara Main"
          >
            <HelpCircle className="w-4 h-4 text-[#D1B06C]" />
            <span className="hidden sm:inline">Tutorial</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#D1B06C]" />
            )}
          </button>

          {/* Close / Exit Button */}
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition active:scale-95"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>

      </div>

      {/* 3D Stacking Engine Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <ThreeStackEngine
          project={project}
          rank1Project={rank1Project}
          isPaused={showTutorial}
          onOpenTutorial={() => setShowTutorial(true)}
          onGameOver={onGameOver}
        />
      </div>

    </div>
  );
};
