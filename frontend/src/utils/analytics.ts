// Google Analytics and SEO tracking utilities

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// Google Analytics 4 tracking
export const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }
};

// Track page views
export const trackPageView = (url: string, title: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: title,
      page_location: url,
    });
  }
};

// Common tracking events for ScreenForge
export const ScreenForgeAnalytics = {
  // User engagement
  signUp: () => trackEvent({
    action: 'sign_up',
    category: 'engagement',
    label: 'user_registration'
  }),

  signIn: () => trackEvent({
    action: 'sign_in',
    category: 'engagement',
    label: 'user_login'
  }),

  // Recording events
  startRecording: (source: 'tab' | 'window' | 'desktop') => trackEvent({
    action: 'start_recording',
    category: 'recording',
    label: source
  }),

  stopRecording: (duration: number) => trackEvent({
    action: 'stop_recording',
    category: 'recording',
    value: Math.round(duration)
  }),

  // Video events
  videoShare: (method: 'link' | 'social' | 'download') => trackEvent({
    action: 'share_video',
    category: 'sharing',
    label: method
  }),

  videoView: () => trackEvent({
    action: 'view_video',
    category: 'engagement',
    label: 'video_playback'
  }),

  videoEdit: (action: 'trim' | 'caption' | 'export') => trackEvent({
    action: 'edit_video',
    category: 'editing',
    label: action
  }),

  // Feature usage
  aiCaptions: () => trackEvent({
    action: 'use_ai_captions',
    category: 'features',
    label: 'ai_generated_captions'
  }),

  downloadControl: (enabled: boolean) => trackEvent({
    action: 'toggle_download_control',
    category: 'features',
    label: enabled ? 'enabled' : 'disabled'
  }),

  // Performance tracking
  recordingQuality: (quality: '720p' | '1080p' | '4k') => trackEvent({
    action: 'set_recording_quality',
    category: 'settings',
    label: quality
  }),

  // Error tracking
  error: (errorType: string, errorMessage: string) => trackEvent({
    action: 'error',
    category: 'errors',
    label: `${errorType}: ${errorMessage}`
  })
};

// SEO Performance tracking
export const SEOAnalytics = {
  // Track organic search traffic
  organicVisit: (searchTerm?: string) => trackEvent({
    action: 'organic_visit',
    category: 'seo',
    label: searchTerm || 'unknown'
  }),

  // Track social media referrals
  socialReferral: (platform: string) => trackEvent({
    action: 'social_referral',
    category: 'seo',
    label: platform
  }),

  // Track video shares for SEO
  videoSEOShare: (platform: string) => trackEvent({
    action: 'video_seo_share',
    category: 'seo',
    label: platform
  }),

  // Track feature page visits
  featurePageView: (feature: string) => trackEvent({
    action: 'feature_page_view',
    category: 'seo',
    label: feature
  })
};

// Initialize Google Analytics
export const initializeAnalytics = (measurementId: string) => {
  if (typeof window === 'undefined') return;

  // Create gtag function if it doesn't exist
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  // Configure GA4
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
    // Enhanced ecommerce for conversion tracking
    enhanced_conversions: true,
    // Privacy settings
    anonymize_ip: true,
    allow_google_signals: false
  });
};

// Enhanced tracking for Core Web Vitals
export const trackWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Track Largest Contentful Paint (LCP)
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      trackEvent({
        action: 'largest_contentful_paint',
        category: 'web_vitals',
        value: Math.round(entry.startTime)
      });
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Track First Input Delay (FID)
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      const fidEntry = entry as any; // Type assertion for FID-specific properties
      if (fidEntry.processingStart) {
        trackEvent({
          action: 'first_input_delay',
          category: 'web_vitals',
          value: Math.round(fidEntry.processingStart - fidEntry.startTime)
        });
      }
    }
  }).observe({ entryTypes: ['first-input'] });

  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0;
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      const clsEntry = entry as any; // Type assertion for CLS-specific properties
      if (!clsEntry.hadRecentInput && clsEntry.value) {
        clsValue += clsEntry.value;
      }
    }
    trackEvent({
      action: 'cumulative_layout_shift',
      category: 'web_vitals',
      value: Math.round(clsValue * 1000)
    });
  }).observe({ entryTypes: ['layout-shift'] });
};

// Declare global gtag function
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
