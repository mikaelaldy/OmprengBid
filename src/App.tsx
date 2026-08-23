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
  trackUniqueSessionVisit,
  startLiveVisitorHeartbeat,
  subscribeToSiteStats,
  SiteStats,
} from './utils/storage';
import { Trophy, Sparkles, ExternalLink } from 'lucide-react';
import { trackGameStart, trackGameOver } from './lib/analytics';

export default function App() {

  const [projects, setProjects] = useState<Project[]>(() => loadCachedProjects());
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [pendingInitialScore, setPendingInitialScore] = useState<number | undefined>(undefined);
  const [isConnectedToCloud, setIsConnectedToCloud] = useState<boolean>(false);
  const [liveVisitors, setLiveVisitors] = useState<number>(1);
  const [siteStats, setSiteStats] = useState<SiteStats>({
    totalVisitors: 1,
    totalProjectClicks: 0,
    totalGamesPlayed: 0,
    lastUpdated: Date.now(),
  });
  
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
    project: Project | null;
    isNewRank1: boolean;
    currentRank: number;
  } | null>(null);

  // Track session visit on mount and initiate live presence
  useEffect(() => {
    trackUniqueSessionVisit();
    
    // Live visitors heartbeat listener
    const unsubscribeHeartbeat = startLiveVisitorHeartbeat((count) => {
      setLiveVisitors(count);
    });

    // Site stats subscription
    const unsubscribeStats = subscribeToSiteStats((stats) => {
      setSiteStats(stats);
    });

    return () => {
      unsubscribeHeartbeat();
      unsubscribeStats();
    };
  }, []);

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

  // Launch Game for a specific project or in free play-first mode
  const handleStartGame = (project?: Project | null) => {
    const proj = project || null;
    trackGameStart(proj ? proj.name : 'Free Play', proj ? proj.id : 'free_play');
    setActiveProject(proj);
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
    const scoreVal = stats.traysStacked || stats.score;

    if (activeProject) {
      const playerHandle = getStoredPlayerHandle() || activeProject.handle;

      try {
        const { updatedProject, isNewRank1, rank } = await recordGameRun(
          activeProject,
          scoreVal,
          playerHandle,
          projects
        );

        trackGameOver({
          projectName: updatedProject.name,
          score: scoreVal,
          traysStacked: stats.traysStacked,
          maxCombo: stats.maxCombo,
          perfectDrops: stats.perfectDrops,
          isNewRank1,
        });

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
    } else {
      // Free play mode: Calculate estimated rank in leaderboard
      const higherCount = projects.filter((p) => p.bestScore >= scoreVal).length;
      const estimatedRank = higherCount + 1;
      const isNewRank1 = rank1Project ? scoreVal > rank1Project.bestScore : true;

      trackGameOver({
        projectName: 'Free Play Session',
        score: scoreVal,
        traysStacked: stats.traysStacked,
        maxCombo: stats.maxCombo,
        perfectDrops: stats.perfectDrops,
        isNewRank1,
      });

      setLastGameResult({
        ...stats,
        project: null,
        isNewRank1,
        currentRank: estimatedRank,
      });
    }

    setIsGaming(false);
    setIsGameOverOpen(true);
  };

  // Replay with the same project or free mode
  const handlePlayAgain = () => {
    setIsGameOverOpen(false);
    setIsGaming(true);
  };

  // Handle claim score & register a new project
  const handleClaimScoreAndRegister = (score: number) => {
    setIsGameOverOpen(false);
    setPendingInitialScore(score);
    setIsSubmitModalOpen(true);
  };

  // Handle new project submission
  const handleNewProjectCreated = (newProj: Project) => {
    setActiveProject(newProj);
    setPendingInitialScore(undefined);
    setIsCertificateOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col text-black">
      {/* 1. Official Header */}
      <Header
        onOpenSubmit={() => {
          setPendingInitialScore(undefined);
          setIsSubmitModalOpen(true);
        }}
        onOpenRegulations={() => setIsRegulationsOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onStartGame={() => handleStartGame(null)}
        liveVisitors={liveVisitors}
        totalVisitors={siteStats.totalVisitors}
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
          <div className="bg-white border border-black/10 rounded-lg p-6 sm:p-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-lg bg-black/[0.05] text-black flex items-center justify-center mb-3">
              <Trophy className="w-6 h-6 text-black/60" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              Papan Billboard Juara #1 Masih Kosong
            </h2>
            <p className="text-black/60 text-xs sm:text-sm mt-1.5 max-w-xl mx-auto">
              Daftarkan proyekmu, mainkan tantangan menara ompreng, dan rebut posisi #1 pertama di OmprengBid.
            </p>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="mt-4 bg-black hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-lg transition active:scale-95 inline-flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Daftarkan Proyek Pertama</span>
            </button>
          </div>
        )}

        {/* 3. Main Leaderboard Section */}
        <LeaderboardTable
          projects={projects}
          onPlayProject={handleStartGame}
          onOpenSubmit={() => setIsSubmitModalOpen(true)}
        />

      </main>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-black/10 mt-12 py-8 text-xs text-black/55">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center font-bold text-[10px] font-mono">
                OB
              </div>
              <span className="font-semibold text-black">OmprengBid</span>
              <span>•</span>
              <span className="text-black/65">
                Made by <strong className="text-black font-semibold">mikaships</strong>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href="https://www.threads.com/@mikaships"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-black/[0.02] hover:bg-black/[0.04] text-black/75 hover:text-black rounded-lg transition font-medium border border-black/10"
              >
                <span>Follow on Threads</span>
                <ExternalLink className="w-3 h-3 text-black/45" />
              </a>
              <a
                href="https://x.com/mikaships_dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-black/[0.02] hover:bg-black/[0.04] text-black/75 hover:text-black rounded-lg transition font-medium border border-black/10"
              >
                <span>Twitter / X (@mikaships_dev)</span>
                <ExternalLink className="w-3 h-3 text-black/45" />
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="text-black/55 hover:text-black transition"
            >
              Tutorial & Bantuan
            </button>
            <span>•</span>
            <button
              onClick={() => setIsRegulationsOpen(true)}
              className="text-black/55 hover:text-black transition"
            >
              Regulasi Kompetisi
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="text-black/55 hover:text-black transition"
            >
              Daftar Proyek Baru
            </button>
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
          handleStartGame(null);
        }}
        isPreGame={false}
      />

      {/* 1. Fullscreen / Dedicated Arcade 2.5D Game Stage */}
      <GameStageModal
        isOpen={isGaming}
        project={activeProject}
        rank1Project={rank1Project || undefined}
        onClose={() => setIsGaming(false)}
        onGameOver={handleGameOver}
      />

      {/* 2. Submit New Project Modal */}
      <SubmitProjectModal
        isOpen={isSubmitModalOpen}
        initialScore={pendingInitialScore}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setPendingInitialScore(undefined);
        }}
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
        onOpenSubmit={() => {
          setPendingInitialScore(undefined);
          setIsSubmitModalOpen(true);
        }}
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
          onRegisterProject={handleClaimScoreAndRegister}
          onBoostExistingProject={() => {
            setIsGameOverOpen(false);
            setIsSelectModalOpen(true);
          }}
          onOpenCertificate={() => {
            setIsGameOverOpen(false);
            if (activeProject) {
              setIsCertificateOpen(true);
            }
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
          playerHandle={lastGameResult?.project?.lastPlayer || activeProject.lastPlayer || activeProject.handle}
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
