import React from 'react';
import { Trophy, Crown, ExternalLink, Play, Sparkles, ShieldCheck, Eye, MousePointerClick, Flame, Award } from 'lucide-react';
import { Project } from '../types';
import { incrementClickCount } from '../utils/storage';
import { sound } from '../utils/audio';

interface BillboardBannerProps {
  rank1Project: Project;
  onPlayProject: (project?: Project) => void;
  onSelectProject: () => void;
  onOpenCertificate?: (project: Project) => void;
}

export const BillboardBanner: React.FC<BillboardBannerProps> = ({
  rank1Project,
  onPlayProject,
  onSelectProject,
  onOpenCertificate,
}) => {
  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    incrementClickCount(rank1Project.id);
  };

  return (
    <div className="relative overflow-hidden bg-white border border-black/10 rounded-lg text-black">
      {/* Top Banner Ribbon */}
      <div className="bg-black/[0.03] text-black/65 px-5 py-2.5 flex items-center justify-between text-xs border-b border-black/10">
        <div className="flex items-center space-x-2">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-semibold text-black tracking-wide">SPOT UTAMA #1</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="hidden sm:inline text-black/50">
            Didukung builder komunitas dengan rekor {rank1Project.bestScore.toLocaleString()} pts
          </span>
          <span className="bg-[#D1B06C]/15 text-[#D1B06C] border border-[#D1B06C]/30 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
            Live #1
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 lg:p-7 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left / Center Info (8 columns) */}
          <div className="lg:col-span-8 space-y-3.5">
            {/* Badges & Category */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#D1B06C]/10 border border-[#D1B06C]/30 text-[#D1B06C] text-xs font-medium px-2.5 py-1 rounded-md flex items-center space-x-1.5">
                <Crown className="w-3.5 h-3.5 text-[#D1B06C]" />
                <span>Juara Bertahan</span>
              </span>

              <span className="bg-black/[0.03] border border-black/10 text-black/65 text-xs font-medium px-2.5 py-1 rounded-md">
                {rank1Project.category}
              </span>

              {rank1Project.verified && (
                <span className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium px-2.5 py-1 rounded-md flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Katalog Terverifikasi</span>
                </span>
              )}
            </div>

            {/* Project Title & Tagline */}
            <div>
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  {rank1Project.name}
                </h2>
                <span className="text-[#D1B06C] font-mono text-sm font-medium">
                  {rank1Project.handle}
                </span>
              </div>
              <p className="text-black/65 text-sm font-normal mt-1.5 max-w-2xl leading-relaxed">
                {rank1Project.tagline}
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 max-w-lg">
              {/* Best Score */}
              <div className="bg-black/[0.03] border border-black/10 p-2 sm:px-3.5 sm:py-2 rounded-xl text-center sm:text-left">
                <div className="text-[10px] sm:text-[11px] text-black/50 font-medium truncate">
                  Rekor Skor
                </div>
                <div className="text-base sm:text-2xl font-bold text-black font-mono flex items-baseline justify-center sm:justify-start space-x-0.5 sm:space-x-1 mt-0.5">
                  <span className="truncate">{rank1Project.bestScore.toLocaleString()}</span>
                  <span className="text-[10px] sm:text-xs text-[#D1B06C] font-sans font-medium">pts</span>
                </div>
              </div>

              {/* Total Runs */}
              <div className="bg-black/[0.03] border border-black/10 p-2 sm:px-3.5 sm:py-2 rounded-xl text-center sm:text-left">
                <div className="text-[10px] sm:text-[11px] text-black/50 font-medium truncate">
                  Total Ronde
                </div>
                <div className="text-base sm:text-2xl font-bold text-black font-mono mt-0.5">
                  {rank1Project.runsCount}
                </div>
                <div className="text-[9px] sm:text-[11px] text-black/50 font-mono hidden sm:block">
                  permainan
                </div>
              </div>

              {/* Live Clicks */}
              <div className="bg-black/[0.03] border border-black/10 p-2 sm:px-3.5 sm:py-2 rounded-xl text-center sm:text-left">
                <div className="text-[10px] sm:text-[11px] text-black/50 font-medium truncate flex items-center justify-center sm:justify-start space-x-1">
                  <MousePointerClick className="w-3 h-3 text-[#D1B06C] shrink-0 hidden sm:inline" />
                  <span className="truncate">Kunjungan</span>
                </div>
                <div className="text-base sm:text-2xl font-bold text-[#D1B06C] font-mono mt-0.5">
                  {rank1Project.clicksCount}
                </div>
                <div className="text-[9px] sm:text-[11px] text-black/50 font-mono hidden sm:block">
                  klik langsung
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Column (4 columns) */}
          <div className="lg:col-span-4 flex flex-col space-y-2.5">
            {/* Primary Game CTA: Play Now Directly to Beat #1 */}
            <button
              id="btn-stack-to-beat-rank1"
              onClick={() => {
                sound.playClick();
                onPlayProject();
              }}
              className="w-full bg-[#071E49] hover:bg-[#0A2558] text-white font-medium text-xs sm:text-sm px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition active:scale-95 text-center"
            >
              <Play className="w-4 h-4 fill-current text-[#071E49]" />
              <span>Main Sekarang & Tantang #1</span>
            </button>

            {/* Direct Project External Link Button */}
            <a
              id="btn-visit-rank1-project"
              href={rank1Project.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleExternalClick}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 shadow-xs flex items-center justify-center space-x-2 transition active:scale-95 text-center"
            >
              <span>Kunjungi {rank1Project.name}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#D1B06C]" />
            </a>

            {/* Boost Rank 1 directly or Select other project */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                id="btn-boost-rank1-directly"
                onClick={() => onPlayProject(rank1Project)}
                className="bg-white hover:bg-black/5 text-black/80 hover:text-black font-medium text-[11px] px-2.5 py-2 rounded-lg border border-black/10 flex items-center justify-center space-x-1 transition active:scale-95 truncate"
              >
                <span>Dukung #{rank1Project.name}</span>
              </button>

              <button
                id="btn-choose-other-project"
                onClick={onSelectProject}
                className="bg-white hover:bg-black/5 text-black/80 hover:text-black font-medium text-[11px] px-2.5 py-2 rounded-lg border border-black/10 flex items-center justify-center space-x-1 transition active:scale-95"
              >
                <span>Pilih Proyek Lain</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const CrownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
  </svg>
);
