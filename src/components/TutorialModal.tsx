import React, { useState } from 'react';
import { X, Sparkles, Flame, Layers, Keyboard, MousePointer, Award, ArrowRight, CheckCircle2, Trophy, HelpCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame?: () => void;
  isPreGame?: boolean;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  isPreGame = true,
}) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'combo' | 'tips'>('basics');

  if (!isOpen) return null;

  const handleStart = () => {
    sound.playClick();
    if (onStartGame) {
      onStartGame();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E49]/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#071E49] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#162C5A] to-[#0A1D40] text-[#D1B06C] flex items-center justify-center font-mono border border-[#D1B06C]/40 shadow-xs">
              <HelpCircle className="w-5 h-5 text-[#D1B06C]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Tutorial & Cara Bermain OmprengBid
              </h3>
              <p className="text-xs text-[#D1B06C]">
                Panduan Presisi Stacking Menara Baki Stainless Steel
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('basics');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'basics'
                ? 'border-[#071E49] text-[#071E49]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Dasar & Kontrol</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('combo');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'combo'
                ? 'border-[#071E49] text-[#071E49]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D1B06C]" />
            <span>2. Perfect & Restorasi</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('tips');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'tips'
                ? 'border-[#071E49] text-[#071E49]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>3. Peringkat Billboard</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed flex-1">
          
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#071E49] text-white flex items-center justify-center shrink-0">
                  <MousePointer className="w-4 h-4 text-[#D1B06C]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#071E49] text-sm">
                    Cara Menjatuhkan Baki
                  </h4>
                  <p className="text-slate-600 text-xs mt-1">
                    Baki ompreng bergerak bolak-balik secara otomatis. <strong>Klik pada layar</strong>, <strong>ketuk (tap) di HP</strong>, atau tekan tombol <kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-800 shadow-2xs">SPACE</kbd> di keyboard untuk menjatuhkan baki ke atas menara.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#071E49] text-white flex items-center justify-center shrink-0">
                  <span className="text-base">✂️</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#071E49] text-sm">
                    Mekanisme Pemotongan Presisi
                  </h4>
                  <p className="text-slate-600 text-xs mt-1">
                    Setiap bagian baki yang melewati tepi alas sebelumnya akan terpotong secara gravitasi. Lebar baki berikutnya akan <strong>mengecil mengikuti sisa baki yang mendarat</strong>.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Game Over:</strong> Permainan berakhir jika baki yang dijatuhkan meleset seluruhnya dari baki di bawahnya.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'combo' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#071E49] text-sm flex items-center gap-1.5">
                    <span>Perfect Drop (&lt; 0.12 unit)</span>
                    <span className="bg-[#D1B06C]/20 text-[#071E49] text-[10px] px-2 py-0.2 rounded-full font-mono">Combo!</span>
                  </h4>
                  <p className="text-slate-600 text-xs mt-1">
                    Jika baki dijatuhkan sangat pas dengan baki di bawahnya, baki akan terkunci secara simetris tanpa terpotong! Kamu mendapatkan <strong>bonus poin kombo</strong> yang terus berlipat ganda (x2, x3, x4, dst).
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#071E49] text-sm flex items-center gap-1.5">
                    <span>Restorasi Baki (Kelipatan 5 Kombo)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.2 rounded-full font-mono">+0.35u</span>
                  </h4>
                  <p className="text-slate-600 text-xs mt-1">
                    Baki kamu sudah terpotong dan mengecil? Tenang! Setiap berhasil mencapai <strong>5 kombo sempurna beruntun</strong> (5x, 10x, 15x...), lebar baki ompreng akan otomatis <strong>diperluas kembali</strong>!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 bg-slate-100/70 border border-slate-200 rounded-xl">
                  <div className="text-slate-500 text-[11px] font-medium">Streak 1-4</div>
                  <div className="text-xs font-bold text-[#071E49] mt-0.5">Multiplier Poin Naik ⚡</div>
                </div>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="text-emerald-700 text-[11px] font-medium">Streak ke-5</div>
                  <div className="text-xs font-bold text-emerald-800 mt-0.5">Ukuran Baki Pulih 🍱</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#071E49] text-[#D1B06C] flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#071E49] text-sm">
                    Dongkrak Proyek ke Billboard #1
                  </h4>
                  <p className="text-slate-600 text-xs mt-1">
                    Setiap kamu bermain, skor dan jumlah tumpukan baki akan otomatis diakumulasikan ke proyek/startup yang kamu wakili. Proyek dengan tumpukan tertinggi berhak menjadi <strong>Reigning #1 Champion</strong> di Billboard Utama!
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#071E49] text-[#D1B06C] flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#071E49] text-sm">
                    Sertifikat Prestasi & Berbagi Skor
                  </h4>
                  <p className="text-slate-600 text-xs mt-1">
                    Setelah sesi berakhir, kamu bisa mencetak Sertifikat Prestasi Menara Baki atau membagikan rekor tumpukanmu ke X (Twitter) & Discord.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Tekan <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono">Spasi</kbd> untuk main</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            {activeTab !== 'tips' ? (
              <button
                onClick={() => {
                  sound.playClick();
                  if (activeTab === 'basics') setActiveTab('combo');
                  else if (activeTab === 'combo') setActiveTab('tips');
                }}
                className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center space-x-1"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}

            <button
              onClick={handleStart}
              className="bg-[#071E49] hover:bg-[#0c2a63] text-white font-semibold text-xs py-2.5 px-5 rounded-xl transition active:scale-95 shadow-xs flex items-center space-x-2"
            >
              <span>{isPreGame ? 'Saya Mengerti, Mulai Main!' : 'Tutup Tutorial'}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#D1B06C]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
