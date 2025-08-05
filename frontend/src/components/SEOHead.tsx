import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updateMetaTags, pageSEOConfigs, defaultSEO, type SEOConfig } from '../utils/seo';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
  structuredData?: object;
}

export function SEOHead(props: SEOHeadProps) {
  const location = useLocation();

  useEffect(() => {
    const baseSEO = pageSEOConfigs[location.pathname] || defaultSEO;

    const seoConfig: SEOConfig = {
      ...baseSEO,
      ...(props.title && { title: props.title }),
      ...(props.description && { description: props.description }),
      ...(props.keywords && { keywords: props.keywords }),
      ...(props.image && { ogImage: props.image }),
      ...(props.url && { canonicalUrl: props.url }),
      ...(props.type && { ogType: props.type }),
      ...(props.noIndex !== undefined && { noIndex: props.noIndex }),
      ...(props.structuredData && { structuredData: props.structuredData })
    };

    updateMetaTags(seoConfig);
  }, [location.pathname, props]);

  // This component doesn't render anything visible
  return null;
}

// Pre-configured SEO components for common use cases
export function HomeSEO() {
  return (
    <SEOHead
      title="ScreenForge - Professional Screen Recording & Video Editing Tool"
      description="Record your screen, edit videos with AI captions, and share with advanced controls. The most comprehensive screen recording tool for professionals and teams."
      keywords="screen recording, video editing, screen capture, video sharing, AI captions, desktop recording, browser recording, video editor, screen recorder, professional recording"
      structuredData={{
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
      }}
    />
  );
}

export function VideoSEO({
  title,
  description,
  videoUrl,
  thumbnailUrl,
  duration,
  uploadDate
}: {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  uploadDate?: string;
}) {
  return (
    <SEOHead
      title={`${title} - ScreenForge`}
      description={description || `Watch this screen recording: ${title}. Created with ScreenForge, the professional screen recording tool.`}
      keywords={`${title}, screen recording, video, ScreenForge, watch video online`}
      image={thumbnailUrl}
      url={videoUrl}
      type="video.other"
      structuredData={{
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: title,
        description: description || `Screen recording: ${title}`,
        thumbnailUrl: thumbnailUrl || 'https://screenforge.app/default-thumbnail.jpg',
        contentUrl: videoUrl,
        embedUrl: videoUrl,
        uploadDate: uploadDate || new Date().toISOString(),
        ...(duration && { duration: `PT${Math.floor(duration)}S` }),
        publisher: {
          '@type': 'Organization',
          name: 'ScreenForge',
          logo: {
            '@type': 'ImageObject',
            url: 'https://screenforge.app/logo.png'
          }
        },
        potentialAction: {
          '@type': 'WatchAction',
          target: videoUrl
        }
      }}
    />
  );
}
