import React from 'react';
import { Trophy, ExternalLink, Play, Sparkles, ShieldCheck, Eye, MousePointerClick, Flame, Award } from 'lucide-react';
import { Project } from '../types';
import { incrementClickCount } from '../utils/storage';
import { sound } from '../utils/audio';

interface BillboardBannerProps {
  rank1Project: Project;
  onPlayProject: (project: Project) => void;
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
    <div className="relative overflow-hidden bg-gradient-to-br from-[#071E49] via-[#0B2556] to-[#071E49] border border-slate-700/70 rounded-2xl shadow-sm text-white">
      {/* Top Banner Ribbon */}
      <div className="bg-[#051636]/90 text-slate-300 px-5 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Trophy className="w-3.5 h-3.5 text-[#D1B06C]" />
          <span className="font-semibold text-slate-100 tracking-wide">Papan Juara #1 Nasional</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="hidden sm:inline text-slate-400">
            Proyek Unggulan #1
          </span>
          <span className="bg-[#D1B06C]/10 text-[#D1B06C] border border-[#D1B06C]/30 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
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
              <span className="bg-slate-800/80 border border-slate-700 text-[#D1B06C] text-xs font-medium px-2.5 py-1 rounded-md flex items-center space-x-1.5">
                <CrownIcon className="w-3.5 h-3.5 text-[#D1B06C]" />
                <span>Peringkat 1</span>
              </span>

              <span className="bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-md">
                {rank1Project.category}
              </span>

              {rank1Project.verified && (
                <span className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium px-2.5 py-1 rounded-md flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Katalog Resmi</span>
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
              <p className="text-slate-300 text-sm font-normal mt-1.5 max-w-2xl leading-relaxed">
                {rank1Project.tagline}
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Best Score */}
              <div className="bg-slate-800/60 border border-slate-700/80 px-3.5 py-2 rounded-xl">
                <div className="text-[11px] text-slate-400 font-medium">
                  Rekor Menara
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono flex items-baseline space-x-1 mt-0.5">
                  <span>{rank1Project.bestScore}</span>
                  <span className="text-xs text-[#D1B06C] font-sans font-medium">Ompreng</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  ≈ {(rank1Project.bestScore * 0.045).toFixed(2)}m
                </div>
              </div>

              {/* Total Runs */}
              <div className="bg-slate-800/60 border border-slate-700/80 px-3.5 py-2 rounded-xl">
                <div className="text-[11px] text-slate-400 font-medium">
                  Total Ronde
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono mt-0.5">
                  {rank1Project.runsCount}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  permainan
                </div>
              </div>

              {/* Live Clicks */}
              <div className="bg-slate-800/60 border border-slate-700/80 px-3.5 py-2 rounded-xl">
                <div className="text-[11px] text-slate-400 font-medium flex items-center space-x-1">
                  <MousePointerClick className="w-3 h-3 text-[#D1B06C]" />
                  <span>Kunjungan Link</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#D1B06C] font-mono mt-0.5">
                  {rank1Project.clicksCount}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  klik langsung
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Column (4 columns) */}
          <div className="lg:col-span-4 flex flex-col space-y-2.5">
            {/* Direct Project External Link Button */}
            <a
              id="btn-visit-rank1-project"
              href={rank1Project.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleExternalClick}
              className="w-full bg-[#D1B06C] hover:bg-[#c4a15b] text-[#071E49] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center space-x-2 transition active:scale-95 text-center"
            >
              <span>Kunjungi {rank1Project.name}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#071E49]" />
            </a>

            {/* Primary Game CTA: Stack to Beat #1 */}
            <button
              id="btn-stack-to-beat-rank1"
              onClick={onSelectProject}
              className="w-full bg-white hover:bg-slate-50 text-[#071E49] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center space-x-2 transition border border-slate-200 active:scale-95"
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Tantang Juara #1</span>
            </button>

            {/* Instant Play for Rank 1 directly */}
            <button
              id="btn-boost-rank1-directly"
              onClick={() => onPlayProject(rank1Project)}
              className="w-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white font-medium text-xs px-4 py-2 rounded-xl border border-slate-700 flex items-center justify-center space-x-1.5 transition active:scale-95"
            >
              <Play className="w-3 h-3 text-[#D1B06C] fill-current" />
              <span>Dukung {rank1Project.name}</span>
            </button>
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
