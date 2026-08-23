import React, { useState } from 'react';
import { Trophy, RotateCcw, Award, Sparkles, Share2, ExternalLink, ArrowRight, ShieldCheck, Flame, Check, Copy, Plus, Layers } from 'lucide-react';
import { Project } from '../types';
import { sound } from '../utils/audio';
import { trackShare } from '../lib/analytics';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  traysStacked: number;
  maxCombo: number;
  perfectDrops: number;
  heightMeters: number;
  project: Project | null;
  isNewRank1: boolean;
  currentRank: number;
  onPlayAgain: () => void;
  onChangeProject: () => void;
  onRegisterProject?: (score: number) => void;
  onOpenCertificate: () => void;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  traysStacked,
  maxCombo,
  perfectDrops,
  heightMeters,
  project,
  isNewRank1,
  currentRank,
  onPlayAgain,
  onChangeProject,
  onRegisterProject,
  onOpenCertificate,
  onClose,
}) => {
  const [copiedType, setCopiedType] = useState<'link' | 'discord' | null>(null);

  if (!isOpen) return null;

  const isGuestMode = !project;
  const projectName = project ? project.name : 'Sesi Arcade';
  const projectHandle = project ? project.handle : '@builder';

  const appUrl = window.location.origin.includes('ai.studio') || window.location.origin.includes('localhost') 
    ? 'https://omprengbid.ai.studio' 
    : window.location.origin;
  const precisionPercent = traysStacked > 0 ? Math.round((perfectDrops / traysStacked) * 100) : 0;

  // Pre-formatted text for X (Twitter)
  const twitterMessage = isGuestMode
    ? `🍱 Baru aja numpuk ${traysStacked} ompreng stainless (${heightMeters}m, Max Combo x${maxCombo}) dapet skor ${score.toLocaleString()} pts di OmprengBid by @mikaships_dev! 🇮🇩✨\n\nAda yang bisa nandingin tingginya? Coba sekarang di:\n${appUrl}\n#OmprengBid #IndieHackerID #BuildInPublic`
    : `🍱 Baru aja numpuk ${traysStacked} ompreng stainless demi naikin ranking ${projectHandle} ke posisi #${currentRank} di OmprengBid by @mikaships_dev! (${score.toLocaleString()} pts) 🇮🇩✨\n\nBantu naikin rankingnya di:\n${appUrl}\n#OmprengBid #IndieHackerID #BuildInPublic`;

  // Pre-formatted Markdown for Discord
  const discordMessage = isGuestMode
    ? `🍱 **OmprengBid — Tumpukan Ompreng Run**\n🏆 **Skor:** \`${score.toLocaleString()} pts\` | 🍱 **Tumpukan:** \`${traysStacked} Ompreng (${heightMeters}m)\`\n🔥 **Max Combo:** \`x${maxCombo}\` | ✨ **Presisi:** \`${perfectDrops} perfect (${precisionPercent}%)\`\n👉 Mainkan & daftarkan proyekmu: <${appUrl}>`
    : `🍱 **OmprengBid — Tumpukan Ompreng Run**\n🏆 **Skor:** \`${score.toLocaleString()} pts\` | 🍱 **Tumpukan:** \`${traysStacked} Ompreng (${heightMeters}m)\`\n🔥 **Max Combo:** \`x${maxCombo}\` | ✨ **Presisi:** \`${perfectDrops} perfect (${precisionPercent}%)\`\n🚀 **Mendukung:** \`${projectName} (${projectHandle})\`\n👉 Mainkan sekarang: <${appUrl}>`;

  const handleShareTwitter = () => {
    sound.playClick();
    trackShare('twitter', projectName);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMessage)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyDiscord = async () => {
    sound.playClick();
    trackShare('discord', projectName);
    try {
      await navigator.clipboard.writeText(discordMessage);
      setCopiedType('discord');
      setTimeout(() => setCopiedType(null), 2500);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  };

  const handleShareGeneral = async () => {
    sound.playClick();
    trackShare('copy', projectName);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `OmprengBid: Menara ${traysStacked} Ompreng (${score.toLocaleString()} pts)`,
          text: `Saya menumpuk ${traysStacked} ompreng (${score.toLocaleString()} pts) di OmprengBid!`,
          url: appUrl,
        });
      } catch {
        // user dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${twitterMessage}`);
        setCopiedType('link');
        setTimeout(() => setCopiedType(null), 2500);
      } catch (e) {
        console.error('Copy failed', e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E49]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Banner Header */}
        <div className="bg-[#071E49] p-5 sm:p-6 text-center text-white relative overflow-hidden border-b border-slate-700">
          {isNewRank1 && (
            <div className="inline-flex items-center space-x-1.5 bg-[#D1B06C] text-[#071E49] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2.5 shadow-sm">
              <Trophy className="w-3.5 h-3.5" />
              <span>Peringkat #1 Baru!</span>
            </div>
          )}

          <div className="text-xs text-[#D1B06C] font-medium">
            Sesi Tumpukan Ompreng Selesai
          </div>

          {/* Primary High-Impact Stats Row */}
          <div className="mt-2 grid grid-cols-3 gap-2 divide-x divide-slate-700/80 bg-slate-800/60 border border-slate-700/80 p-3 rounded-xl">
            {/* Score */}
            <div>
              <div className="text-[11px] text-slate-400 font-medium">
                Total Skor
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">
                {score.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#D1B06C] font-sans font-medium">
                pts
              </div>
            </div>

            {/* Trays Stacked */}
            <div className="pl-2">
              <div className="text-[11px] text-slate-400 font-medium">
                Tumpukan Ompreng
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">
                {traysStacked}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {heightMeters} m
              </div>
            </div>

            {/* Highest Combo Multiplier */}
            <div className="pl-2">
              <div className="text-[11px] text-slate-400 font-medium">
                Max Combo
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#D1B06C] mt-0.5 flex items-center justify-center space-x-0.5">
                <Flame className="w-4 h-4 text-orange-400 inline" />
                <span>x{maxCombo}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {perfectDrops} presisi ({precisionPercent}%)
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* If Guest Mode: Call to Action to Register Project with this Score */}
          {isGuestMode ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-[#D1B06C]/40 p-4 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-[#071E49]">
                <Sparkles className="w-4 h-4 text-[#D1B06C]" />
                <span className="font-bold text-sm">Punya Proyek atau Side-Project?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Klaim rekor <strong className="text-[#071E49]">{traysStacked} ompreng ({score.toLocaleString()} pts)</strong> ini buat jadi modal awal startup lu di leaderboard. Langsung nongkrong di ranking atas tanpa mulai dari nol!
              </p>
              {onRegisterProject && (
                <button
                  id="btn-claim-score-register"
                  onClick={() => {
                    sound.playClick();
                    onRegisterProject(traysStacked);
                  }}
                  className="w-full bg-[#071E49] hover:bg-[#0c2a63] text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-lg shadow-xs flex items-center justify-center space-x-2 transition active:scale-95 mt-1"
                >
                  <Plus className="w-4 h-4 text-[#D1B06C]" />
                  <span>Pasang Proyek Pake Rekor Ini</span>
                </button>
              )}
            </div>
          ) : (
            /* Project Summary Card */
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[11px] text-slate-500 font-medium">
                  Proyek yang Didukung
                </div>
                <div className="text-sm font-semibold text-[#071E49] flex items-center space-x-1.5">
                  <span>{project.name}</span>
                  {project.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#D1B06C]" />}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {project.handle}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] text-slate-500 font-medium">
                  Peringkat
                </div>
                <div className="text-xl font-bold font-mono text-[#071E49]">
                  #{currentRank}
                </div>
                <div className="text-[11px] font-mono text-[#D1B06C] font-semibold">
                  Rekor: {project.bestScore} ompreng
                </div>
              </div>
            </div>
          )}

          {/* Prominent Share Your Score Section */}
          <div className="bg-[#071E49]/5 border border-[#071E49]/10 p-4 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#071E49]">
                <Share2 className="w-4 h-4 text-[#D1B06C]" />
                <span>Pamerkan Rekor Anda</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Ajak Komunitas
              </span>
            </div>

            {/* Share action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Share to X (Twitter) */}
              <button
                id="btn-share-twitter"
                onClick={handleShareTwitter}
                className="w-full bg-[#071E49] hover:bg-[#0c2a63] text-white text-xs font-medium py-2.5 px-3 rounded-lg flex items-center justify-center space-x-2 transition shadow-xs active:scale-95"
              >
                <svg className="w-3.5 h-3.5 fill-current text-[#D1B06C]" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Bagikan ke X</span>
              </button>

              {/* Copy for Discord */}
              <button
                id="btn-share-discord"
                onClick={handleCopyDiscord}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2.5 px-3 rounded-lg flex items-center justify-center space-x-2 transition shadow-xs active:scale-95"
              >
                {copiedType === 'discord' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Disalin untuk Discord!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Salin Format Discord</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Link Share */}
            <button
              id="btn-share-link"
              onClick={handleShareGeneral}
              className="w-full bg-white hover:bg-slate-100 text-[#071E49] border border-slate-200 text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition"
            >
              {copiedType === 'link' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Teks & Tautan Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5 text-[#D1B06C]" />
                  <span>Salin Pesan / Buka Menu Berbagi</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2 pt-1">
            {/* Play Again CTA */}
            <button
              id="btn-play-again"
              onClick={() => {
                sound.playClick();
                onPlayAgain();
              }}
              className="w-full bg-[#D1B06C] hover:bg-[#c4a15b] text-[#071E49] font-semibold text-sm py-3 rounded-xl shadow-xs flex items-center justify-center space-x-2 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Main Lagi (Tumpuk Ulang)</span>
            </button>

            {/* Certificate Button */}
            <button
              id="btn-view-certificate"
              onClick={() => {
                sound.playClick();
                onOpenCertificate();
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-[#071E49] font-medium text-xs py-2.5 px-3 rounded-xl border border-slate-200 flex items-center justify-center space-x-1.5 transition"
            >
              <Award className="w-4 h-4 text-[#D1B06C]" />
              <span>Lihat Kartu Bukti Rekor</span>
            </button>

            {/* Bottom Nav Links */}
            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
              <button
                onClick={onChangeProject}
                className="hover:text-[#071E49] transition underline-offset-2 hover:underline"
              >
                {isGuestMode ? 'Tautkan ke Proyek di Leaderboard' : 'Pilih Proyek Lain'}
              </button>

              <button
                onClick={onClose}
                className="text-[#071E49] font-medium hover:underline flex items-center space-x-1"
              >
                <span>Kembali ke Papan Peringkat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

