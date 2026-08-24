import React, { useState, useEffect } from 'react';
import {
  Trophy,
  ExternalLink,
  Play,
  Search,
  Filter,
  ShieldCheck,
  Flame,
  MousePointerClick,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  Shield,
  Lock,
  LogIn,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Project, ProjectCategory } from '../types';
import { incrementClickCount, deleteProject } from '../utils/storage';
import { sound } from '../utils/audio';
import { trackProjectLinkClick } from '../lib/analytics';
import {
  subscribeToAuth,
  loginWithGoogle,
  isUserAdmin,
  canUserManageProject,
  ADMIN_EMAIL,
} from '../lib/firebase';

interface LeaderboardTableProps {
  projects: Project[];
  onPlayProject: (project: Project) => void;
  onOpenSubmit: () => void;
  onOpenAdmin?: () => void;
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
  onOpenAdmin,
}) => {
  const [tab, setTab] = useState<'today' | 'alltime'>('today');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ProjectCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [unauthorizedProject, setUnauthorizedProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      setAuthUser(u && !u.isAnonymous ? u : null);
    });
    return () => unsub();
  }, []);

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

  const handleExternalClick = (project: Project) => {
    sound.playClick();
    incrementClickCount(project.id);
    trackProjectLinkClick(project.name, project.url);
  };

  const handleDeleteClick = (project: Project) => {
    sound.playClick();
    const authorized = canUserManageProject(authUser, project);
    if (authorized) {
      setProjectToDelete(project);
    } else {
      setUnauthorizedProject(project);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      sound.playClick();
      setIsDeleting(true);
      await deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    } catch (err) {
      console.error('Error deleting project:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGoogleLoginFromModal = async () => {
    try {
      sound.playClick();
      const user = await loginWithGoogle();
      if (user && unauthorizedProject) {
        if (canUserManageProject(user, unauthorizedProject)) {
          const target = unauthorizedProject;
          setUnauthorizedProject(null);
          setProjectToDelete(target);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isAdmin = isUserAdmin(authUser);

  return (
    <>
      <div className="bg-white border border-black/10 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-4 sm:p-6 border-b border-black/10 bg-black/[0.02]/70">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Header Title & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-black">
                Papan Peringkat
              </h2>

              {/* Tabs: Today vs All-time */}
              <div className="inline-flex p-1 bg-black/5 rounded-lg self-start">
                <button
                  id="tab-today-battle"
                  onClick={() => {
                    sound.playClick();
                    setTab('today');
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                    tab === 'today'
                      ? 'bg-black text-white'
                      : 'text-black/65 hover:text-black'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${tab === 'today' ? 'text-black' : 'text-black/50'}`} />
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
                      ? 'bg-black text-white'
                      : 'text-black/65 hover:text-black'
                  }`}
                >
                  <Trophy className={`w-3.5 h-3.5 ${tab === 'alltime' ? 'text-black' : 'text-black/50'}`} />
                  <span>Sepanjang Masa</span>
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
              <input
                id="input-search-leaderboard"
                type="text"
                placeholder="Cari proyek atau @handle builder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-black/85 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#071E49] focus:border-[#071E49] transition"
              />
            </div>
          </div>

          {/* Category Pills Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pt-4 pb-1 no-scrollbar text-xs">
            <span className="text-black/50 font-medium text-xs shrink-0 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-black" />
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
                    ? 'bg-black text-white'
                    : 'bg-white text-black/65 hover:text-black border border-black/10'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Card List (< sm screens) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredProjects.length === 0 ? (
            <div className="py-10 px-4 text-center text-black/50">
              <p className="font-medium text-sm">Belum ada proyek yang terdaftar.</p>
              <button
                onClick={onOpenSubmit}
                className="mt-3 text-xs text-black font-semibold underline hover:text-[#0c2a63]"
              >
                Daftarkan proyek baru sekarang
              </button>
            </div>
          ) : (
            filteredProjects.map((p, index) => {
              const rank = index + 1;
              const scoreToShow = tab === 'today' ? p.dailyBestScore : p.bestScore;

              return (
                <div
                  key={`mobile-${p.id}`}
                  className={`p-4 transition ${
                    rank === 1
                      ? 'bg-amber-50/40'
                      : rank === 2
                      ? 'bg-black/[0.02]/60'
                      : rank === 3
                      ? 'bg-amber-50/20'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-2.5">
                      {/* Rank Badge */}
                      <div className="shrink-0 pt-0.5">
                        {rank === 1 ? (
                          <div className="w-7 h-7 rounded-full bg-[#D1B06C] text-black flex items-center justify-center font-bold text-xs shadow-xs">
                            1
                          </div>
                        ) : rank === 2 ? (
                          <div className="w-7 h-7 rounded-full bg-black/5 text-black/75 flex items-center justify-center font-bold text-xs">
                            2
                          </div>
                        ) : rank === 3 ? (
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                            3
                          </div>
                        ) : (
                          <div className="w-7 h-7 text-black/50 font-mono text-xs flex items-center justify-center font-semibold">
                            #{rank}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <a
                            id={`link-project-mob-${p.id}`}
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleExternalClick(p)}
                            className="font-bold text-sm text-black hover:text-blue-700 flex items-center space-x-1"
                          >
                            <span>{p.name}</span>
                            <ExternalLink className="w-3 h-3 text-black/50" />
                          </a>

                          {p.verified && (
                            <span title="Terverifikasi" className="text-black">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                          )}

                          <span className="bg-black/[0.03] text-black/75 text-[10px] px-2 py-0.5 rounded-full font-medium">
                            {p.category}
                          </span>
                        </div>

                        <p className="text-xs text-black/50 line-clamp-2 mt-1">
                          {p.tagline}
                        </p>

                        <div className="text-[11px] text-black/50 font-mono mt-1">
                          {p.handle} • {p.runsCount}x dimainkan
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-base text-black">
                        {scoreToShow.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-black/50 font-medium">
                        pts {tab === 'today' ? 'hari ini' : 'rekor'}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-black/5">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleExternalClick(p)}
                      className="flex-1 bg-black/[0.02] hover:bg-black/[0.03] text-black/75 text-xs font-medium py-2 rounded-lg border border-black/10 flex items-center justify-center space-x-1.5 transition text-center min-h-[40px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-black/50" />
                      <span>Kunjungi</span>
                    </a>

                    <button
                      id={`btn-boost-mob-${p.id}`}
                      onClick={() => {
                        sound.playClick();
                        onPlayProject(p);
                      }}
                      className="flex-1 bg-[#071E49] hover:bg-[#0A2558] text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center space-x-1.5 transition active:scale-95 min-h-[40px]"
                    >
                      <Play className="w-3.5 h-3.5 text-black fill-current" />
                      <span>Mainkan</span>
                    </button>

                    <button
                      id={`btn-delete-mob-${p.id}`}
                      title={
                        isAdmin
                          ? "Hapus Proyek (Hak Moderator Admin)"
                          : authUser && p.creatorEmail === authUser.email
                          ? "Hapus Proyek (Pemilik Proyek)"
                          : "Hapus Proyek"
                      }
                      onClick={() => handleDeleteClick(p)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border transition shrink-0 ${
                        isAdmin
                          ? 'border-amber-300 text-amber-600 hover:bg-amber-50'
                          : authUser && p.creatorEmail === authUser.email
                          ? 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                          : 'border-black/10 text-black/50 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop / Tablet Table (>= sm screens) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-black/[0.03] text-xs font-medium text-black/70">
                <th className="py-3 px-4 text-center w-16">Peringkat</th>
                <th className="py-3 px-4">Proyek & Inovasi</th>
                <th className="py-3 px-4 hidden md:table-cell">Builder Handle</th>
                <th className="py-3 px-4 text-right">
                  {tab === 'today' ? 'Skor Hari Ini (pts)' : 'Rekor Skor (pts)'}
                </th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">Total Ronde</th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">Kunjungan</th>
                <th className="py-3 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-normal">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-black/50">
                    <p className="font-medium text-sm">Belum ada proyek yang terdaftar.</p>
                    <button
                      onClick={onOpenSubmit}
                      className="mt-3 text-xs text-black font-semibold underline hover:text-[#0c2a63]"
                    >
                      Daftarkan proyek baru sekarang
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p, index) => {
                  const rank = index + 1;
                  const scoreToShow = tab === 'today' ? p.dailyBestScore : p.bestScore;
                  const isCreator = authUser && p.creatorEmail === authUser.email;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-black/[0.02] transition group ${
                        rank === 1
                          ? 'bg-amber-50/40'
                          : rank === 2
                          ? 'bg-black/[0.02]/60'
                          : rank === 3
                          ? 'bg-amber-50/20'
                          : ''
                      }`}
                    >
                      {/* Rank Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {rank === 1 ? (
                          <div className="w-7 h-7 mx-auto rounded-full bg-[#D1B06C] text-black flex items-center justify-center font-bold text-xs shadow-xs">
                            1
                          </div>
                        ) : rank === 2 ? (
                          <div className="w-7 h-7 mx-auto rounded-full bg-black/5 text-black/75 flex items-center justify-center font-bold text-xs">
                            2
                          </div>
                        ) : rank === 3 ? (
                          <div className="w-7 h-7 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                            3
                          </div>
                        ) : (
                          <div className="w-7 h-7 mx-auto text-black/50 font-mono text-xs flex items-center justify-center">
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
                                onClick={() => handleExternalClick(p)}
                                className="font-semibold text-sm sm:text-base text-black hover:text-blue-700 flex items-center space-x-1"
                              >
                                <span>{p.name}</span>
                                <ExternalLink className="w-3 h-3 text-black/50 group-hover:text-blue-600 transition" />
                              </a>

                              {p.verified && (
                                <span
                                  title="Terverifikasi"
                                  className="text-black"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </span>
                              )}

                              <span className="bg-black/[0.03] text-black/75 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                {p.category}
                              </span>

                              {isCreator && (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                  <Shield className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>Proyekmu</span>
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-black/50 font-normal line-clamp-1 max-w-md mt-0.5">
                              {p.tagline}
                            </p>

                            <div className="md:hidden text-xs text-black/50 font-mono mt-0.5">
                              {p.handle}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Builder Handle */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <span className="font-mono text-xs text-black/65 bg-black/[0.03] px-2 py-0.5 rounded">
                          {p.handle}
                        </span>
                      </td>

                      {/* Highest Stack Score */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-sm sm:text-base text-black">
                          {scoreToShow.toLocaleString()} <span className="text-xs font-normal text-black/50 font-sans">pts</span>
                        </div>
                      </td>

                      {/* Total Runs */}
                      <td className="py-3.5 px-4 text-right hidden sm:table-cell font-mono text-xs text-black/50">
                        {p.runsCount}x
                      </td>

                      {/* Clicks */}
                      <td className="py-3.5 px-4 text-right hidden lg:table-cell font-mono text-xs text-black/50">
                        <div className="flex items-center justify-end space-x-1">
                          <MousePointerClick className="w-3.5 h-3.5 text-black" />
                          <span>{p.clicksCount}</span>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            id={`btn-boost-${p.id}`}
                            onClick={() => {
                              sound.playClick();
                              onPlayProject(p);
                            }}
                            className="bg-black/5 hover:bg-black hover:text-black text-black text-xs font-medium px-3 py-1.5 rounded-lg border border-black/10 hover:border-black flex items-center justify-center space-x-1 transition active:scale-95"
                          >
                            <Play className="w-3 h-3 text-black fill-current" />
                            <span>Main</span>
                          </button>

                          <button
                            id={`btn-delete-${p.id}`}
                            title={
                              isAdmin
                                ? "Hapus Proyek (Hak Master Admin)"
                                : isCreator
                                ? "Hapus Proyek (Pemilik)"
                                : "Hapus Proyek"
                            }
                            onClick={() => handleDeleteClick(p)}
                            className={`p-1.5 rounded-lg border transition ${
                              isAdmin
                                ? 'border-amber-300 text-amber-600 hover:bg-amber-50'
                                : isCreator
                                ? 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                                : 'border-black/10 text-black/50 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Institutional Table Footer & Full-Width CTA */}
        <div className="p-4 sm:p-6 bg-black/[0.02] border-t border-black/10 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-black/50">
            <div>
              Menampilkan <strong className="text-black/85 font-semibold">{filteredProjects.length}</strong> proyek inovasi teknologi di OmprengBid.
            </div>
            <div className="text-xs text-black/50">
              Engine 60 FPS • Material SUS 304 Stainless Steel
            </div>
          </div>

          {/* Action CTA Button */}
          <button
            onClick={onOpenSubmit}
            className="w-full bg-white hover:bg-black/[0.02] text-black border border-black/15 font-medium py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Daftarkan Proyek / Startup Baru</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Project Deletion (Authorized) */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-black/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="bg-white text-black p-4 sm:p-5 flex items-center justify-between border-b border-black/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Hapus Proyek
                  </h3>
                  <p className="text-xs text-black/65">
                    Konfirmasi penghapusan data
                  </p>
                </div>
              </div>
              <button
                disabled={isDeleting}
                onClick={() => setProjectToDelete(null)}
                className="text-black/50 hover:text-black p-1 rounded-lg hover:bg-black/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Permission Authorization Badge */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center space-x-2.5 text-xs text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold">
                    {isAdmin
                      ? `Otoritas: Master Admin (${ADMIN_EMAIL})`
                      : `Otoritas: Pemilik Proyek (${authUser?.email || 'Terverifikasi'})`}
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Kamu memiliki hak untuk menghapus data proyek ini secara permanen.
                  </p>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start space-x-3 text-rose-900">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-rose-950">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                  <p className="leading-relaxed text-rose-800">
                    Apakah kamu yakin ingin menghapus proyek <strong className="font-bold text-rose-950">{projectToDelete.name}</strong> ({projectToDelete.handle})?
                  </p>
                </div>
              </div>

              <div className="bg-black/[0.02] border border-black/10 rounded-xl p-3 text-xs text-black/65 space-y-1">
                <div className="flex justify-between">
                  <span className="text-black/50">Kategori:</span>
                  <span className="font-medium text-black/75">{projectToDelete.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">Rekor Skor:</span>
                  <span className="font-mono font-medium text-black/75">{projectToDelete.bestScore.toLocaleString()} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">Total Ronde:</span>
                  <span className="font-mono font-medium text-black/75">{projectToDelete.runsCount}x</span>
                </div>
              </div>

              <p className="text-[11px] text-black/50">
                Data proyek akan dibersihkan secara permanen dari Cloud Firestore dan papan peringkat.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setProjectToDelete(null)}
                  className="flex-1 bg-black/[0.03] hover:bg-black/10 text-black/75 font-medium text-xs py-2.5 px-4 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  id="btn-confirm-delete-project"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 active:scale-95 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Permanen</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Unauthorized Deletion Modal */}
      {unauthorizedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-black/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="bg-white text-black p-4 sm:p-5 flex items-center justify-between border-b border-black/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Hak Akses Dibatasi
                  </h3>
                  <p className="text-xs text-black/65">
                    Perlindungan Keamanan Proyek
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUnauthorizedProject(null)}
                className="text-black/50 hover:text-black p-1 rounded-lg hover:bg-black/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3 text-amber-900">
                <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1.5">
                  <p className="font-semibold text-amber-950">
                    Hanya Pemilik Proyek atau Master Admin yang berhak menghapus
                  </p>
                  <p className="leading-relaxed text-amber-800">
                    Proyek <strong className="font-bold text-amber-950">{unauthorizedProject.name}</strong> dilindungi agar tidak dapat dihapus oleh sembarang pengunjung.
                  </p>
                  {unauthorizedProject.creatorEmail && (
                    <p className="text-[11px] text-amber-700 bg-amber-100/60 p-2 rounded-lg font-mono">
                      Terdaftar oleh: {unauthorizedProject.creatorEmail}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-black/65 leading-relaxed">
                Penghapusan data proyek dilindungi dan diproses secara terpusat oleh Master Moderator melalui Portal Admin (<code className="text-black font-mono bg-black/[0.03] px-1 py-0.5 rounded">/admin</code>).
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUnauthorizedProject(null)}
                  className="w-full sm:flex-1 bg-black/[0.03] hover:bg-black/10 text-black/75 font-medium text-xs py-2.5 px-4 rounded-xl transition"
                >
                  Tutup
                </button>
                {onOpenAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setUnauthorizedProject(null);
                      onOpenAdmin();
                    }}
                    className="w-full sm:flex-1 bg-[#071E49] hover:bg-[#0A2558] text-white font-medium text-xs py-2.5 px-4 rounded-lg transition flex items-center justify-center space-x-2 active:scale-95"
                  >
                    <Shield className="w-3.5 h-3.5 text-black" />
                    <span>Buka Portal Admin</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
