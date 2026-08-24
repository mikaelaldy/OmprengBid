import React, { useState } from 'react';
import { X, Volume2, VolumeX, ShieldCheck, Trophy, Sparkles, HelpCircle } from 'lucide-react';
import { Project, GameStats } from '../types';
import { ThreeStackEngine } from './ThreeStackEngine';
import { TutorialModal } from './TutorialModal';
import { sound } from '../utils/audio';

interface GameStageModalProps {
  isOpen: boolean;
  project?: Project | null;
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
    <div className="fixed inset-0 h-[100dvh] w-full z-50 flex flex-col bg-[#F8FAFC] select-none animate-in fade-in duration-150 overflow-hidden">
      
      {/* Tutorial Overlay Modal before or during the game */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onStartGame={() => setShowTutorial(false)}
        isPreGame={true}
      />

      {/* Top Game Stage Nav */}
      <div className="bg-white text-black px-3 sm:px-6 h-13 sm:h-14 flex items-center justify-between border-b border-black/10 z-30 shrink-0 gap-2">
        
        {/* Left: Project Representation */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 truncate">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black/5 text-black flex items-center justify-center font-mono font-bold text-xs border border-black/10 shrink-0">
            OB
          </div>
          <div className="min-w-0 truncate">
            <div className="flex items-center space-x-1 sm:space-x-1.5 truncate">
              <span className="text-[10px] sm:text-[11px] text-black/50 shrink-0">
                {project ? 'Dukung:' : 'Arcade:'}
              </span>
              <span className="font-semibold text-xs sm:text-sm text-white truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[260px]">
                {project ? project.name : 'Sesi Bebas'}
              </span>
              {project?.verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-black shrink-0" />
              )}
            </div>
            <div className="text-[9px] sm:text-[10px] text-black/50 font-mono truncate">
              {project 
                ? `${project.handle} • Rekor: ${project.bestScore.toLocaleString()} pts`
                : 'Target #1: ' + (rank1Project ? `${rank1Project.bestScore.toLocaleString()} pts (${rank1Project.name})` : '4,800 pts')}
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Tutorial / Guide Button */}
          <button
            onClick={() => {
              sound.playClick();
              setShowTutorial(true);
            }}
            className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[40px] text-xs font-medium text-black/80 hover:text-black bg-black/5 hover:bg-black/10 border border-black/10 rounded-lg transition"
            title="Buka Tutorial & Cara Main"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
            <span className="hidden sm:inline">Tutorial</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-black/65 hover:text-black bg-black/5 hover:bg-black/10 border border-black/10 rounded-lg transition"
            title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-black" />
            )}
          </button>

          {/* Close / Exit Button */}
          <button
            onClick={onClose}
            className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[40px] text-xs font-medium text-black/80 hover:text-black bg-black/5 hover:bg-black/10 border border-black/10 rounded-lg transition active:scale-95"
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
