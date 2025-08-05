import { useEffect } from 'react';

// SEO utility functions for dynamic meta tag management

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  noIndex?: boolean;
  structuredData?: object;
}

export const defaultSEO: SEOConfig = {
  title: 'ScreenForge - Professional Screen Recording & Video Editing Tool',
  description: 'Record your screen, edit videos with AI captions, and share with advanced controls. The most comprehensive screen recording tool for professionals and teams.',
  keywords: 'screen recording, video editing, screen capture, video sharing, AI captions, desktop recording, browser recording, video editor, screen recorder, professional recording',
  canonicalUrl: 'https://screenforge.app/',
  ogImage: 'https://screenforge.app/og-image.jpg',
  ogType: 'website',
  twitterCard: 'summary_large_image'
};

export const pageSEOConfigs: Record<string, SEOConfig> = {
  '/': {
    title: 'ScreenForge - Professional Screen Recording & Video Editing Tool',
    description: 'Record your screen, edit videos with AI captions, and share with advanced controls. The most comprehensive screen recording tool for professionals and teams.',
    keywords: 'screen recording, video editing, screen capture, video sharing, AI captions, desktop recording, browser recording, video editor, screen recorder, professional recording',
    canonicalUrl: 'https://screenforge.app/',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ScreenForge',
      url: 'https://screenforge.app',
      description: 'Professional screen recording and video editing tool with AI captions and advanced sharing controls',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://screenforge.app/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  },
  '/dashboard': {
    title: 'Dashboard - ScreenForge',
    description: 'Manage your screen recordings, edit videos, and control sharing settings from your ScreenForge dashboard.',
    keywords: 'video dashboard, screen recording management, video library, ScreenForge dashboard',
    canonicalUrl: 'https://screenforge.app/dashboard',
    noIndex: true // Private area
  },
  '/dashboard/record': {
    title: 'Record Screen - ScreenForge',
    description: 'Start recording your screen, browser tab, or window with ScreenForge. Professional screen capture with one click.',
    keywords: 'record screen, screen capture, browser recording, window recording, desktop recording',
    canonicalUrl: 'https://screenforge.app/dashboard/record',
    noIndex: true
  },
  '/dashboard/videos': {
    title: 'My Videos - ScreenForge',
    description: 'View and manage all your screen recordings. Edit, share, and organize your video library with ScreenForge.',
    keywords: 'video library, screen recordings, video management, recorded videos',
    canonicalUrl: 'https://screenforge.app/dashboard/videos',
    noIndex: true
  },
  '/dashboard/settings': {
    title: 'Settings - ScreenForge',
    description: 'Configure your ScreenForge recording preferences, quality settings, and account options.',
    keywords: 'ScreenForge settings, recording preferences, video quality, account settings',
    canonicalUrl: 'https://screenforge.app/dashboard/settings',
    noIndex: true
  }
};

export function updateMetaTags(config: SEOConfig): void {
  // Update title
  document.title = config.title;

  // Update or create meta tags
  updateMetaTag('description', config.description);

  if (config.keywords) {
    updateMetaTag('keywords', config.keywords);
  }

  // Update robots meta tag
  updateMetaTag('robots', config.noIndex ? 'noindex, nofollow' : 'index, follow');

  // Update canonical URL
  if (config.canonicalUrl) {
    updateLinkTag('canonical', config.canonicalUrl);
  }

  // Update Open Graph tags
  updateMetaProperty('og:title', config.title);
  updateMetaProperty('og:description', config.description);
  updateMetaProperty('og:type', config.ogType || 'website');

  if (config.canonicalUrl) {
    updateMetaProperty('og:url', config.canonicalUrl);
  }

  if (config.ogImage) {
    updateMetaProperty('og:image', config.ogImage);
  }

  // Update Twitter tags
  updateMetaProperty('twitter:title', config.title);
  updateMetaProperty('twitter:description', config.description);
  updateMetaProperty('twitter:card', config.twitterCard || 'summary_large_image');

  if (config.canonicalUrl) {
    updateMetaProperty('twitter:url', config.canonicalUrl);
  }

  if (config.ogImage) {
    updateMetaProperty('twitter:image', config.ogImage);
  }

  // Update structured data
  if (config.structuredData) {
    updateStructuredData(config.structuredData);
  }
}

function updateMetaTag(name: string, content: string): void {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }

  meta.content = content;
}

function updateMetaProperty(property: string, content: string): void {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }

  meta.content = content;
}

function updateLinkTag(rel: string, href: string): void {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }

  link.href = href;
}

function updateStructuredData(data: object): void {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"][data-dynamic]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-dynamic', 'true');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

// Generate video-specific SEO config
export function generateVideoSEO(videoTitle: string, videoDescription: string, videoUrl: string, thumbnailUrl?: string): SEOConfig {
  return {
    title: `${videoTitle} - ScreenForge`,
    description: videoDescription || `Watch this screen recording created with ScreenForge. ${videoTitle}`,
    keywords: `${videoTitle}, screen recording, video, ScreenForge, watch video`,
    canonicalUrl: videoUrl,
    ogImage: thumbnailUrl || 'https://screenforge.app/og-video.jpg',
    ogType: 'video.other',
    twitterCard: 'player',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: videoTitle,
      description: videoDescription || `Screen recording: ${videoTitle}`,
      thumbnailUrl: thumbnailUrl || 'https://screenforge.app/default-thumbnail.jpg',
      uploadDate: new Date().toISOString(),
      contentUrl: videoUrl,
      embedUrl: videoUrl,
      publisher: {
        '@type': 'Organization',
        name: 'ScreenForge',
        logo: {
          '@type': 'ImageObject',
          url: 'https://screenforge.app/logo.png'
        }
      }
    }
  };
}

// SEO hook for React components
export function useSEO(path: string, customConfig?: Partial<SEOConfig>): void {
  const config = {
    ...defaultSEO,
    ...(pageSEOConfigs[path] || {}),
    ...customConfig
  };

  // Update meta tags when component mounts or config changes
  useEffect(() => {
    updateMetaTags(config);
  }, [config]);
}
