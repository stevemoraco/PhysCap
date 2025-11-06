import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
  keywords?: string[];
}

export function SEOHead({
  title = "Physical.Capital - Infrastructure Investment Innovation",
  description = "Leading the American infrastructure renaissance with GPU-accelerated 3D visualizations of cutting-edge projects: 2 GW solar gigafactories, luxury resorts, world's tallest skyscraper, and orbital apartments. Mobile-first with gyroscope-responsive experiences.",
  ogImage = "https://physical.capital/og-image.png",
  ogType = "website",
  canonicalUrl = "https://physical.capital",
  keywords = [
    "infrastructure investment",
    "solar manufacturing",
    "luxury resort development",
    "skyscraper construction",
    "orbital real estate",
    "GPU accelerated visualization",
    "3D project demos",
    "Physical Capital",
    "Colorado infrastructure",
    "autonomous manufacturing",
    "prefab construction",
    "investment opportunities"
  ]
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to set or update meta tags
    const setMeta = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Standard meta tags
    setMeta('description', description);
    setMeta('keywords', keywords.join(', '));
    setMeta('author', 'Physical.Capital');
    setMeta('robots', 'index, follow');
    setMeta('viewport', 'width=device-width, initial-scale=1.0');

    // Open Graph meta tags
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:type', ogType, true);
    setMeta('og:site_name', 'Physical.Capital', true);

    // Twitter Card meta tags
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // Additional SEO tags
    setMeta('theme-color', '#0a2e2c');
    setMeta('apple-mobile-web-app-capable', 'yes');
    setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Structured data (JSON-LD)
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Physical.Capital",
      "url": "https://physical.capital",
      "logo": "https://physical.capital/logo.png",
      "description": description,
      "sameAs": [],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Investment Inquiries",
        "email": "invest@physical.capital"
      },
      "areaServed": "US",
      "knowsAbout": [
        "Infrastructure Investment",
        "Solar Energy Manufacturing",
        "Prefabricated Construction",
        "Luxury Real Estate Development",
        "Space Infrastructure"
      ]
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);

  }, [title, description, ogImage, ogType, canonicalUrl, keywords]);

  return null;
}
