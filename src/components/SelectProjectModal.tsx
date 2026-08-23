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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[85vh] flex flex-col border border-black/10 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-white text-black p-5 sm:p-6 flex items-center justify-between border-b border-black/10 shrink-0 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold">
              Pilih Proyek untuk Di-Boost
            </h3>
            <p className="text-xs text-black/50">
              Skor tumpukanmu akan menambah rekor proyek pilihanmu
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-black/45 hover:text-black p-1.5 rounded-lg hover:bg-black/[0.05] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Action */}
        <div className="p-4 border-b border-black/10 bg-black/[0.02] flex items-center gap-2.5 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              placeholder="Cari nama atau @handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-black placeholder-black/35 focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/30"
            />
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenSubmit();
            }}
            className="bg-black hover:bg-neutral-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg flex items-center space-x-1.5 shrink-0 transition"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Proyek Baru</span>
          </button>
        </div>

        {/* Project List */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1 divide-y divide-black/[0.08]">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-black/55">
              <p className="text-sm font-medium">Proyek tidak ditemukan.</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenSubmit();
                }}
                className="mt-2 text-xs font-semibold text-black underline underline-offset-2"
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
                className="pt-2.5 first:pt-0 group flex items-center justify-between p-3 rounded-xl hover:bg-black/[0.03] border border-transparent hover:border-black/10 cursor-pointer transition"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-7 h-7 rounded-lg bg-black/[0.05] text-black/70 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    #{idx + 1}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-sm text-black group-hover:underline underline-offset-2">
                        {p.name}
                      </span>
                      {p.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-black/40 shrink-0" />
                      )}
                      <span className="text-[10px] bg-black/[0.05] text-black/65 px-2 py-0.5 rounded-full font-medium">
                        {p.category}
                      </span>
                    </div>
                    <div className="text-xs text-black/55 font-mono">
                      {p.handle} • Rekor: <strong className="text-black/75 font-semibold">{p.bestScore} ompreng</strong>
                    </div>
                  </div>
                </div>

                <button
                  className="bg-black/[0.04] group-hover:bg-black group-hover:text-white text-black text-xs font-medium px-3 py-1.5 rounded-lg border border-black/10 flex items-center space-x-1 shrink-0 ml-2 transition"
                >
                  <Play className="w-3 h-3 fill-current text-white" />
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
