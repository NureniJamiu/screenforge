import { useEffect } from 'react';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export function useDocumentHead(config: SEOConfig) {
  useEffect(() => {
    // Store original values to restore on cleanup
    const originalTitle = document.title;
    const originalMetas: { element: HTMLMetaElement; original: string }[] = [];
    const originalLinks: { element: HTMLLinkElement; original: string }[] = [];

    // Update title
    if (config.title) {
      document.title = config.title;
    }

    // Helper function to create or update meta tags
    const setMetaTag = (selector: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, selector.replace(`[${attribute}="`, '').replace('"]', ''));
        document.head.appendChild(meta);
        originalMetas.push({ element: meta, original: '' });
      } else {
        originalMetas.push({ element: meta, original: meta.content });
      }
      meta.content = content;
    };

    // Helper function to create or update link tags
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
        originalLinks.push({ element: link, original: '' });
      } else {
        originalLinks.push({ element: link, original: link.href });
      }
      link.href = href;
    };

    // Set meta tags
    if (config.description) {
      setMetaTag('[name="description"]', config.description);
    }
    if (config.keywords) {
      setMetaTag('[name="keywords"]', config.keywords);
    }
    if (config.ogTitle) {
      setMetaTag('[property="og:title"]', config.ogTitle, 'property');
    }
    if (config.ogDescription) {
      setMetaTag('[property="og:description"]', config.ogDescription, 'property');
    }
    if (config.ogImage) {
      setMetaTag('[property="og:image"]', config.ogImage, 'property');
    }
    if (config.ogUrl) {
      setMetaTag('[property="og:url"]', config.ogUrl, 'property');
    }
    if (config.twitterCard) {
      setMetaTag('[name="twitter:card"]', config.twitterCard);
    }
    if (config.twitterTitle) {
      setMetaTag('[name="twitter:title"]', config.twitterTitle);
    }
    if (config.twitterDescription) {
      setMetaTag('[name="twitter:description"]', config.twitterDescription);
    }
    if (config.twitterImage) {
      setMetaTag('[name="twitter:image"]', config.twitterImage);
    }

    // Set canonical URL
    if (config.canonicalUrl) {
      setLinkTag('canonical', config.canonicalUrl);
    }

    // Cleanup function to restore original values
    return () => {
      document.title = originalTitle;

      originalMetas.forEach(({ element, original }) => {
        if (original) {
          element.content = original;
        } else {
          element.remove();
        }
      });

      originalLinks.forEach(({ element, original }) => {
        if (original) {
          element.href = original;
        } else {
          element.remove();
        }
      });
    };
  }, [config]);
}
