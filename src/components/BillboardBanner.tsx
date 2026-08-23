import React from 'react';
import { Trophy, ExternalLink, Play, Sparkles, ShieldCheck, Eye, MousePointerClick, Flame, Award } from 'lucide-react';
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
    <div className="relative overflow-hidden bg-white border border-black/15 rounded-lg">
      {/* Top Banner Ribbon */}
      <div className="bg-black/[0.03] px-5 py-2.5 flex items-center justify-between text-xs border-b border-black/10">
        <div className="flex items-center space-x-2">
          <Flame className="w-3.5 h-3.5 text-black/60" />
          <span className="font-semibold text-black tracking-wide">Spot utama #1</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="hidden sm:inline text-black/50">
            Didukung builder komunitas dengan rekor {rank1Project.bestScore} ompreng
          </span>
          <span className="bg-black/[0.04] text-black/60 border border-black/10 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
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
              <span className="bg-[#D1B06C] text-black text-xs font-semibold px-2.5 py-1 rounded-md flex items-center space-x-1.5">
                <CrownIcon className="w-3.5 h-3.5 text-black" />
                <span>Juara Bertahan</span>
              </span>

              <span className="bg-white border border-black/15 text-black/70 text-xs font-medium px-2.5 py-1 rounded-md">
                {rank1Project.category}
              </span>

              {rank1Project.verified && (
                <span className="border border-black/15 text-black/70 text-xs font-medium px-2.5 py-1 rounded-md flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Katalog Terverifikasi</span>
                </span>
              )}
            </div>

            {/* Project Title & Tagline */}
            <div>
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black tracking-tight">
                  {rank1Project.name}
                </h2>
                <span className="text-black/50 font-mono text-sm font-medium">
                  {rank1Project.handle}
                </span>
              </div>
              <p className="text-black/60 text-sm font-normal mt-1.5 max-w-2xl leading-relaxed">
                {rank1Project.tagline}
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Best Score */}
              <div className="bg-black/[0.03] border border-black/10 px-3.5 py-2 rounded-lg">
                <div className="text-[11px] text-black/50 font-medium">
                  Rekor Menara
                </div>
                <div className="text-xl sm:text-2xl font-bold text-black font-mono flex items-baseline space-x-1 mt-0.5">
                  <span>{rank1Project.bestScore}</span>
                  <span className="text-xs text-black/50 font-sans font-medium">Ompreng</span>
                </div>
                <div className="text-[11px] text-black/45 font-mono">
                  ≈ {(rank1Project.bestScore * 0.045).toFixed(2)}m
                </div>
              </div>

              {/* Total Runs */}
              <div className="bg-black/[0.03] border border-black/10 px-3.5 py-2 rounded-lg">
                <div className="text-[11px] text-black/50 font-medium">
                  Total Ronde
                </div>
                <div className="text-xl sm:text-2xl font-bold text-black font-mono mt-0.5">
                  {rank1Project.runsCount}
                </div>
                <div className="text-[11px] text-black/45 font-mono">
                  permainan
                </div>
              </div>

              {/* Live Clicks */}
              <div className="bg-black/[0.03] border border-black/10 px-3.5 py-2 rounded-lg">
                <div className="text-[11px] text-black/50 font-medium flex items-center space-x-1">
                  <MousePointerClick className="w-3 h-3 text-black/40" />
                  <span>Kunjungan Link</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-black/60 font-mono mt-0.5">
                  {rank1Project.clicksCount}
                </div>
                <div className="text-[11px] text-black/45 font-mono">
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
              className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition active:scale-95 text-center"
            >
              <Play className="w-4 h-4 fill-current text-white" />
              <span>Main Sekarang & Tantang #1</span>
            </button>

            {/* Direct Project External Link Button */}
            <a
              id="btn-visit-rank1-project"
              href={rank1Project.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleExternalClick}
              className="w-full bg-white hover:bg-black/[0.04] text-black font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg border border-black/15 flex items-center justify-center space-x-2 transition active:scale-95 text-center"
            >
              <span>Kunjungi {rank1Project.name}</span>
              <ExternalLink className="w-3.5 h-3.5 text-black/50" />
            </a>

            {/* Boost Rank 1 directly or Select other project */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                id="btn-boost-rank1-directly"
                onClick={() => onPlayProject(rank1Project)}
                className="bg-white hover:bg-black/[0.04] text-black/70 hover:text-black font-medium text-[11px] px-2.5 py-2 rounded-lg border border-black/15 flex items-center justify-center space-x-1 transition active:scale-95 truncate"
              >
                <span>Dukung #{rank1Project.name}</span>
              </button>

              <button
                id="btn-choose-other-project"
                onClick={onSelectProject}
                className="bg-white hover:bg-black/[0.04] text-black/70 hover:text-black font-medium text-[11px] px-2.5 py-2 rounded-lg border border-black/15 flex items-center justify-center space-x-1 transition active:scale-95"
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
