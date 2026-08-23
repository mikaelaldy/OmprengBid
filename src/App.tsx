/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { BillboardBanner } from './components/BillboardBanner';
import { LeaderboardTable } from './components/LeaderboardTable';
import { GameStageModal } from './components/GameStageModal';
import { SubmitProjectModal } from './components/SubmitProjectModal';
import { SelectProjectModal } from './components/SelectProjectModal';
import { GameOverModal } from './components/GameOverModal';
import { CertificateModal } from './components/CertificateModal';
import { RegulationsModal } from './components/RegulationsModal';
import { TutorialModal } from './components/TutorialModal';
import { Project } from './types';
import {
  loadCachedProjects,
  subscribeToGlobalProjects,
  recordGameRun,
  getStoredPlayerHandle,
} from './utils/storage';
import { Trophy, ShieldCheck, Sparkles, Layers, Award, Play, Flame, ExternalLink, HelpCircle, Cloud } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => loadCachedProjects());
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isConnectedToCloud, setIsConnectedToCloud] = useState<boolean>(false);
  
  // Modal states
  const [isGaming, setIsGaming] = useState<boolean>(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState<boolean>(false);
  const [isRegulationsOpen, setIsRegulationsOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);

  // Last run stats
  const [lastGameResult, setLastGameResult] = useState<{
    score: number;
    traysStacked: number;
    maxCombo: number;
    perfectDrops: number;
    heightMeters: number;
    project: Project;
    isNewRank1: boolean;
    currentRank: number;
  } | null>(null);

  // Subscribe to real-time global projects from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToGlobalProjects(
      (globalProjects) => {
        setProjects(globalProjects);
        setIsConnectedToCloud(true);
      },
      (err) => {
        console.warn('Firestore live sync fallback to local cache:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Compute Current #1 Reigning Champion
  const rank1Project = useMemo(() => {
    if (projects.length === 0) return null;
    const sorted = [...projects].sort((a, b) => b.bestScore - a.bestScore);
    return sorted[0];
  }, [projects]);

  // Launch Game for a specific project
  const handleStartGame = (project: Project) => {
    setActiveProject(project);
    setIsGaming(true);
    setIsGameOverOpen(false);
  };

  // Launch Project Selector modal
  const handleOpenSelectProject = () => {
    setIsSelectModalOpen(true);
  };

  // Handle Game Over
  const handleGameOver = async (stats: {
    score: number;
    traysStacked: number;
    maxCombo: number;
    perfectDrops: number;
    heightMeters: number;
  }) => {
    if (!activeProject) return;

    const playerHandle = getStoredPlayerHandle() || activeProject.handle;
    const scoreVal = stats.traysStacked || stats.score;

    try {
      const { updatedProject, isNewRank1, rank } = await recordGameRun(
        activeProject,
        scoreVal,
        playerHandle,
        projects
      );

      setActiveProject(updatedProject);
      setLastGameResult({
        ...stats,
        project: updatedProject,
        isNewRank1,
        currentRank: rank,
      });
    } catch (e) {
      console.error('Error saving score to Firestore:', e);
    }

    setIsGaming(false);
    setIsGameOverOpen(true);
  };

  // Replay with the same project
  const handlePlayAgain = () => {
    if (activeProject) {
      setIsGameOverOpen(false);
      setIsGaming(true);
    }
  };

  // Handle new project submission
  const handleNewProjectCreated = (newProj: Project) => {
    handleStartGame(newProj);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#071E49]">
      {/* 1. Official Header */}
      <Header
        onOpenSubmit={() => setIsSubmitModalOpen(true)}
        onOpenRegulations={() => setIsRegulationsOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        totalProjectsCount={projects.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        
        {/* 2. Top Billboard Banner (#1 Reigning Champion or First Project Invitation) */}
        {rank1Project ? (
          <BillboardBanner
            rank1Project={rank1Project}
            onPlayProject={handleStartGame}
            onSelectProject={handleOpenSelectProject}
            onOpenCertificate={(p) => {
              setActiveProject(p);
              setIsCertificateOpen(true);
            }}
          />
        ) : (
          <div className="bg-gradient-to-br from-[#071E49] via-[#0B2556] to-[#071E49] border border-slate-700/70 rounded-2xl p-6 sm:p-8 text-white text-center shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#162C5A] to-[#0A1D40] text-[#D1B06C] flex items-center justify-center border border-[#D1B06C]/40 mb-3 shadow-xs">
              <Trophy className="w-6 h-6 text-[#D1B06C]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Papan Billboard Juara #1 Masih Kosong!
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl mx-auto">
              Daftarkan proyek atau startup-mu sekarang, mainkan tantangan menara baki Ompreng, dan rebut tahta #1 pertama di OmprengBid!
            </p>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="mt-4 bg-[#D1B06C] hover:bg-[#c4a15b] text-[#071E49] font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition active:scale-95 inline-flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Daftarkan Proyek Pertama Sekarang</span>
            </button>
          </div>
        )}

        {/* Quick Stacking Action Bar / Stats Strip */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 text-xs sm:text-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#D1B06C] flex items-center justify-center border border-slate-200">
              <Layers className="w-5 h-5 text-[#071E49]" />
            </div>
            <div>
              <div className="font-semibold text-[#071E49] text-sm sm:text-base">
                Kompetisi Menara Baki Ompreng 2.5D
              </div>
              <div className="text-xs text-slate-500">
                Presisi potong mekanikal • Drop <span className="font-mono text-[#071E49] font-medium">&lt; 0.12u</span> untuk kombo & restorasi ukuran baki
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              id="btn-quick-play-random"
              onClick={() => {
                if (projects.length === 0) {
                  setIsSubmitModalOpen(true);
                } else {
                  handleOpenSelectProject();
                }
              }}
              className="w-full sm:w-auto bg-[#071E49] hover:bg-[#0c2a63] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs flex items-center justify-center space-x-2 transition active:scale-95"
            >
              <Play className="w-4 h-4 text-[#D1B06C] fill-current" />
              <span>{projects.length === 0 ? 'Daftar Proyek & Mulai Main' : 'Mulai Main & Boost Proyek'}</span>
            </button>
          </div>
        </div>

        {/* 3. Main Leaderboard Section */}
        <LeaderboardTable
          projects={projects}
          onPlayProject={handleStartGame}
          onOpenSubmit={() => setIsSubmitModalOpen(true)}
        />

        {/* Institutional Mission Narrative */}
        <div className="bg-[#071E49] text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center space-x-1.5 bg-slate-800 text-[#D1B06C] px-3 py-1 rounded-full text-xs font-medium border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Kompetisi Tech Builders & Indie Hackers</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                Membangun Ekosistem Digital Indonesia yang Kokoh & Presisi
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                OmprengBid mempertemukan para tech builder, software engineer, dan startup founder di seluruh Nusantara. Menara baki ompreng stainless steel ini melambangkan kekokohan fondasi, ketelitian kode, dan semangat gotong royong digital anak bangsa.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-xl text-center space-y-2">
              <div className="text-xs text-[#D1B06C] font-medium">
                Material Baki Ompreng
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                SUS 304 • 5 Sekat
              </div>
              <div className="text-xs text-slate-300">
                Presisi 60 FPS • Stainless Steel
              </div>
              <button
                onClick={() => setIsRegulationsOpen(true)}
                className="text-xs text-[#D1B06C] hover:underline block mx-auto pt-1 font-medium"
              >
                Pelajari Regulasi Lengkap →
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-md bg-[#071E49] text-[#D1B06C] flex items-center justify-center font-bold text-[10px] font-mono">
              OB
            </div>
            <div>
              <span className="font-semibold text-[#071E49]">OmprengBid</span> • Komunitas Indie Hacker & Tech Builder Indonesia © 2026
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="text-slate-500 hover:text-[#071E49] transition"
            >
              Tutorial & Bantuan
            </button>
            <span>•</span>
            <button
              onClick={() => setIsRegulationsOpen(true)}
              className="text-slate-500 hover:text-[#071E49] transition"
            >
              Regulasi Kompetisi
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="text-slate-500 hover:text-[#071E49] transition"
            >
              Daftar Proyek Baru
            </button>
            <span>•</span>
            <span className="text-slate-700 font-mono">
              v2.5D Engine
            </span>
          </div>
        </div>
      </footer>

      {/* --- ALL MODALS --- */}

      {/* 0. Tutorial Modal (When triggered from Dashboard) */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onStartGame={() => {
          setIsTutorialOpen(false);
          if (projects.length > 0) {
            handleStartGame(projects[0]);
          } else {
            setIsSubmitModalOpen(true);
          }
        }}
        isPreGame={false}
      />

      {/* 1. Fullscreen / Dedicated Arcade 2.5D Game Stage */}
      {activeProject && (
        <GameStageModal
          isOpen={isGaming}
          project={activeProject}
          rank1Project={rank1Project || undefined}
          onClose={() => setIsGaming(false)}
          onGameOver={handleGameOver}
        />
      )}

      {/* 2. Submit New Project Modal */}
      <SubmitProjectModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleNewProjectCreated}
      />

      {/* 3. Select Project Modal */}
      <SelectProjectModal
        isOpen={isSelectModalOpen}
        projects={projects}
        onClose={() => setIsSelectModalOpen(false)}
        onSelect={(p) => {
          setIsSelectModalOpen(false);
          handleStartGame(p);
        }}
        onOpenSubmit={() => setIsSubmitModalOpen(true)}
      />

      {/* 4. Game Over Modal */}
      {lastGameResult && (
        <GameOverModal
          isOpen={isGameOverOpen}
          score={lastGameResult.score}
          traysStacked={lastGameResult.traysStacked}
          maxCombo={lastGameResult.maxCombo}
          perfectDrops={lastGameResult.perfectDrops}
          heightMeters={lastGameResult.heightMeters}
          project={lastGameResult.project}
          isNewRank1={lastGameResult.isNewRank1}
          currentRank={lastGameResult.currentRank}
          onPlayAgain={handlePlayAgain}
          onChangeProject={() => {
            setIsGameOverOpen(false);
            setIsSelectModalOpen(true);
          }}
          onOpenCertificate={() => {
            setIsGameOverOpen(false);
            setIsCertificateOpen(true);
          }}
          onClose={() => setIsGameOverOpen(false)}
        />
      )}

      {/* 5. Official BGN Certificate Modal */}
      {activeProject && (
        <CertificateModal
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          project={activeProject}
          score={lastGameResult?.score || activeProject.bestScore}
          heightMeters={lastGameResult?.heightMeters || +(activeProject.bestScore * 0.045).toFixed(2)}
          playerHandle={lastGameResult?.project.lastPlayer || activeProject.lastPlayer || activeProject.handle}
        />
      )}

      {/* 6. Official Regulations Modal */}
      <RegulationsModal
        isOpen={isRegulationsOpen}
        onClose={() => setIsRegulationsOpen(false)}
      />

    </div>
  );
}
