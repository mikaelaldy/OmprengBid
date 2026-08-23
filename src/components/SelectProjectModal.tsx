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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E49]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#071E49] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-700 shrink-0">
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
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Action */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2.5 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau @handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#071E49] focus:border-[#071E49]"
            />
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenSubmit();
            }}
            className="bg-[#071E49] hover:bg-[#0c2a63] text-white text-xs font-medium px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shrink-0 transition"
          >
            <Plus className="w-3.5 h-3.5 text-[#D1B06C]" />
            <span className="hidden sm:inline">Proyek Baru</span>
          </button>
        </div>

        {/* Project List */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
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
                className="pt-2.5 first:pt-0 group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    #{idx + 1}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-sm text-[#071E49] group-hover:text-blue-700">
                        {p.name}
                      </span>
                      {p.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#D1B06C] shrink-0" />
                      )}
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        {p.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {p.handle} • Rekor: <strong className="text-slate-700 font-semibold">{p.bestScore} ompreng</strong>
                    </div>
                  </div>
                </div>

                <button
                  className="bg-slate-100 group-hover:bg-[#071E49] group-hover:text-white text-[#071E49] text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 group-hover:border-[#071E49] shadow-xs flex items-center space-x-1 shrink-0 ml-2 transition"
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
