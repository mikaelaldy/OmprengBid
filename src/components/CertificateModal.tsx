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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-xl w-full overflow-hidden border border-black/10 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header bar */}
        <div className="bg-white text-black p-4 sm:p-5 flex items-center justify-between border-b border-black/10 shrink-0">
          <div className="flex items-center space-x-2.5">
            <Award className="w-5 h-5 text-black/80" />
            <h3 className="text-sm sm:text-base font-bold">
              Kartu Bukti Rekor Tumpukan Ompreng
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-black/50 hover:text-black p-1.5 rounded-lg hover:bg-black/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-black/[0.02]">
          <div
            ref={certRef}
            className="bg-white border-4 border-double border-[#071E49] p-6 sm:p-8 rounded-lg shadow-md relative text-center text-black"
          >
            {/* Corner Gold Flourishes */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-black/20" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-black/20" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-black/20" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-black/20" />

            {/* Emblem & Republic Title */}
            <div className="space-y-1">
              <div className="w-12 h-12 mx-auto rounded-lg bg-black/5 text-black border border-black/20 flex items-center justify-center font-bold text-sm font-mono shadow-xs">
                OB
              </div>
              <div className="text-[10px] uppercase tracking-widest text-black/50 font-medium">
                KOMUNITAS BUILDER INDONESIA
              </div>
              <div className="text-sm font-bold tracking-wide text-black">
                OMPRENGBID LEADERBOARD & SHOWCASE
              </div>
              <div className="text-[10px] text-black/80 font-semibold">
                BUKTI KETANGKASAN & DAYA TAHAN PROYEK
              </div>
            </div>

            {/* Certificate Body */}
            <div className="my-5 border-t border-b border-black/10 py-4 space-y-2">
              <div className="text-xs uppercase tracking-wider text-black/50 font-semibold">
                KARTU BUKTI REKOR OMPRENG
              </div>
              
              <div className="text-xs text-black/65 font-normal">
                Diberikan sebagai pengakuan atas pencapaian tumpukan presisi menara ompreng untuk proyek:
              </div>

              <div className="text-xl sm:text-2xl font-bold text-black">
                {project.name}
              </div>

              <div className="text-xs font-mono text-black/80 font-medium">
                Builder: {playerHandle || project.handle}
              </div>

              <div className="bg-black/[0.02] border border-black/10 p-3 rounded-lg inline-block mx-auto mt-2">
                <div className="text-2xl sm:text-3xl font-bold font-mono text-black">
                  {score.toLocaleString()} <span className="text-sm font-normal text-black/65 font-sans">pts</span>
                </div>
                <div className="text-xs text-black/50 font-mono mt-0.5">
                  Ketinggian Menara: <strong className="text-black/85">{heightMeters} Meter</strong>
                </div>
              </div>
            </div>

            {/* Official Stamp & Signatory */}
            <div className="flex items-center justify-between text-left pt-2 text-xs">
              <div>
                <div className="font-mono text-black/50 text-[11px]">No. Seri Dokumen:</div>
                <div className="font-mono font-medium text-black text-xs">{certNumber}</div>
                <div className="text-black/50 text-[11px] mt-0.5">Diterbitkan: {dateStr}</div>
              </div>

              {/* Official Seal Badge */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-full border border-dashed border-black/20 bg-amber-50/50 flex flex-col items-center justify-center p-1">
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span className="text-[7px] font-bold text-black leading-tight mt-0.5 tracking-wider">
                    OMPRENGBID
                  </span>
                  <span className="text-[6px] text-black/80 font-semibold">VERIFIED 2026</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-black/10 flex items-center justify-end space-x-2.5 shrink-0">
          <button
            onClick={handlePrint}
            className="bg-white hover:bg-black/[0.02] text-black font-medium text-xs py-2 px-4 rounded-lg border border-black/15 flex items-center space-x-1.5 transition active:scale-95"
          >
            <Printer className="w-4 h-4 text-black/50" />
            <span>Cetak / PDF</span>
          </button>

          <button
            onClick={onClose}
            className="bg-black hover:bg-black/85 text-white font-medium text-xs py-2 px-5 rounded-lg transition active:scale-95 shadow-xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
