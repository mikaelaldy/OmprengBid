import { Project, ProjectCategory } from '../types';
import {
  registerProjectFirestore,
  recordGameRunFirestore,
  incrementClickFirestore,
  subscribeToProjects as subscribeFirestore,
} from '../lib/firebase';

const STORAGE_KEY = 'omprengbid_projects_v5';
const DAILY_DATE_KEY = 'omprengbid_daily_date_v5';
const LAST_PLAYER_HANDLE_KEY = 'omprengbid_last_player_handle';

export const INITIAL_PROJECTS: Project[] = [];

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Load locally cached projects for instant initial render before Firestore connects
 */
export function loadCachedProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
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
  return subscribeFirestore((firestoreProjects) => {
    saveCachedProjects(firestoreProjects);
    onUpdate(firestoreProjects);
  }, onError);
}

/**
 * Register a new project globally in Firestore
 */
export async function registerNewProject(data: {
  name: string;
  url: string;
  handle: string;
  tagline: string;
  category: ProjectCategory;
}): Promise<Project> {
  const newProject = await registerProjectFirestore(data);
  const currentCached = loadCachedProjects();
  saveCachedProjects([newProject, ...currentCached]);
  return newProject;
}

/**
 * Record a game run globally in Firestore
 */
export async function recordGameRun(
  project: Project,
  score: number,
  playerHandle: string,
  allProjects: Project[]
): Promise<{ updatedProject: Project; isNewRank1: boolean; rank: number }> {
  const { updatedProject, isNewRank1 } = await recordGameRunFirestore(project, score, playerHandle);

  const updatedList = allProjects.map((p) => (p.id === project.id ? updatedProject : p));
  saveCachedProjects(updatedList);

  const sortedAllTime = [...updatedList].sort((a, b) => b.bestScore - a.bestScore);
  const currentRank = sortedAllTime.findIndex((p) => p.id === project.id) + 1;

  return {
    updatedProject,
    isNewRank1,
    rank: currentRank,
  };
}

/**
 * Increment link click count in Firestore
 */
export function incrementClickCount(projectId: string): void {
  incrementClickFirestore(projectId);
}

export function getStoredPlayerHandle(): string {
  return localStorage.getItem(LAST_PLAYER_HANDLE_KEY) || '';
}

export function setStoredPlayerHandle(handle: string): void {
  localStorage.setItem(LAST_PLAYER_HANDLE_KEY, handle);
}
