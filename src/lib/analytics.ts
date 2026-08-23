/**
 * Google Analytics 4 (GA4) Integration
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Get the GA measurement ID from environment variables or default to the provisioned ID
export const GA_MEASUREMENT_ID = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID || 'G-S8X4YY6499';

/**
 * Initialize Google Analytics 4
 */
export function initGA(): void {
  if (typeof window === 'undefined') return;

  // Even if no ID is set yet, prepare dataLayer so calls won't error out
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
  }

  if (GA_MEASUREMENT_ID) {
    // If not already in index.html, inject script
    const existingScript = document.querySelector(`script[src*="${GA_MEASUREMENT_ID}"]`) || document.getElementById('ga-gtag-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'ga-gtag-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
    }

    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true,
    });
    console.log(`[Google Analytics] Initialized with ID: ${GA_MEASUREMENT_ID}`);
  }
}

/**
 * Generic event tracker
 */
export function trackEvent(action: string, params: Record<string, any> = {}): void {
  try {
    if (window.gtag) {
      window.gtag('event', action, params);
    }
  } catch (err) {
    console.warn('[Google Analytics] Failed to track event:', action, err);
  }
}

/**
 * Track Game Start
 */
export function trackGameStart(projectName: string, projectId: string): void {
  trackEvent('game_start', {
    project_name: projectName,
    project_id: projectId,
  });
}

/**
 * Track Game Over
 */
export function trackGameOver(data: {
  projectName: string;
  score: number;
  traysStacked: number;
  maxCombo: number;
  perfectDrops: number;
  isNewRank1: boolean;
}): void {
  trackEvent('game_over', {
    project_name: data.projectName,
    score: data.score,
    trays_stacked: data.traysStacked,
    max_combo: data.maxCombo,
    perfect_drops: data.perfectDrops,
    is_new_rank_1: data.isNewRank1,
  });
}

/**
 * Track Project Registration
 */
export function trackProjectRegistered(projectName: string, category: string, handle: string): void {
  trackEvent('project_registered', {
    project_name: projectName,
    category: category,
    handle: handle,
  });
}

/**
 * Track External Link Click
 */
export function trackProjectLinkClick(projectName: string, url: string): void {
  trackEvent('project_link_click', {
    project_name: projectName,
    link_url: url,
  });
}

/**
 * Track Social Share
 */
export function trackShare(platform: 'twitter' | 'threads' | 'whatsapp' | 'discord' | 'copy', projectName: string): void {
  trackEvent('share', {
    method: platform,
    content_type: 'game_score',
    item_id: projectName,
  });
}
