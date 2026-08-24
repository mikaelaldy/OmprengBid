import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Plus,
  Info,
  HelpCircle,
  Eye,
  Play,
  Menu,
  X,
  LogIn,
  LogOut,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { sound } from '../utils/audio';
import {
  subscribeToAuth,
  loginWithGoogle,
  logoutUser,
  isUserAdmin,
} from '../lib/firebase';

interface HeaderProps {
  onOpenSubmit: () => void;
  onOpenRegulations: () => void;
  onOpenTutorial?: () => void;
  onStartGame?: () => void;
  onOpenAdmin?: () => void;
  liveVisitors?: number;
  totalVisitors?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSubmit,
  onOpenRegulations,
  onOpenTutorial,
  onStartGame,
  onOpenAdmin,
  liveVisitors = 1,
  totalVisitors = 1,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      setAuthUser(u && !u.isAnonymous ? u : null);
    });
    return () => unsub();
  }, []);

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleLogout = async () => {
    try {
      sound.playClick();
      setUserDropdownOpen(false);
      await logoutUser();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const isAdmin = isUserAdmin(authUser);

  return (
    <header className="bg-white border-b border-black/10 sticky top-0 z-30">
      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between">
        {/* Brand identity & Crest */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-black/5 p-1 border border-black/10 shrink-0 flex items-center justify-center">
            {/* SVG MBG 5-Compartment Tray Logo */}
            <svg viewBox="0 0 100 75" className="w-full h-full drop-shadow-sm">
              <defs>
                <linearGradient id="mbg-rim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <linearGradient id="mbg-cavity" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>
              {/* Outer stainless steel frame */}
              <rect x="2" y="2" width="96" height="71" rx="6" fill="url(#mbg-rim)" stroke="#64748b" strokeWidth="2" />
              <rect x="5" y="5" width="90" height="65" rx="4" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
              
              {/* Top 3 compartments */}
              <rect x="8" y="8" width="24" height="26" rx="3" fill="url(#mbg-cavity)" stroke="#475569" strokeWidth="1" />
              <rect x="36" y="8" width="28" height="26" rx="3" fill="url(#mbg-cavity)" stroke="#475569" strokeWidth="1" />
              <rect x="68" y="8" width="24" height="26" rx="3" fill="url(#mbg-cavity)" stroke="#475569" strokeWidth="1" />
              
              {/* Bottom wide carb & round soup compartments */}
              <rect x="8" y="38" width="52" height="29" rx="3" fill="url(#mbg-cavity)" stroke="#475569" strokeWidth="1" />
              <circle cx="78" cy="52.5" r="14.5" fill="url(#mbg-cavity)" stroke="#475569" strokeWidth="1" />

              {/* Gold arcade accent on rice tray */}
              <circle cx="20" cy="46" r="2.5" fill="#D1B06C" opacity="0.9" />
              <circle cx="34" cy="52" r="2" fill="#D1B06C" opacity="0.7" />
              <circle cx="48" cy="46" r="2.5" fill="#D1B06C" opacity="0.9" />
            </svg>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-black text-lg sm:text-2xl font-bold tracking-tight">
                Ompreng<span className="text-black">Bid</span>
              </h1>
            </div>
            <p className="text-black/50 text-[10px] sm:text-xs font-normal truncate max-w-[130px] sm:max-w-none">
              Etalase Proyek Indie Hacker
            </p>
          </div>
        </div>

        {/* Live Visitor & Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Real-time Visitor Stats Indicator */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-white/90 border border-black/10/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs">
            <div className="flex items-center space-x-1" title="Pengunjung Online Saat Ini">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono font-bold text-emerald-400 text-xs">{liveVisitors}</span>
              <span className="text-black/50 hidden xs:inline text-[10px]">live</span>
            </div>

            <span className="text-black/65 hidden xs:inline">|</span>

            <div className="hidden xs:flex items-center space-x-1 text-black/65" title="Total Kunjungan">
              <Eye className="w-3 h-3 text-black/50" />
              <span className="font-mono font-medium text-black/80 text-xs">{totalVisitors.toLocaleString()}</span>
            </div>
          </div>

          {/* Desktop Tutorial / Guide Button */}
          {onOpenTutorial && (
            <button
              id="btn-tutorial-header"
              onClick={onOpenTutorial}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-black/80 hover:text-black bg-black/5 hover:bg-black/10 border border-black/10 rounded-lg transition"
              title="Cara Bermain & Tutorial"
            >
              <HelpCircle className="w-3.5 h-3.5 text-black" />
              <span>Tutorial</span>
            </button>
          )}

          {/* Desktop Regulations / Info */}
          <button
            id="btn-regulations"
            onClick={onOpenRegulations}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-black/80 hover:text-black bg-black/5 hover:bg-black/10 border border-black/10 rounded-lg transition"
            title="Cara Main & Aturan"
          >
            <Info className="w-3.5 h-3.5 text-black" />
            <span>Aturan</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={handleToggleMute}
            className="p-1.5 sm:p-2 text-black/65 hover:text-black bg-black/5 hover:bg-black/10 border border-black/10 rounded-lg transition"
            title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
            )}
          </button>

          {/* Admin / Profile (Desktop & Mobile) */}
          {authUser && isAdmin ? (
            <div className="relative">
              <button
                id="btn-user-profile-menu"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 transition text-xs"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center">
                  <Shield className="w-3 h-3 text-[#071E49]" />
                </div>

                <div className="hidden md:flex flex-col text-left">
                  <span className="text-black font-bold text-xs leading-none">
                    Admin Panel
                  </span>
                  <span className="text-[10px] text-black/50 font-mono mt-0.5">
                    /admin
                  </span>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-black/10 py-2 z-50 text-black/80 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-black/10">
                    <p className="font-bold text-xs text-white truncate">
                      Master Moderator
                    </p>
                    <p className="text-[11px] text-black/50 truncate">
                      {authUser.email}
                    </p>
                  </div>

                  {onOpenAdmin && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-black hover:bg-black/5 flex items-center space-x-2 transition"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Buka Panel Moderasi (/admin)</span>
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full px-3.5 py-2 text-left text-xs text-rose-400 hover:bg-black/5 flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Sign Out)</span>
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* Submit Project CTA (Desktop) */}
          <button
            id="btn-submit-project-header"
            onClick={onOpenSubmit}
            className="hidden md:flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-black/80 hover:text-black bg-black/5 hover:bg-black/10 border border-black/10 rounded-lg transition shrink-0"
            title="Daftarkan Proyek / Startup"
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            <span>Daftar Proyek</span>
          </button>

          {/* Primary Play Game CTA */}
          <button
            id="btn-play-game-header"
            onClick={() => {
              sound.playClick();
              if (onStartGame) onStartGame();
            }}
            className="bg-black hover:bg-black/85 text-white font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center space-x-1 sm:space-x-1.5 transition active:scale-95 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Main</span>
          </button>

          {/* Mobile Menu Button (< 640px) */}
          <button
            id="btn-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-1.5 text-black/65 hover:text-black bg-black/5 hover:bg-black/10 border border-black/10 rounded-lg transition"
            aria-label="Menu Navigasi"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-black/80" />
            ) : (
              <Menu className="w-4 h-4 text-black/80" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-black/10 px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSubmit();
              }}
              className="flex items-center justify-center space-x-1.5 p-2.5 bg-black/5 text-white rounded-xl text-xs font-semibold border border-black/10 hover:bg-black/10 active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>Daftar Proyek</span>
            </button>

            {onOpenTutorial && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTutorial();
                }}
                className="flex items-center justify-center space-x-1.5 p-2.5 bg-black/5 text-black/80 rounded-xl text-xs font-medium border border-black/10 hover:bg-black/10 active:scale-95 transition"
              >
                <HelpCircle className="w-3.5 h-3.5 text-black" />
                <span>Tutorial</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegulations();
              }}
              className="col-span-2 flex items-center justify-center space-x-1.5 p-2.5 bg-black/5 text-black/80 rounded-xl text-xs font-medium border border-black/10 hover:bg-black/10 active:scale-95 transition"
            >
              <Info className="w-3.5 h-3.5 text-black" />
              <span>Cara Main & Aturan Leaderboard</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};


