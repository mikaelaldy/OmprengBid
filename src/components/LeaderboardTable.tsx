import React, { useState } from 'react';
import { Trophy, Medal, ExternalLink, Play, Search, Filter, ShieldCheck, Flame, MousePointerClick, TrendingUp, Plus } from 'lucide-react';
import { Project, ProjectCategory } from '../types';
import { incrementClickCount } from '../utils/storage';
import { sound } from '../utils/audio';

interface LeaderboardTableProps {
  projects: Project[];
  onPlayProject: (project: Project) => void;
  onOpenSubmit: () => void;
}

const CATEGORIES: ('ALL' | ProjectCategory)[] = [
  'ALL',
  'AI & ML',
  'SaaS',
  'DevTool',
  'Agritech & Food',
  'EdTech & Health',
  'FinTech',
  'Open Source',
];

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  projects,
  onPlayProject,
  onOpenSubmit,
}) => {
  const [tab, setTab] = useState<'today' | 'alltime'>('today');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ProjectCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort projects based on tab
  const sortedProjects = [...projects].sort((a, b) => {
    if (tab === 'today') {
      return b.dailyBestScore - a.dailyBestScore || b.bestScore - a.bestScore;
    }
    return b.bestScore - a.bestScore;
  });

  // Filter projects by search query and category
  const filteredProjects = sortedProjects.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleExternalClick = (projectId: string) => {
    sound.playClick();
    incrementClickCount(projectId);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Header Title & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#071E49]">
              Papan Peringkat
            </h2>

            {/* Tabs: Today vs All-time */}
            <div className="inline-flex p-1 bg-slate-200/80 rounded-lg self-start">
              <button
                id="tab-today-battle"
                onClick={() => {
                  sound.playClick();
                  setTab('today');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                  tab === 'today'
                    ? 'bg-[#071E49] text-[#D1B06C] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${tab === 'today' ? 'text-[#D1B06C]' : 'text-orange-500'}`} />
                <span>Hari Ini</span>
              </button>

              <button
                id="tab-all-time"
                onClick={() => {
                  sound.playClick();
                  setTab('alltime');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                  tab === 'alltime'
                    ? 'bg-[#071E49] text-[#D1B06C] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Trophy className={`w-3.5 h-3.5 ${tab === 'alltime' ? 'text-[#D1B06C]' : 'text-amber-500'}`} />
                <span>Sepanjang Masa</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-leaderboard"
              type="text"
              placeholder="Cari proyek atau @handle builder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#071E49] focus:border-[#071E49] transition"
            />
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-4 pb-1 no-scrollbar text-xs">
          <span className="text-slate-500 font-medium text-xs shrink-0 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-[#D1B06C]" />
            <span>Kategori:</span>
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-full font-medium text-xs transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#071E49] text-[#D1B06C] shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 bg-[#071E49] text-xs font-semibold text-[#E5D5B4]">
              <th className="py-3 px-4 text-center w-16">Peringkat</th>
              <th className="py-3 px-4">Proyek & Inovasi</th>
              <th className="py-3 px-4 hidden md:table-cell">Builder Handle</th>
              <th className="py-3 px-4 text-right">
                {tab === 'today' ? 'Tumpukan Hari Ini' : 'Rekor Tumpukan'}
              </th>
              <th className="py-3 px-4 text-right hidden sm:table-cell">Total Ronde</th>
              <th className="py-3 px-4 text-right hidden lg:table-cell">Kunjungan</th>
              <th className="py-3 px-4 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-normal">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <p className="font-medium text-sm">Tidak ada proyek yang sesuai pencarian.</p>
                  <button
                    onClick={onOpenSubmit}
                    className="mt-3 text-xs text-[#071E49] font-semibold underline hover:text-[#0c2a63]"
                  >
                    Daftarkan proyek baru sekarang
                  </button>
                </td>
              </tr>
            ) : (
              filteredProjects.map((p, index) => {
                const rank = index + 1;
                const scoreToShow = tab === 'today' ? p.dailyBestScore : p.bestScore;

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50 transition group ${
                      rank === 1
                        ? 'bg-amber-50/40'
                        : rank === 2
                        ? 'bg-slate-50/60'
                        : rank === 3
                        ? 'bg-amber-50/20'
                        : ''
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {rank === 1 ? (
                        <div className="w-7 h-7 mx-auto rounded-full bg-[#D1B06C] text-[#071E49] flex items-center justify-center font-bold text-xs shadow-xs">
                          1
                        </div>
                      ) : rank === 2 ? (
                        <div className="w-7 h-7 mx-auto rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                          2
                        </div>
                      ) : rank === 3 ? (
                        <div className="w-7 h-7 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                          3
                        </div>
                      ) : (
                        <div className="w-7 h-7 mx-auto text-slate-400 font-mono text-xs flex items-center justify-center">
                          {rank}
                        </div>
                      )}
                    </td>

                    {/* Project & Tagline */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start space-x-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <a
                              id={`link-project-${p.id}`}
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleExternalClick(p.id)}
                              className="font-semibold text-sm sm:text-base text-[#071E49] hover:text-blue-700 flex items-center space-x-1"
                            >
                              <span>{p.name}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition" />
                            </a>

                            {p.verified && (
                              <span
                                title="Terverifikasi"
                                className="text-[#D1B06C]"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </span>
                            )}

                            <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                              {p.category}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 font-normal line-clamp-1 max-w-md mt-0.5">
                            {p.tagline}
                          </p>

                          <div className="md:hidden text-xs text-slate-500 font-mono mt-0.5">
                            {p.handle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Builder Handle */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {p.handle}
                      </span>
                    </td>

                    {/* Highest Stack Score */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-sm sm:text-base text-[#071E49]">
                        {scoreToShow} <span className="text-xs font-normal text-slate-500 font-sans">baki</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        ≈ {(scoreToShow * 0.045).toFixed(2)}m
                      </div>
                    </td>

                    {/* Total Runs */}
                    <td className="py-3.5 px-4 text-right hidden sm:table-cell font-mono text-xs text-slate-500">
                      {p.runsCount}x
                    </td>

                    {/* Clicks */}
                    <td className="py-3.5 px-4 text-right hidden lg:table-cell font-mono text-xs text-slate-500">
                      <div className="flex items-center justify-end space-x-1">
                        <MousePointerClick className="w-3.5 h-3.5 text-[#D1B06C]" />
                        <span>{p.clicksCount}</span>
                      </div>
                    </td>

                    {/* Action Boost Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        id={`btn-boost-${p.id}`}
                        onClick={() => {
                          sound.playClick();
                          onPlayProject(p);
                        }}
                        className="bg-slate-100 hover:bg-[#071E49] hover:text-white text-[#071E49] text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#071E49] shadow-xs flex items-center justify-center space-x-1 w-full transition active:scale-95"
                      >
                        <Play className="w-3 h-3 text-[#D1B06C] fill-current" />
                        <span>Main</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Institutional Table Footer & Full-Width CTA */}
      <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Menampilkan <strong className="text-slate-800 font-semibold">{filteredProjects.length}</strong> proyek inovasi teknologi di OmprengBid.
          </div>
          <div className="text-xs text-slate-400">
            Engine 60 FPS • Material SUS 304 Stainless Steel
          </div>
        </div>

        {/* Action CTA Button */}
        <button
          onClick={onOpenSubmit}
          className="w-full bg-white hover:bg-slate-50 text-[#071E49] border border-slate-300 font-medium py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#D1B06C]" />
          <span>Daftarkan Proyek / Startup Baru</span>
        </button>
      </div>
    </div>
  );
};
