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
 * Register a new project in Firestore
 */
export async function registerProjectFirestore(data: {
  name: string;
  url: string;
  handle: string;
  tagline: string;
  category: ProjectCategory;
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

  const newProject: Project = {
    id: projectId,
    name: data.name.trim(),
    url: formattedUrl,
    handle: formattedHandle,
    tagline: data.tagline.trim() || 'Proyek builder ekosistem inovasi digital Indonesia',
    category: data.category,
    bestScore: 0,
    dailyBestScore: 0,
    runsCount: 0,
    clicksCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    verified: false,
    lastPlayer: formattedHandle,
  };

  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  await setDoc(docRef, newProject);

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
 * Increment click count on a project's external link in Firestore
 */
export async function incrementClickFirestore(projectId: string): Promise<void> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(docRef, {
      clicksCount: increment(1),
    });
  } catch (err) {
    console.error('Error incrementing click in Firestore:', err);
  }
}
