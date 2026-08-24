import React, { useState } from 'react';
import { X, Search, Play, Plus, Trophy, ShieldCheck, Flame } from 'lucide-react';
import { Project } from '../types';
import { sound } from '../utils/audio';

interface SelectProjectModalProps {
  isOpen: boolean;
  projects: Project[];
  onClose: () => void;
  onSelect: (project: Project) => void;
  onOpenSubmit: () => void;
}

export const SelectProjectModal: React.FC<SelectProjectModalProps> = ({
  isOpen,
  projects,
  onClose,
  onSelect,
  onOpenSubmit,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const sortedProjects = [...projects].sort((a, b) => b.bestScore - a.bestScore);
  const filtered = sortedProjects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.handle.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90dvh] flex flex-col border border-black/10 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-white text-black p-4 sm:p-6 flex items-center justify-between border-b border-black/10 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold">
              Pilih Proyek untuk Di-Boost
            </h3>
            <p className="text-xs text-[#D1B06C]">
              Skor tumpukanmu akan menambah rekor proyek pilihanmu
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-black/50 hover:text-black p-2 rounded-lg hover:bg-black/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Action */}
        <div className="p-3 sm:p-4 border-b border-black/10 bg-black/[0.02] flex items-center gap-2.5 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
            <input
              type="text"
              placeholder="Cari nama atau @handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-base sm:text-sm text-black/85 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#071E49] focus:border-[#071E49]"
            />
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenSubmit();
            }}
            className="bg-[#071E49] hover:bg-[#0A2558] text-white text-xs font-medium px-3 sm:px-3.5 py-2.5 rounded-lg flex items-center space-x-1.5 shrink-0 transition min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5 text-[#D1B06C]" />
            <span className="hidden xs:inline">Proyek Baru</span>
          </button>
        </div>

        {/* Project List */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-1.5 sm:space-y-2 flex-1 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-black/50">
              <p className="text-sm font-medium">Proyek tidak ditemukan.</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenSubmit();
                }}
                className="mt-2 text-xs font-semibold text-[#071E49] underline hover:text-[#0c2a63]"
              >
                Daftarkan proyek baru sekarang
              </button>
            </div>
          ) : (
            filtered.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => {
                  sound.playClick();
                  onSelect(p);
                }}
                className="pt-2.5 first:pt-0 group flex items-center justify-between p-3 rounded-lg hover:bg-black/[0.02] border border-transparent hover:border-black/10 cursor-pointer transition min-h-[48px] active:bg-black/[0.03]"
              >
                <div className="flex items-center space-x-2.5 sm:space-x-3 truncate">
                  <div className="w-7 h-7 rounded-lg bg-black/[0.03] text-black/75 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    #{idx + 1}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="font-semibold text-xs sm:text-sm text-[#071E49] group-hover:text-blue-700 truncate">
                        {p.name}
                      </span>
                      {p.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#D1B06C] shrink-0" />
                      )}
                      <span className="text-[10px] bg-black/[0.03] text-black/65 px-1.5 sm:px-2 py-0.5 rounded-full font-medium shrink-0">
                        {p.category}
                      </span>
                    </div>
                    <div className="text-[11px] sm:text-xs text-black/50 font-mono truncate">
                      {p.handle} • Rekor: <strong className="text-black/75 font-semibold">{p.bestScore.toLocaleString()} pts</strong>
                    </div>
                  </div>
                </div>

                <button
                  className="bg-black/5 group-hover:bg-black group-hover:text-black text-black text-xs font-medium px-3 py-1.5 sm:py-2 rounded-lg border border-black/10 group-hover:border-black shadow-xs flex items-center space-x-1 shrink-0 ml-2 transition min-h-[36px]"
                >
                  <Play className="w-3 h-3 text-[#D1B06C] fill-current" />
                  <span>Pilih</span>
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
