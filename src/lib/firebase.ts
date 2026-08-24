import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  onSnapshot,
  query,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { Project, ProjectCategory } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    }, firebaseConfigJson.firestoreDatabaseId || '(default)');
  } catch (e) {
    return getFirestore(app, firebaseConfigJson.firestoreDatabaseId || '(default)');
  }
})();

export const auth = getAuth(app);

// Master Admin Email with supreme moderation privileges
export const ADMIN_EMAIL = 'mikaelaldy56@gmail.com';

// Current authenticated user state
let currentUser: User | null = null;
const authListeners: Array<(user: User | null) => void> = [];

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  authListeners.forEach((fn) => fn(user));
  if (!user) {
    signInAnonymously(auth).catch(() => {
      // offline or silent retry
    });
  }
});

// Ensure anonymous authentication is initiated immediately if no user
signInAnonymously(auth).catch(() => {
  // offline or silent retry
});

/**
 * Subscribe to user auth state changes
 */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  authListeners.push(callback);
  callback(currentUser);
  return () => {
    const index = authListeners.indexOf(callback);
    if (index > -1) {
      authListeners.splice(index, 1);
    }
  };
}

/**
 * Sign in using Google Account
 */
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    return result.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

/**
 * Sign out and revert to anonymous session
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
    await signInAnonymously(auth).catch(() => {});
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

/**
 * Check if the user is the Master Admin
 */
export function isUserAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
}

/**
 * Check if the user has permission to delete or manage a project
 */
export function canUserManageProject(user: User | null, project: Project): boolean {
  if (!user) return false;
  // 1. Master Admin can manage and delete any project
  if (isUserAdmin(user)) return true;

  // 2. Creator by Google Email
  if (user.email && project.creatorEmail && user.email.toLowerCase().trim() === project.creatorEmail.toLowerCase().trim()) {
    return true;
  }

  // 3. Creator by UID
  if (user.uid && project.creatorId && user.uid === project.creatorId) {
    return true;
  }

  return false;
}

export function getCurrentAuthUser(): User | null {
  return currentUser || auth.currentUser;
}


export const PROJECTS_COLLECTION = 'projects';
export const SITE_STATS_COLLECTION = 'site_stats';
export const ACTIVE_VISITORS_COLLECTION = 'active_visitors';

export interface SiteStats {
  totalVisitors: number;
  totalProjectClicks: number;
  totalGamesPlayed: number;
  lastUpdated: number;
}

// Timeout helper to avoid infinite hanging when network is disconnected
function withTimeout<T>(promise: Promise<T>, ms: number = 6000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out')), ms)
    ),
  ]);
}

/**
 * Subscribe to all projects in real-time ordered by bestScore descending
 */
export function subscribeToProjects(
  onUpdate: (projects: Project[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const projectsRef = collection(db, PROJECTS_COLLECTION);
    const q = query(projectsRef);

    return onSnapshot(
      q,
      (snapshot) => {
        const projects: Project[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          projects.push({
            id: docSnap.id,
            name: data.name || 'Untitled Project',
            url: data.url || '',
            handle: data.handle || '@builder',
            tagline: data.tagline || '',
            category: (data.category as ProjectCategory) || 'SaaS',
            bestScore: typeof data.bestScore === 'number' ? data.bestScore : 0,
            dailyBestScore: typeof data.dailyBestScore === 'number' ? data.dailyBestScore : 0,
            dailyBestDate: typeof data.dailyBestDate === 'string' ? data.dailyBestDate : undefined,
            runsCount: typeof data.runsCount === 'number' ? data.runsCount : 0,
            clicksCount: typeof data.clicksCount === 'number' ? data.clicksCount : 0,
            createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
            updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
            verified: Boolean(data.verified),
            badge: data.badge,
            lastPlayer: data.lastPlayer,
            creatorId: data.creatorId,
            creatorEmail: data.creatorEmail,
            creatorName: data.creatorName,
          });
        });

        // Sort locally by bestScore desc, then runsCount desc
        projects.sort((a, b) => {
          if (b.bestScore !== a.bestScore) {
            return b.bestScore - a.bestScore;
          }
          return b.runsCount - a.runsCount;
        });

        onUpdate(projects);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  } catch (err) {
    if (onError) onError(err as Error);
    return () => {};
  }
}

/**
 * Register a new project in Firestore (with optional initial score achieved from playing first)
 */
export async function registerProjectFirestore(data: {
  name: string;
  url: string;
  handle: string;
  tagline: string;
  category: ProjectCategory;
  initialScore?: number;
}): Promise<Project> {
  // Format handle with @
  let formattedHandle = data.handle.trim();
  if (!formattedHandle.startsWith('@')) {
    formattedHandle = '@' + formattedHandle;
  }

  const projectId = 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const startScore = typeof data.initialScore === 'number' && data.initialScore > 0 ? data.initialScore : 0;
  const runsCount = startScore > 0 ? 1 : 0;

  const d = new Date();
  d.setUTCHours(d.getUTCHours() + 7);
  const todayDateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

  const user = getCurrentAuthUser();
  const isRealUser = user && !user.isAnonymous;

  const newProject: Project = {
    id: projectId,
    name: data.name.trim(),
    url: data.url,
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
    creatorId: isRealUser ? user.uid : undefined,
    creatorEmail: isRealUser ? user.email || undefined : undefined,
    creatorName: isRealUser ? user.displayName || undefined : undefined,
  };

  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  await withTimeout(setDoc(docRef, newProject));

  // If initial game was played, update site stats
  if (startScore > 0) {
    try {
      const statsRef = doc(db, SITE_STATS_COLLECTION, 'global');
      await setDoc(
        statsRef,
        {
          totalGamesPlayed: increment(1),
          lastUpdated: Date.now(),
        },
        { merge: true }
      );
    } catch {
      // Non-critical background update
    }
  }

  return newProject;
}

/**
 * Record a game run and update high scores in Firestore
 */
export async function recordGameRunFirestore(
  project: Project,
  score: number,
  playerHandle: string
): Promise<{ updatedProject: Project; isNewRank1: boolean }> {
  
  const d = new Date();
  d.setUTCHours(d.getUTCHours() + 7);
  const todayDateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

  let newDailyBest = score;
  if (project.dailyBestDate === todayDateStr) {
    newDailyBest = Math.max(project.dailyBestScore || 0, score);
  }

  const newBest = Math.max(project.bestScore || 0, score);
  const newRuns = (project.runsCount || 0) + 1;
  const lastPlayer = playerHandle || project.lastPlayer || project.handle;

  const docRef = doc(db, PROJECTS_COLLECTION, project.id);
  await withTimeout(
    updateDoc(docRef, {
      bestScore: newBest,
      dailyBestScore: newDailyBest,
      dailyBestDate: todayDateStr,
      runsCount: increment(1),
      updatedAt: Date.now(),
      lastPlayer: lastPlayer,
    })
  );

  const updatedProject: Project = {
    ...project,
    bestScore: newBest,
    dailyBestScore: newDailyBest,
    dailyBestDate: todayDateStr,
    runsCount: newRuns,
    updatedAt: Date.now(),
    lastPlayer,
  };

  return {
    updatedProject,
    isNewRank1: score > (project.bestScore || 0),
  };
}

/**
 * Increment click count on a project's external link in Firestore and global stats
 */
export async function incrementClickFirestore(projectId: string): Promise<void> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(docRef, {
      clicksCount: increment(1),
    });

    // Update global click stats
    const statsRef = doc(db, SITE_STATS_COLLECTION, 'global');
    await setDoc(
      statsRef,
      {
        totalProjectClicks: increment(1),
        lastUpdated: Date.now(),
      },
      { merge: true }
    );
  } catch {
    // Gracefully handle offline
  }
}

/**
 * Record a unique visitor visit in Firestore
 */
export async function recordVisitorVisitFirestore(): Promise<void> {
  try {
    const statsRef = doc(db, SITE_STATS_COLLECTION, 'global');
    await setDoc(
      statsRef,
      {
        totalVisitors: increment(1),
        lastUpdated: Date.now(),
      },
      { merge: true }
    );
  } catch {
    // Gracefully handle offline
  }
}

/**
 * Subscribe to global site stats in real-time
 */
export function subscribeToSiteStats(
  onUpdate: (stats: SiteStats) => void
): () => void {
  try {
    const statsRef = doc(db, SITE_STATS_COLLECTION, 'global');
    return onSnapshot(
      statsRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          onUpdate({
            totalVisitors: typeof data.totalVisitors === 'number' ? data.totalVisitors : 0,
            totalProjectClicks: typeof data.totalProjectClicks === 'number' ? data.totalProjectClicks : 0,
            totalGamesPlayed: typeof data.totalGamesPlayed === 'number' ? data.totalGamesPlayed : 0,
            lastUpdated: typeof data.lastUpdated === 'number' ? data.lastUpdated : Date.now(),
          });
        } else {
          onUpdate({
            totalVisitors: 1,
            totalProjectClicks: 0,
            totalGamesPlayed: 0,
            lastUpdated: Date.now(),
          });
        }
      },
      () => {
        // Fallback silently if offline
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * Real-time Active Visitor Presence Heartbeat
 */
export function startLiveVisitorHeartbeat(
  onLiveCountChange: (liveCount: number) => void
): () => void {
  const sessionId = 'session_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
  const sessionDocRef = doc(db, ACTIVE_VISITORS_COLLECTION, sessionId);

  // Send initial heartbeat
  const sendHeartbeat = async () => {
    try {
      await setDoc(sessionDocRef, {
        sessionId,
        lastSeen: Date.now(),
      });
    } catch {
      // ignore transient network errors
    }
  };

  // Heartbeat interval every 15 seconds
  sendHeartbeat();
  const intervalId = setInterval(sendHeartbeat, 15000);

  // Clean up own session on tab close / leave
  const handleUnload = () => {
    try {
      setDoc(sessionDocRef, { sessionId, lastSeen: 0 });
    } catch {
      // ignore
    }
  };
  window.addEventListener('beforeunload', handleUnload);

  // Subscribe to active visitors collection
  try {
    const activeColRef = collection(db, ACTIVE_VISITORS_COLLECTION);
    const unsubscribeSnapshot = onSnapshot(
      activeColRef,
      (snapshot) => {
        const now = Date.now();
        const activeThreshold = now - 45000; // Active within last 45 seconds
        let activeCount = 0;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && typeof data.lastSeen === 'number' && data.lastSeen > activeThreshold) {
            activeCount++;
          }
        });

        // Always ensure at least 1 (the current user)
        onLiveCountChange(Math.max(1, activeCount));
      },
      () => {
        // Default to 1 on offline
        onLiveCountChange(1);
      }
    );

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleUnload);
      unsubscribeSnapshot();
      try {
        setDoc(sessionDocRef, { sessionId, lastSeen: 0 });
      } catch {
        // ignore
      }
    };
  } catch {
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }
}

/**
 * Permanently remove a project from Firestore database
 */
export async function deleteProjectFirestore(projectId: string): Promise<void> {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  await withTimeout(deleteDoc(docRef));
}

/**
 * Toggle or set verified badge status for a project in Firestore
 */
export async function updateProjectVerificationFirestore(
  projectId: string,
  verified: boolean
): Promise<void> {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  await withTimeout(
    updateDoc(docRef, {
      verified,
      updatedAt: Date.now(),
    })
  );
}

/**
 * Reset suspicious or bot scores for a project in Firestore
 */
export async function resetProjectScoresFirestore(projectId: string): Promise<void> {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  await withTimeout(
    updateDoc(docRef, {
      bestScore: 0,
      dailyBestScore: 0,
      runsCount: 0,
      updatedAt: Date.now(),
    })
  );
}

