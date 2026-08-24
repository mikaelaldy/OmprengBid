import { Project, ProjectCategory } from '../types';
import {
  registerProjectFirestore,
  recordGameRunFirestore,
  incrementClickFirestore,
  recordVisitorVisitFirestore,
  subscribeToSiteStats,
  startLiveVisitorHeartbeat,
  subscribeToProjects as subscribeFirestore,
  deleteProjectFirestore,
  updateProjectVerificationFirestore,
  resetProjectScoresFirestore,
  SiteStats,
} from '../lib/firebase';

const STORAGE_KEY = 'omprengbid_projects_v7';
const LAST_PLAYER_HANDLE_KEY = 'omprengbid_last_player_handle';
const VISITOR_RECORDED_SESSION_KEY = 'omprengbid_visitor_logged_v1';

export function getWIBDateString(): string {
  const d = new Date();
  d.setUTCHours(d.getUTCHours() + 7);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export const INITIAL_PROJECTS: Project[] = [];

// List of sample test project IDs to purge
export const TEST_PROJECT_IDS = [
  'proj-nusantara-ai',
  'proj-warung-os',
  'proj-edukarsa',
  'proj-tani-connect',
];


/**
 * Record visitor visit once per browser session
 */
export function trackUniqueSessionVisit(): void {
  try {
    const hasRecorded = sessionStorage.getItem(VISITOR_RECORDED_SESSION_KEY);
    if (!hasRecorded) {
      sessionStorage.setItem(VISITOR_RECORDED_SESSION_KEY, 'true');
      recordVisitorVisitFirestore();
    }
  } catch {
    recordVisitorVisitFirestore();
  }
}

export { subscribeToSiteStats, startLiveVisitorHeartbeat };
export type { SiteStats };

export function getTodayDateString(): string {
  return getWIBDateString();
}

/**
 * Normalize projects with respect to current date
 */
function normalizeProjectsWithDate(projects: Project[]): Project[] {
  const today = getWIBDateString();
  return projects.map((p) => {
    if (p.dailyBestDate !== today) {
      return {
        ...p,
        dailyBestScore: 0,
        dailyBestDate: today,
      };
    }
    return p;
  });
}

/**
 * Load locally cached projects for instant initial render before Firestore connects
 */
export function loadCachedProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: Project[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed.filter((p) => !TEST_PROJECT_IDS.includes(p.id));
        return normalizeProjectsWithDate(filtered);
      }
    }
    return [];
  } catch (e) {
    console.error('Error loading cached projects:', e);
    return [];
  }
}

/**
 * Save projects to local cache
 */
export function saveCachedProjects(projects: Project[]): void {
  try {
    const filtered = projects.filter((p) => !TEST_PROJECT_IDS.includes(p.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error caching projects:', e);
  }
}

/**
 * Subscribe to real-time global Firestore updates
 */
export function subscribeToGlobalProjects(
  onUpdate: (projects: Project[]) => void,
  onError?: (err: Error) => void
): () => void {
  return subscribeFirestore(
    (firestoreProjects) => {
      if (firestoreProjects && firestoreProjects.length > 0) {
        // Filter out any obsolete test projects
        const filtered = firestoreProjects.filter((p) => {
          const isTest = TEST_PROJECT_IDS.includes(p.id);
          if (isTest) {
            // Clean up test document from Firestore silently
            deleteProjectFirestore(p.id).catch(() => {});
          }
          return !isTest;
        });

        const normalized = normalizeProjectsWithDate(filtered);
        saveCachedProjects(normalized);
        onUpdate(normalized);
      } else {
        const cached = loadCachedProjects();
        onUpdate(cached);
      }
    },
    (err) => {
      const cached = loadCachedProjects();
      onUpdate(cached);
      if (onError) onError(err);
    }
  );
}


/**
 * Register a new project globally in Firestore with resilient local fallback
 */
export async function registerNewProject(data: {
  name: string;
  url: string;
  handle: string;
  tagline: string;
  category: ProjectCategory;
  initialScore?: number;
}): Promise<Project> {
  const todayDateStr = getWIBDateString();
  let formattedHandle = data.handle.trim();
  if (!formattedHandle.startsWith('@')) {
    formattedHandle = '@' + formattedHandle;
  }
  const startScore = typeof data.initialScore === 'number' && data.initialScore > 0 ? data.initialScore : 0;
  const runsCount = startScore > 0 ? 1 : 0;

  const localProject: Project = {
    id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    name: data.name.trim(),
    url: data.url.trim(),
    handle: formattedHandle,
    tagline: data.tagline.trim() || 'Proyek builder ekosistem inovasi digital Indonesia',
    category: data.category,
    bestScore: startScore,
    dailyBestScore: startScore,
    dailyBestDate: todayDateStr,
    runsCount: runsCount,
    clicksCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    verified: false,
    lastPlayer: formattedHandle,
  };

  try {
    const cloudProject = await registerProjectFirestore(data);
    const currentCached = loadCachedProjects().filter((p) => p.id !== cloudProject.id);
    const updatedList = [cloudProject, ...currentCached];
    saveCachedProjects(updatedList);
    return cloudProject;
  } catch (err) {
    console.warn('Firestore offline / unavailable, saving project to local storage fallback:', err);
    const currentCached = loadCachedProjects();
    const updatedList = [localProject, ...currentCached];
    saveCachedProjects(updatedList);
    return localProject;
  }
}

/**
 * Record a game run globally in Firestore with resilient local fallback
 */
export async function recordGameRun(
  project: Project,
  score: number,
  playerHandle: string,
  allProjects: Project[]
): Promise<{ updatedProject: Project; isNewRank1: boolean; rank: number }> {
  const todayDateStr = getWIBDateString();
  const lastPlayer = playerHandle || project.lastPlayer || project.handle;
  const newBest = Math.max(project.bestScore || 0, score);
  let newDailyBest = score;
  if (project.dailyBestDate === todayDateStr) {
    newDailyBest = Math.max(project.dailyBestScore || 0, score);
  }
  const newRuns = (project.runsCount || 0) + 1;

  const localUpdatedProject: Project = {
    ...project,
    bestScore: newBest,
    dailyBestScore: newDailyBest,
    dailyBestDate: todayDateStr,
    runsCount: newRuns,
    updatedAt: Date.now(),
    lastPlayer,
  };

  let finalProject = localUpdatedProject;
  let isNewRank1 = score > (project.bestScore || 0);

  try {
    const cloudRes = await recordGameRunFirestore(project, score, playerHandle);
    finalProject = cloudRes.updatedProject;
    isNewRank1 = cloudRes.isNewRank1;
  } catch (err) {
    console.warn('Firestore offline / unavailable, saving game run to local storage fallback:', err);
  }

  const updatedList = allProjects.map((p) => (p.id === project.id ? finalProject : p));
  saveCachedProjects(updatedList);

  const sortedAllTime = [...updatedList].sort((a, b) => b.bestScore - a.bestScore);
  const currentRank = sortedAllTime.findIndex((p) => p.id === project.id) + 1;

  return {
    updatedProject: finalProject,
    isNewRank1,
    rank: currentRank > 0 ? currentRank : 1,
  };
}

/**
 * Increment link click count in Firestore with local fallback
 */
export function incrementClickCount(projectId: string): void {
  try {
    incrementClickFirestore(projectId);
  } catch {
    // ignore
  }

  const cached = loadCachedProjects();
  const updated = cached.map((p) => (p.id === projectId ? { ...p, clicksCount: (p.clicksCount || 0) + 1 } : p));
  saveCachedProjects(updated);
}

export function getStoredPlayerHandle(): string {
  return localStorage.getItem(LAST_PLAYER_HANDLE_KEY) || '';
}

export function setStoredPlayerHandle(handle: string): void {
  localStorage.setItem(LAST_PLAYER_HANDLE_KEY, handle);
}

/**
 * Permanently delete a project from Firestore and local cache
 */
export async function deleteProject(projectId: string): Promise<void> {
  // 1. Remove from local cache immediately
  const cached = loadCachedProjects().filter((p) => p.id !== projectId);
  saveCachedProjects(cached);

  // 2. Remove from Firestore
  try {
    await deleteProjectFirestore(projectId);
  } catch (err) {
    console.warn('Could not delete project from Firestore, removed from local cache:', err);
  }
}

/**
 * Toggle verified badge for a project
 */
export async function toggleProjectVerification(projectId: string, currentStatus: boolean): Promise<void> {
  const newStatus = !currentStatus;
  const cached = loadCachedProjects().map((p) => (p.id === projectId ? { ...p, verified: newStatus } : p));
  saveCachedProjects(cached);

  try {
    await updateProjectVerificationFirestore(projectId, newStatus);
  } catch (err) {
    console.warn('Could not update verification in Firestore:', err);
  }
}

/**
 * Reset suspicious scores of a project
 */
export async function resetProjectScores(projectId: string): Promise<void> {
  const cached = loadCachedProjects().map((p) =>
    p.id === projectId ? { ...p, bestScore: 0, dailyBestScore: 0, runsCount: 0 } : p
  );
  saveCachedProjects(cached);

  try {
    await resetProjectScoresFirestore(projectId);
  } catch (err) {
    console.warn('Could not reset scores in Firestore:', err);
  }
}



