import React from 'react';
import { X, ShieldCheck, Sparkles, Trophy, Zap, Layers, Flame, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E49]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#071E49] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#162C5A] to-[#0A1D40] text-[#D1B06C] flex items-center justify-center font-mono border border-[#D1B06C]/40">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Regulasi & Mekanisme OmprengBid
              </h3>
              <p className="text-xs text-[#D1B06C]">
                Panduan Presisi & Mekanisme Stacking Menara Baki
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          {/* Section 1: Konsep & Tujuan */}
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-[#071E49] flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-[#D1B06C]" />
              <span>1. Konsep OmprengBid & Papan Peringkat</span>
            </h4>
            <p className="text-slate-600 font-normal">
              OmprengBid adalah arena gamifikasi viral yang menghubungkan para <strong>indie hackers, tech founders, dan software engineers</strong> Indonesia dalam tantangan arcade menara baki stainless steel. Semakin tinggi tumpukan ompreng stainless steel yang kamu capai, semakin tinggi posisi proyekmu di papan peringkat nasional.
            </p>
          </div>

          {/* Section 2: Mekanisme 2.5D Isometric Stacking */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-[#071E49] flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#071E49]" />
              <span>2. Mekanisme Stacking & Presisi</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                <div className="font-semibold text-xs text-[#071E49] flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D1B06C]" />
                  <span>Perfect Drop (&lt; 0.12u)</span>
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Ompreng otomatis terkunci simetris. Membuka kombo multiplier dan efek percikan emas harmonik.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                <div className="font-semibold text-xs text-[#071E49] flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>Restorasi Baki (Setiap 5 Kombo)</span>
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Mencapai kelipatan 5 kombo sempurna berturut-turut akan memulihkan lebar baki ompreng (+0.35 unit).
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                <div className="font-semibold text-xs text-[#071E49]">
                  ✂️ Pemotongan Presisi
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Bagian baki yang melewati batas akan terpotong secara gravitasi. Lebar baki berikutnya disesuaikan.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                <div className="font-semibold text-xs text-[#071E49]">
                  👑 Billboard #1 Champion
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Proyek dengan tumpukan tertinggi berhak menempati Billboard Utama paling atas dengan live link click.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Spesifikasi Ompreng */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1.5">
            <h4 className="font-semibold text-xs text-[#071E49]">
              Spesifikasi Baki Ompreng 2026:
            </h4>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>Material: Stainless Steel Food Grade SUS 304</li>
              <li>Konfigurasi: 5 Sekat Kompartemen Presisi</li>
              <li>Ketebalan Standar: 4.5 cm per baki (1.80m = 40 baki tumpukan)</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-[#071E49] hover:bg-[#0c2a63] text-white font-medium text-xs py-2.5 px-6 rounded-xl transition active:scale-95 shadow-xs"
          >
            Mengerti & Mulai Main
          </button>
        </div>

      </div>
    </div>
  );
};
