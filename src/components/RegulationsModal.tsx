import React from 'react';
import { X, ShieldCheck, Sparkles, Trophy, Layers, Flame, ShieldAlert, Trash2, ExternalLink, AlertOctagon, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#071E49]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90dvh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#071E49] text-white p-4 sm:p-6 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#162C5A] to-[#0A1D40] text-[#D1B06C] flex items-center justify-center font-mono border border-[#D1B06C]/40 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Aturan, Larangan & Regulasi
              </h3>
              <p className="text-xs text-[#D1B06C]">
                Panduan Komunitas, Kebijakan Konten & Leaderboard
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          {/* Section 1: Konsep & Tujuan */}
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-[#071E49] flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-[#D1B06C]" />
              <span>1. Tentang OmprengBid</span>
            </h4>
            <p className="text-slate-600 font-normal">
              OmprengBid adalah etalase proyek untuk <strong>indie hackers, tech founders, dan software engineers</strong> Indonesia. Gak perlu bakar duit ads, cukup tumpuk ompreng stainless setinggi-tingginya untuk membuktikan daya tahan proyekmu dan rebut posisi puncak di leaderboard.
            </p>
          </div>

          {/* Section 2: Mekanisme 3 Poin Utama */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-[#071E49] flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#071E49]" />
              <span>2. Aturan & Mekanisme Game</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                <div className="font-semibold text-xs text-[#071E49] flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D1B06C]" />
                  <span>Tap / Klik Presisi</span>
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Jatuhkan ompreng pas di tengah. Kalo meleset, pinggirannya bakal kepotong dan ompreng makin menciut.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                <div className="font-semibold text-xs text-[#071E49] flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>Combo Sempurna</span>
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Tumpuk sempurna berturut-turut buat dapet bonus skor dan balikin ukuran ompreng yang kepotong.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1 sm:col-span-2">
                <div className="font-semibold text-xs text-[#071E49] flex items-center space-x-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#D1B06C]" />
                  <span>Rebut Spot Puncak #1</span>
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Proyek dengan tumpukan ompreng tertinggi bakal dipajang di billboard utama halaman depan dan mendapatkan exposure klik langsung dari komunitas.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Kebijakan Konten & Proyek Terlarang (Zero-Tolerance) */}
          <div className="bg-rose-50/60 border border-rose-200 p-4 rounded-xl space-y-3">
            <h4 className="font-semibold text-sm text-rose-950 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>3. Kategori Proyek Terlarang (Zero Tolerance)</span>
            </h4>
            <p className="text-xs text-rose-900 leading-normal">
              Untuk menjaga ekosistem inovasi yang sehat, aman, dan bermanfaat bagi publik, OmprengBid <strong>melarang keras pendaftaran proyek</strong> yang memuat atau memfasilitasi:
            </p>

            <ul className="space-y-1.5 text-xs text-rose-900 list-none pl-0">
              <li className="flex items-start space-x-2">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span><strong>Judi Online & Taruhan:</strong> Slot gacor, kasino, togel, bandar taruhan, agen judi, atau bentuk perjudian digital lainnya.</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span><strong>Pornografi & Konten Dewasa:</strong> Konten vulgar, pornografi, jasa esek-esek, atau eksploitasi seksual.</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span><strong>Ujaran Kebencian & SARA:</strong> Konten diskriminatif, rasisme, pelecehan suku/agama, atau propaganda ekstremisme/terorisme.</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span><strong>Penipuan & Skema Ilegal:</strong> Phishing, scam, money game, arisan bodong, skema Ponzi, atau pinjol ilegal.</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span><strong>Malware & Pembajakan:</strong> Virus, trojan, keylogger, software bajakan (cracked/nulled), atau tools hacking berbahaya.</span>
              </li>
            </ul>

            <div className="bg-white/80 p-2.5 rounded-lg border border-rose-200 text-[11px] text-rose-800">
              ⚡ <strong>Sanksi:</strong> Sistem secara otomatis memfilter pendaftaran dengan kata kunci terlarang. Proyek yang lolos namun terbukti melanggar akan segera dihapus permanen dari database tanpa pemberitahuan.
            </div>
          </div>

          {/* Section 4: Hak Kepemilikan & Penghapusan Proyek */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
            <h4 className="font-semibold text-xs text-[#071E49] flex items-center space-x-1.5">
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
              <span>4. Hak Kepemilikan & Penghapusan Proyek</span>
            </h4>
            <p className="text-xs text-slate-600 leading-normal">
              Untuk melindungi proyek dari penghapusan sembarangan, setiap proyek dilindungi oleh sistem autentikasi:
            </p>
            <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pl-1">
              <li><strong>Pemilik Proyek (Creator):</strong> Builder yang mendaftarkan proyek saat login dengan akun Google memiliki hak penuh untuk menghapus proyeknya sendiri kapan saja.</li>
              <li><strong>Master Moderator & Admin:</strong> Akun admin (<code className="text-[#071E49] font-mono bg-slate-200 px-1 py-0.5 rounded text-[11px]">mikaelaldy56@gmail.com</code>) memiliki otoritas moderasi untuk membersihkan proyek ilegal atau melanggar aturan.</li>
              <li>Pengunjung publik biasa tidak dapat menghapus proyek milik builder lain.</li>
            </ul>
          </div>

          {/* Section 5: Creator / Developer Credit */}
          <div className="bg-gradient-to-r from-slate-50 to-amber-50/40 border border-slate-200 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#071E49]">
                Created & Developed by mikaships
              </span>
              <span className="text-[11px] text-[#D1B06C] font-medium font-mono">@mikaships</span>
            </div>
            <p className="text-xs text-slate-600">
              Dibangun untuk meramaikan ekosistem indie tech & startup Indonesia. Yuk terhubung dan saling follow:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://www.threads.com/@mikaships"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200 shadow-2xs transition"
              >
                <span>Threads (@mikaships)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href="https://x.com/mikaships_dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200 shadow-2xs transition"
              >
                <span>Twitter / X (@mikaships_dev)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-[#071E49] hover:bg-[#0c2a63] text-white font-medium text-xs py-2.5 px-6 rounded-xl transition active:scale-95 shadow-xs"
          >
            Mengerti & Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

