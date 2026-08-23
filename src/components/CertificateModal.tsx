import React, { useRef } from 'react';
import { X, Award, ShieldCheck, Download, Share2, Printer, CheckCircle2 } from 'lucide-react';
import { Project } from '../types';
import { sound } from '../utils/audio';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  score: number;
  heightMeters: number;
  playerHandle?: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  project,
  score,
  heightMeters,
  playerHandle,
}) => {
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const dateStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const certNumber = `OB/STACK/${new Date().getFullYear()}/${String(score).padStart(3, '0')}-${project.id.slice(-4).toUpperCase()}`;

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E49]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header bar */}
        <div className="bg-[#071E49] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center space-x-2.5">
            <Award className="w-5 h-5 text-[#D1B06C]" />
            <h3 className="text-sm sm:text-base font-bold">
              Kartu Bukti Rekor Tumpukan Ompreng
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
          <div
            ref={certRef}
            className="bg-white border-4 border-double border-[#071E49] p-6 sm:p-8 rounded-xl shadow-md relative text-center text-[#071E49]"
          >
            {/* Corner Gold Flourishes */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#D1B06C]" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#D1B06C]" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#D1B06C]" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#D1B06C]" />

            {/* Emblem & Republic Title */}
            <div className="space-y-1">
              <div className="w-12 h-12 mx-auto rounded-lg bg-[#071E49] text-[#D1B06C] border border-[#D1B06C] flex items-center justify-center font-bold text-sm font-mono shadow-xs">
                OB
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                KOMUNITAS BUILDER INDONESIA
              </div>
              <div className="text-sm font-bold tracking-wide text-[#071E49]">
                OMPRENGBID LEADERBOARD & SHOWCASE
              </div>
              <div className="text-[10px] text-[#D1B06C] font-semibold">
                BUKTI KETANGKASAN & DAYA TAHAN PROYEK
              </div>
            </div>

            {/* Certificate Body */}
            <div className="my-5 border-t border-b border-slate-200 py-4 space-y-2">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                KARTU BUKTI REKOR OMPRENG
              </div>
              
              <div className="text-xs text-slate-600 font-normal">
                Diberikan sebagai pengakuan atas pencapaian tumpukan presisi menara ompreng untuk proyek:
              </div>

              <div className="text-xl sm:text-2xl font-bold text-[#071E49]">
                {project.name}
              </div>

              <div className="text-xs font-mono text-[#D1B06C] font-medium">
                Builder: {playerHandle || project.handle}
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl inline-block mx-auto mt-2">
                <div className="text-2xl sm:text-3xl font-bold font-mono text-[#071E49]">
                  {score} <span className="text-sm font-normal text-slate-600 font-sans">ompreng</span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Ketinggian Menara: <strong className="text-slate-800">{heightMeters} Meter</strong>
                </div>
              </div>
            </div>

            {/* Official Stamp & Signatory */}
            <div className="flex items-center justify-between text-left pt-2 text-xs">
              <div>
                <div className="font-mono text-slate-500 text-[11px]">No. Seri Dokumen:</div>
                <div className="font-mono font-medium text-[#071E49] text-xs">{certNumber}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Diterbitkan: {dateStr}</div>
              </div>

              {/* Official Seal Badge */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-full border border-dashed border-[#D1B06C] bg-amber-50/50 flex flex-col items-center justify-center p-1">
                  <ShieldCheck className="w-4 h-4 text-[#071E49]" />
                  <span className="text-[7px] font-bold text-[#071E49] leading-tight mt-0.5 tracking-wider">
                    OMPRENGBID
                  </span>
                  <span className="text-[6px] text-[#D1B06C] font-semibold">VERIFIED 2026</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-end space-x-2.5 shrink-0">
          <button
            onClick={handlePrint}
            className="bg-white hover:bg-slate-50 text-[#071E49] font-medium text-xs py-2 px-4 rounded-xl border border-slate-300 flex items-center space-x-1.5 transition active:scale-95"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak / PDF</span>
          </button>

          <button
            onClick={onClose}
            className="bg-[#071E49] hover:bg-[#0c2a63] text-white font-medium text-xs py-2 px-5 rounded-xl transition active:scale-95 shadow-xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
