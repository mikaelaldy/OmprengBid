import React, { useState } from 'react';
import { X, Sparkles, Flame, Layers, Keyboard, MousePointer, Award, ArrowRight, CheckCircle2, Trophy, HelpCircle, Scissors } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] flex flex-col border border-black/10 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-white text-black p-5 sm:p-6 flex items-center justify-between border-b border-black/10 shrink-0 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-black/[0.05] text-black flex items-center justify-center font-mono">
              <HelpCircle className="w-5 h-5 text-black/60" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Tutorial & Cara Bermain
              </h3>
              <p className="text-xs text-black/50">
                Panduan Tumpuk Menara Ompreng Stainless Steel
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

        {/* Tab Navigation */}
        <div className="flex border-b border-black/10 bg-black/[0.02] px-5 pt-3 gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('basics');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'basics'
                ? 'border-black text-black'
                : 'border-transparent text-black/55 hover:text-black/75'
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
                ? 'border-black text-black'
                : 'border-transparent text-black/55 hover:text-black/75'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-black/50" />
            <span>2. Perfect & Restorasi</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('tips');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'tips'
                ? 'border-black text-black'
                : 'border-transparent text-black/55 hover:text-black/75'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-black/60" />
            <span>3. Peringkat Billboard</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-black/75 leading-relaxed flex-1">
          
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <div className="bg-black/[0.02] border border-black/10 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                  <MousePointer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm">
                    Cara Menjatuhkan Ompreng
                  </h4>
                  <p className="text-black/65 text-xs mt-1">
                    Ompreng bergerak bolak-balik secara otomatis. <strong>Klik pada layar</strong>, <strong>ketuk (tap) di HP</strong>, atau tekan tombol <kbd className="bg-white border border-black/18 px-1.5 py-0.5 rounded text-[11px] font-mono text-black shadow-2xs">SPACE</kbd> di keyboard untuk menjatuhkan ompreng ke atas menara.
                  </p>
                </div>
              </div>

              <div className="bg-black/[0.02] border border-black/10 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-black/[0.05] flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4 text-black/60" />
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm">
                    Mekanisme Pemotongan Presisi
                  </h4>
                  <p className="text-black/65 text-xs mt-1">
                    Setiap bagian ompreng yang melewati tepi alas sebelumnya akan terpotong. Ukuran ompreng berikutnya akan <strong>mengecil mengikuti sisa ompreng yang mendarat</strong>.
                  </p>
                </div>
              </div>

              <div className="bg-black/[0.03] border border-black/10 rounded-lg p-3.5 text-xs text-black/70 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-black/50 shrink-0" />
                <span>
                  <strong>Game Over:</strong> Permainan berakhir jika ompreng yang dijatuhkan meleset seluruhnya dari ompreng di bawahnya.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'combo' && (
            <div className="space-y-4">
              <div className="bg-black/[0.02] border border-black/10 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm flex items-center gap-1.5">
                    <span>Perfect Drop (&lt; 0.12 unit)</span>
                    <span className="bg-black/[0.05] text-black text-[10px] px-2 py-0.2 rounded-full font-mono">Combo!</span>
                  </h4>
                  <p className="text-black/65 text-xs mt-1">
                    Jika ompreng dijatuhkan sangat pas dengan ompreng di bawahnya, posisinya otomatis terkunci rapi tanpa terpotong! Kamu mendapatkan <strong>bonus poin combo</strong> yang berlipat ganda (x2, x3, x4, dst).
                  </p>
                </div>
              </div>

              <div className="bg-black/[0.02] border border-black/10 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-black/[0.05] text-black flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-black/60" />
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm flex items-center gap-1.5">
                    <span>Restorasi Ompreng (Kelipatan 5 Combo)</span>
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.2 rounded-full font-mono">+0.35u</span>
                  </h4>
                  <p className="text-black/65 text-xs mt-1">
                    Omprengmu sudah terpotong dan mengecil? Tenang! Setiap berhasil mencapai <strong>5 combo sempurna beruntun</strong> (5x, 10x, 15x...), lebar ompreng akan otomatis <strong>diperlebar kembali</strong>!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 bg-black/[0.03] border border-black/10 rounded-lg">
                  <div className="text-black/55 text-[11px] font-medium">Streak 1-4</div>
                  <div className="text-xs font-bold text-black mt-0.5">Multiplier poin naik</div>
                </div>
                <div className="p-2.5 bg-black/[0.03] border border-black/10 rounded-lg">
                  <div className="text-black/55 text-[11px] font-medium">Streak ke-5</div>
                  <div className="text-xs font-bold text-black mt-0.5">Ukuran ompreng pulih</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-4">
              <div className="bg-black/[0.02] border border-black/10 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm">
                    Dongkrak Proyek ke Billboard #1
                  </h4>
                  <p className="text-black/65 text-xs mt-1">
                    Setiap kamu bermain, skor dan jumlah tumpukan ompreng akan otomatis diakumulasikan ke proyek yang kamu pilih. Proyek dengan tumpukan tertinggi berhak menjadi <strong>Juara Bertahan</strong> di Billboard Utama!
                  </p>
                </div>
              </div>

              <div className="bg-black/[0.02] border border-black/10 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-black/[0.05] text-black flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-black/60" />
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm">
                    Kartu bukti rekor & share
                  </h4>
                  <p className="text-black/65 text-xs mt-1">
                    Setelah sesi berakhir, kamu bisa mencetak Kartu Bukti Rekor atau membagikan rekor tumpukanmu ke X (Twitter) & Discord.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-black/10 flex items-center justify-between shrink-0">
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-black/55">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Tekan <kbd className="px-1 py-0.5 bg-black/[0.05] border border-black/18 rounded text-[10px] font-mono">Spasi</kbd> untuk main</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            {activeTab !== 'tips' ? (
              <button
                onClick={() => {
                  sound.playClick();
                  if (activeTab === 'basics') setActiveTab('combo');
                  else if (activeTab === 'combo') setActiveTab('tips');
                }}
                className="px-4 py-2.5 text-xs font-medium text-black/65 hover:text-black bg-black/[0.05] hover:bg-black/[0.09] rounded-xl transition flex items-center space-x-1"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}

            <button
              onClick={handleStart}
              className="bg-black hover:bg-neutral-800 text-white font-semibold text-xs py-2.5 px-5 rounded-lg transition active:scale-95 flex items-center space-x-2"
            >
              <span>{isPreGame ? 'Saya Mengerti, Mulai Main!' : 'Tutup Tutorial'}</span>
              <Sparkles className="w-3.5 h-3.5 text-black/50" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
