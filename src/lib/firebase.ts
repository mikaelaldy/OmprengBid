import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, updateDoc, increment, onSnapshot, getDocs, query, orderBy } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
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
export const db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

// Authenticate anonymously so requests are authorized
let currentUser: User | null = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (!user) {
    signInAnonymously(auth).catch((err) => {
      console.warn('Anonymous sign-in error:', err);
    });
  }
});

// Ensure anonymous authentication is initiated immediately
signInAnonymously(auth).catch((err) => {
  console.warn('Initial anonymous sign-in attempt:', err);
});

export const PROJECTS_COLLECTION = 'projects';
export const SITE_STATS_COLLECTION = 'site_stats';
export const ACTIVE_VISITORS_COLLECTION = 'active_visitors';

export interface SiteStats {
  totalVisitors: number;
  totalProjectClicks: number;
  totalGamesPlayed: number;
  lastUpdated: number;
}

/**
 * Subscribe to all projects in real-time ordered by bestScore descending
 */
export function subscribeToProjects(
  onUpdate: (projects: Project[]) => void,
  onError?: (err: Error) => void
): () => void {
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
          runsCount: typeof data.runsCount === 'number' ? data.runsCount : 0,
          clicksCount: typeof data.clicksCount === 'number' ? data.clicksCount : 0,
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
          updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
          verified: Boolean(data.verified),
          badge: data.badge,
          lastPlayer: data.lastPlayer,
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
      console.error('Firestore snapshot subscription error:', err);
      if (onError) onError(err);
    }
  );
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
  // Format URL
  let formattedUrl = data.url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }

  // Format handle with @
  let formattedHandle = data.handle.trim();
  if (!formattedHandle.startsWith('@')) {
    formattedHandle = '@' + formattedHandle;
  }

  const projectId = 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const startScore = typeof data.initialScore === 'number' && data.initialScore > 0 ? data.initialScore : 0;
  const runsCount = startScore > 0 ? 1 : 0;

  const newProject: Project = {
    id: projectId,
    name: data.name.trim(),
    url: formattedUrl,
    handle: formattedHandle,
    tagline: data.tagline.trim() || 'Proyek builder ekosistem inovasi digital Indonesia',
    category: data.category,
    bestScore: startScore,
    dailyBestScore: startScore,
    runsCount: runsCount,
    clicksCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    verified: false,
    lastPlayer: formattedHandle,
  };

  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  await setDoc(docRef, newProject);

  // If initial game was played, update site stats
  if (startScore > 0) {
    const statsRef = doc(db, SITE_STATS_COLLECTION, 'global');
    await setDoc(
      statsRef,
      {
        totalGamesPlayed: increment(1),
        lastUpdated: Date.now(),
      },
      { merge: true }
    );
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
  const newBest = Math.max(project.bestScore, score);
  const newDailyBest = Math.max(project.dailyBestScore, score);
  const newRuns = project.runsCount + 1;
  const lastPlayer = playerHandle || project.lastPlayer || project.handle;

  const docRef = doc(db, PROJECTS_COLLECTION, project.id);
  await updateDoc(docRef, {
    bestScore: newBest,
    dailyBestScore: newDailyBest,
    runsCount: increment(1),
    updatedAt: Date.now(),
    lastPlayer: lastPlayer,
  });

  const updatedProject: Project = {
    ...project,
    bestScore: newBest,
    dailyBestScore: newDailyBest,
    runsCount: newRuns,
    updatedAt: Date.now(),
    lastPlayer,
  };

  return {
    updatedProject,
    isNewRank1: score > project.bestScore,
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
  } catch (err) {
    console.error('Error incrementing click in Firestore:', err);
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
  } catch (err) {
    console.error('Error recording visitor visit in Firestore:', err);
  }
}

/**
 * Subscribe to global site stats in real-time
 */
export function subscribeToSiteStats(
  onUpdate: (stats: SiteStats) => void
): () => void {
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
    (err) => {
      console.warn('Site stats snapshot error:', err);
    }
  );
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
    } catch (e) {
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
    } catch (e) {
      // ignore
    }
  };
  window.addEventListener('beforeunload', handleUnload);

  // Subscribe to active visitors collection
  const activeColRef = collection(db, ACTIVE_VISITORS_COLLECTION);
  const unsubscribeSnapshot = onSnapshot(activeColRef, (snapshot) => {
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
  });

  return () => {
    clearInterval(intervalId);
    window.removeEventListener('beforeunload', handleUnload);
    unsubscribeSnapshot();
    try {
      setDoc(sessionDocRef, { sessionId, lastSeen: 0 });
    } catch (e) {
      // ignore
    }
  };
}

