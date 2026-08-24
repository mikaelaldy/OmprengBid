import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  ExternalLink,
  Users,
  Eye,
  MousePointerClick,
  Play,
  ArrowLeft,
  Lock,
  LogIn,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Key,
  X,
  FileText,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Project, ProjectCategory } from '../types';
import {
  deleteProject,
  toggleProjectVerification,
  resetProjectScores,
  SiteStats,
} from '../utils/storage';
import { sound } from '../utils/audio';
import {
  subscribeToAuth,
  loginWithGoogle,
  logoutUser,
  isUserAdmin,
  ADMIN_EMAIL,
} from '../lib/firebase';
import { validateProjectSubmission } from '../utils/moderation';

interface AdminPortalProps {
  projects: Project[];
  siteStats: SiteStats;
  liveVisitors: number;
  onNavigateHome: () => void;
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

const MASTER_PASSCODE = 'ompreng2026';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  projects,
  siteStats,
  liveVisitors,
  onNavigateHome,
}) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [passcodeAuth, setPasscodeAuth] = useState<boolean>(() => {
    return sessionStorage.getItem('ompreng_admin_session') === 'active';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ProjectCategory>('ALL');
  const [verifiedFilter, setVerifiedFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');

  // Action Modals
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToReset, setProjectToReset] = useState<Project | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live Test Moderation Tool State
  const [testText, setTestText] = useState('');
  const [testResult, setTestResult] = useState<ReturnType<typeof validateProjectSubmission> | null>(null);

  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      setAuthUser(u && !u.isAnonymous ? u : null);
    });
    return () => unsub();
  }, []);

  const isGoogleAdmin = isUserAdmin(authUser);
  const isAuthorized = isGoogleAdmin || passcodeAuth;

  const handleLoginGoogle = async () => {
    try {
      sound.playClick();
      setIsAuthenticating(true);
      setPasscodeError(null);
      await loginWithGoogle();
    } catch (e: any) {
      console.error('Admin login error:', e);
      setPasscodeError('Gagal melakukan autentikasi admin. Gunakan PIN Master sebagai alternatif.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (passcodeInput.trim() === MASTER_PASSCODE) {
      sessionStorage.setItem('ompreng_admin_session', 'active');
      setPasscodeAuth(true);
      setPasscodeError(null);
      setPasscodeInput('');
    } else {
      setPasscodeError('PIN / Passkey Master tidak valid.');
    }
  };

  const handleLogout = async () => {
    sound.playClick();
    sessionStorage.removeItem('ompreng_admin_session');
    setPasscodeAuth(false);
    await logoutUser();
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      sound.playClick();
      setIsProcessing(true);
      await deleteProject(projectToDelete.id);
      setStatusMessage({
        type: 'success',
        text: `Proyek "${projectToDelete.name}" berhasil dihapus secara permanen.`,
      });
      setProjectToDelete(null);
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'Gagal menghapus proyek dari database.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!projectToReset) return;
    try {
      sound.playClick();
      setIsProcessing(true);
      await resetProjectScores(projectToReset.id);
      setStatusMessage({
        type: 'success',
        text: `Skor proyek "${projectToReset.name}" berhasil di-reset ke 0 pts.`,
      });
      setProjectToReset(null);
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'Gagal mereset skor proyek.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleVerify = async (project: Project) => {
    try {
      sound.playClick();
      await toggleProjectVerification(project.id, project.verified);
      setStatusMessage({
        type: 'success',
        text: `Status verifikasi "${project.name}" diubah menjadi ${!project.verified ? 'TERVERIFIKASI' : 'BELUM VERIFIKASI'}.`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunModerationTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testText.trim()) return;
    const res = validateProjectSubmission({
      name: testText,
      url: testText,
      handle: testText,
      tagline: testText,
    });
    setTestResult(res);
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.creatorEmail && p.creatorEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesVerified =
      verifiedFilter === 'ALL' ||
      (verifiedFilter === 'VERIFIED' && p.verified) ||
      (verifiedFilter === 'UNVERIFIED' && !p.verified);

    return matchesCategory && matchesSearch && matchesVerified;
  });

  return (
    <div className="min-h-screen bg-[#071E49] text-slate-100 flex flex-col">
      {/* Top Admin Navigation Bar */}
      <header className="bg-[#04122C] border-b border-slate-700/80 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                sound.playClick();
                onNavigateHome();
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-600 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[#D1B06C] flex items-center justify-center font-bold">
                <Shield className="w-4 h-4 text-[#D1B06C]" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
                  OmprengBid <span className="text-[#D1B06C]">Admin Console</span>
                </h1>
                <p className="text-[10px] text-slate-400">
                  Moderasi & Manajemen Proyek (/admin)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {isAuthorized ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-flex items-center space-x-1 bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-[11px] px-2.5 py-1 rounded-lg font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{authUser?.email || 'Master Session Active'}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 text-xs font-medium transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center space-x-1 bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs px-2.5 py-1 rounded-lg">
                <Lock className="w-3.5 h-3.5" />
                <span>Akses Terkunci</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* Status Notification Toast */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in duration-150 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* AUTHENTICATION WALL IF NOT LOGGED IN */}
        {!isAuthorized ? (
          <div className="max-w-md mx-auto my-12 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#D1B06C] flex items-center justify-center shadow-inner">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Portal Khusus Administrator</h2>
              <p className="text-xs text-slate-400">
                Silakan autentikasi identitas administrator (<code className="text-[#D1B06C] font-mono">{ADMIN_EMAIL}</code>) untuk membuka panel kontrol dan moderasi proyek.
              </p>
            </div>

            {passcodeError && (
              <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl">
                {passcodeError}
              </div>
            )}

            {/* Method 1: Clean OAuth Sign-in without Google Logo */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={isAuthenticating}
                onClick={handleLoginGoogle}
                className="w-full bg-[#D1B06C] hover:bg-[#c4a15b] text-[#071E49] font-bold text-sm py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-60"
              >
                <Shield className="w-4 h-4" />
                <span>{isAuthenticating ? 'Memverifikasi...' : 'Masuk via Akun Moderator'}</span>
              </button>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-slate-700"></div>
                <span className="px-3 text-[11px] text-slate-400 uppercase font-mono">atau gunakan PIN</span>
                <div className="flex-1 border-t border-slate-700"></div>
              </div>

              {/* Method 2: Master Passkey / PIN */}
              <form onSubmit={handlePasscodeSubmit} className="space-y-2.5">
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="Masukkan PIN / Passkey Admin"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D1B06C]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold text-xs py-2.5 rounded-xl transition"
                >
                  Buka dengan PIN Master
                </button>
              </form>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <p className="text-[10px] text-slate-400">
                OmprengBid Engine • Hak Akses Terlindungi
              </p>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="space-y-6">
            
            {/* 1. Global Analytics Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Total Proyek</span>
                  <FileText className="w-4 h-4 text-[#D1B06C]" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                  {projects.length}
                </div>
                <p className="text-[10px] text-slate-400">Terdaftar di leaderboard</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Live Online</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 flex items-center space-x-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{liveVisitors}</span>
                </div>
                <p className="text-[10px] text-slate-400">Aktif saat ini</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Total Kunjungan</span>
                  <Eye className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                  {siteStats.totalVisitors.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400">Akumulasi views unik</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Klik Link Proyek</span>
                  <MousePointerClick className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                  {siteStats.totalProjectClicks.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400">Trafik ke builder app</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 space-y-1 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Total Ronde Main</span>
                  <Play className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                  {siteStats.totalGamesPlayed.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400">Sesi tumpuk baki</p>
              </div>
            </div>

            {/* 2. Content Moderation Testing & Rule Inspector */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h2 className="font-bold text-sm sm:text-base text-white">
                    Simulasi & Validator Filter Konten Otomatis
                  </h2>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-[#D1B06C] border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
                  Anti-Judol • Porno • SARA • Scam • Malware
                </span>
              </div>

              <form onSubmit={handleRunModerationTest} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Uji coba teks atau link mencurigakan untuk mendeteksi pelanggaran..."
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D1B06C]"
                />
                <button
                  type="submit"
                  className="bg-[#D1B06C] hover:bg-[#c4a15b] text-[#071E49] font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Uji Filter
                </button>
              </form>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    testResult.isValid
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  }`}
                >
                  {testResult.isValid ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>LOLOS:</strong> Teks memenuhi standar komunitas dan bebas kata terlarang.</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span><strong>TERDETEKSI PELANGGARAN:</strong> Kategori {testResult.categoryLabel}</span>
                      </div>
                      <p className="text-[11px] opacity-90 pl-6">
                        {testResult.errorMessage}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Project Management Table */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
              {/* Controls */}
              <div className="p-4 sm:p-5 border-b border-slate-700/80 bg-slate-950/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <h2 className="font-bold text-base text-white">Daftar Proyek Terdaftar</h2>
                  <span className="text-xs bg-slate-800 text-[#D1B06C] px-2 py-0.5 rounded-full font-mono font-bold">
                    {filteredProjects.length}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search */}
                  <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cari proyek, handle, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#D1B06C]"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c === 'ALL' ? 'Semua Kategori' : c}
                      </option>
                    ))}
                  </select>

                  {/* Verification Filter */}
                  <select
                    value={verifiedFilter}
                    onChange={(e) => setVerifiedFilter(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="VERIFIED">Hanya Terverifikasi</option>
                    <option value="UNVERIFIED">Belum Verifikasi</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-3 px-3.5 w-12 text-center">#</th>
                      <th className="py-3 px-3.5">Nama & URL Proyek</th>
                      <th className="py-3 px-3.5">Kategori</th>
                      <th className="py-3 px-3.5">Builder / Creator</th>
                      <th className="py-3 px-3.5 text-right">Rekor Ompreng</th>
                      <th className="py-3 px-3.5 text-right">Ronde</th>
                      <th className="py-3 px-3.5 text-right">Klik</th>
                      <th className="py-3 px-3.5 text-center">Verifikasi</th>
                      <th className="py-3 px-3.5 text-center w-28">Moderasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-500">
                          Tidak ditemukan proyek yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map((p, index) => (
                        <tr key={p.id} className="hover:bg-slate-800/50 transition">
                          <td className="py-3 px-3.5 text-center font-mono text-slate-500 font-bold">
                            {index + 1}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-white text-xs sm:text-sm">
                                {p.name}
                              </span>
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-white"
                                title="Buka website"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[240px]">
                              {p.tagline}
                            </p>
                          </td>

                          <td className="py-3 px-3.5">
                            <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
                              {p.category}
                            </span>
                          </td>

                          <td className="py-3 px-3.5">
                            <div className="font-mono text-slate-300 font-medium">
                              {p.handle}
                            </div>
                            {p.creatorEmail && (
                              <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                                {p.creatorEmail}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                            {p.bestScore.toLocaleString()} <span className="text-[10px] font-sans font-normal text-slate-400">pts</span>
                          </td>

                          <td className="py-3 px-3.5 text-right font-mono text-slate-300">
                            {p.runsCount}x
                          </td>

                          <td className="py-3 px-3.5 text-right font-mono text-slate-300">
                            {p.clicksCount}
                          </td>

                          {/* Verify Toggle */}
                          <td className="py-3 px-3.5 text-center">
                            <button
                              onClick={() => handleToggleVerify(p)}
                              title={p.verified ? 'Klik untuk cabut verifikasi' : 'Klik untuk beri centang verifikasi'}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center space-x-1 transition ${
                                p.verified
                                  ? 'bg-amber-500/20 text-[#D1B06C] border border-amber-500/40 hover:bg-amber-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
                              }`}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>{p.verified ? 'Verified' : 'Beri Badge'}</span>
                            </button>
                          </td>

                          {/* Actions: Reset & Delete */}
                          <td className="py-3 px-3.5 text-center">
                            <div className="inline-flex items-center space-x-1.5">
                              <button
                                onClick={() => setProjectToReset(p)}
                                title="Reset Skor (Atasi Bot/Cheat)"
                                className="p-1.5 bg-slate-800 hover:bg-amber-950/70 text-slate-300 hover:text-amber-400 border border-slate-700 rounded-lg transition"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setProjectToDelete(p)}
                                title="Hapus Proyek Permanen"
                                className="p-1.5 bg-slate-800 hover:bg-rose-950/70 text-slate-300 hover:text-rose-400 border border-slate-700 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-start space-x-3 text-rose-400">
              <div className="p-2 bg-rose-950/80 border border-rose-800 rounded-xl shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Hapus Proyek Permanen?</h3>
                <p className="text-xs text-slate-300">
                  Apakah kamu yakin ingin menghapus <strong className="text-white">{projectToDelete.name}</strong> ({projectToDelete.handle}) dari database global Firestore?
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs space-y-1 text-slate-400">
              <div>ID: <span className="font-mono text-slate-200">{projectToDelete.id}</span></div>
              <div>Rekor Skor: <span className="font-mono text-white font-bold">{projectToDelete.bestScore} pts</span></div>
              <div>URL: <span className="text-slate-300">{projectToDelete.url}</span></div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                disabled={isProcessing}
                onClick={() => setProjectToDelete(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                disabled={isProcessing}
                onClick={handleConfirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center space-x-1.5"
              >
                {isProcessing ? 'Menghapus...' : 'Hapus Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Score Confirmation Modal */}
      {projectToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-start space-x-3 text-amber-400">
              <div className="p-2 bg-amber-950/80 border border-amber-800 rounded-xl shrink-0">
                <RotateCcw className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Reset Skor Proyek?</h3>
                <p className="text-xs text-slate-300">
                  Tindakan ini akan mengembalikan skor rekor dan skor harian milik <strong className="text-white">{projectToReset.name}</strong> menjadi <strong className="text-amber-300">0 pts</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                disabled={isProcessing}
                onClick={() => setProjectToReset(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                disabled={isProcessing}
                onClick={handleConfirmReset}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-[#071E49] font-bold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1.5"
              >
                {isProcessing ? 'Mereset...' : 'Reset ke 0'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
