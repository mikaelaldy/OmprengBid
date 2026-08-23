import React from 'react';
import { X, ShieldCheck, Sparkles, Trophy, Zap, Layers, Flame, CheckCircle2, ExternalLink } from 'lucide-react';

interface RegulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegulationsModal: React.FC<RegulationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-xl w-full max-h-[85vh] flex flex-col border border-black/10 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-white text-black p-5 sm:p-6 flex items-center justify-between border-b border-black/10 shrink-0 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-black/[0.05] text-black flex items-center justify-center font-mono border border-black/15">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Cara Main & Aturan
              </h3>
              <p className="text-xs text-black/60">
                Panduan Tumpuk Ompreng & Papan Peringkat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-black/45 hover:text-black p-1.5 rounded-lg hover:bg-black/[0.05] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-black/75 leading-relaxed">
          
          {/* Section 1: Konsep & Tujuan */}
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-black flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-black/50" />
              <span>1. Tentang OmprengBid</span>
            </h4>
            <p className="text-black/65 font-normal">
              OmprengBid adalah etalase proyek untuk <strong>indie hackers, tech founders, dan software engineers</strong> Indonesia. Gak perlu bakar duit ads, cukup tumpuk ompreng stainless setinggi-tingginya untuk membuktikan daya tahan proyekmu dan rebut posisi puncak di leaderboard.
            </p>
          </div>

          {/* Section 2: Mekanisme 3 Poin Utama */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-black flex items-center space-x-2">
              <Layers className="w-4 h-4 text-black/50" />
              <span>2. Aturan & Mekanisme Game</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-black/[0.02] border border-black/10 p-3.5 rounded-xl space-y-1">
                <div className="font-semibold text-xs text-black flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-black/50" />
                  <span>Tap / Klik Presisi</span>
                </div>
                <p className="text-xs text-black/55 font-normal">
                  Jatuhkan ompreng pas di tengah. Kalo meleset, pinggirannya bakal kepotong dan ompreng makin menciut.
                </p>
              </div>

              <div className="bg-black/[0.02] border border-black/10 p-3.5 rounded-xl space-y-1">
                <div className="font-semibold text-xs text-black flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5 text-black/40" />
                  <span>Combo Sempurna</span>
                </div>
                <p className="text-xs text-black/55 font-normal">
                  Tumpuk sempurna berturut-turut buat dapet bonus skor dan balikin ukuran ompreng yang kepotong.
                </p>
              </div>

              <div className="bg-black/[0.02] border border-black/10 p-3.5 rounded-xl space-y-1 sm:col-span-2">
                <div className="font-semibold text-xs text-black flex items-center space-x-1.5">
                  <Trophy className="w-3.5 h-3.5 text-black/50" />
                  <span>Rebut Spot Puncak #1</span>
                </div>
                <p className="text-xs text-black/55 font-normal">
                  Proyek dengan tumpukan ompreng tertinggi bakal dipajang di billboard utama halaman depan dan mendapatkan exposure klik langsung dari komunitas.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Spesifikasi Ompreng */}
          <div className="bg-black/[0.02] border border-black/10 p-4 rounded-xl space-y-1.5">
            <h4 className="font-semibold text-xs text-black">
              Spesifikasi Baki Ompreng 2026:
            </h4>
            <ul className="text-xs text-black/65 space-y-1 list-disc list-inside">
              <li>Material: Stainless Steel Food Grade SUS 304</li>
              <li>Konfigurasi: 5 Sekat Kompartemen Presisi</li>
              <li>Ketebalan Standar: 4.5 cm per baki (1.80m = 40 baki tumpukan)</li>
            </ul>
          </div>

          {/* Section 4: Creator / Developer Credit */}
          <div className="bg-black/[0.03] border border-black/10 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-black">
                Created & Developed by mikaships
              </span>
              <span className="text-[11px] text-black/60 font-medium font-mono">@mikaships</span>
            </div>
            <p className="text-xs text-black/65">
              Dibangun untuk meramaikan ekosistem indie tech & startup Indonesia. Yuk terhubung dan saling follow:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://www.threads.com/@mikaships"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-black/[0.04] text-black rounded-lg text-xs font-medium border border-black/10 shadow-2xs transition"
              >
                <span>Threads (@mikaships)</span>
                <ExternalLink className="w-3 h-3 text-black/45" />
              </a>
              <a
                href="https://x.com/mikaships_dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-black/[0.04] text-black rounded-lg text-xs font-medium border border-black/10 shadow-2xs transition"
              >
                <span>Twitter / X (@mikaships_dev)</span>
                <ExternalLink className="w-3 h-3 text-black/45" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-black/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-black hover:bg-neutral-800 text-white font-medium text-xs py-2.5 px-6 rounded-xl transition active:scale-95 shadow-xs"
          >
            Mengerti & Mulai Main
          </button>
        </div>

      </div>
    </div>
  );
};
