import { ReactNode } from 'react';

interface StructuredDataProps {
  data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Physical.Capital',
    url: 'https://physical.capital',
    logo: 'https://physical.capital/logo.png',
    description:
      'Infrastructure investment platform with interactive 3D project visualizations. Invest in solar energy, renewable infrastructure, and sustainable development projects.',
    founder: {
      '@type': 'Person',
      name: 'Steve Moraco',
    },
    sameAs: [
      'https://twitter.com/physicalcapital',
      'https://linkedin.com/company/physicalcapital',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'contact@physical.capital',
    },
  };

  return <StructuredData data={data} />;
}

interface ProjectStructuredDataProps {
  projectId: string;
  name: string;
  description: string;
  location: string;
  investmentAmount: number;
  expectedReturn: number;
  duration: string;
  sector: string;
}

export function ProjectStructuredData({
  projectId,
  name,
  description,
  location,
  investmentAmount,
  expectedReturn,
  duration,
  sector,
}: ProjectStructuredDataProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'InvestmentOrSavingsProduct',
    name,
    description,
    url: `https://physical.capital/project/${projectId}`,
    provider: {
      '@type': 'Organization',
      name: 'Physical.Capital',
    },
    category: sector,
    offers: {
      '@type': 'Offer',
      price: investmentAmount,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    location: {
      '@type': 'Place',
      name: location,
    },
    annualPercentageRate: expectedReturn,
    term: duration,
  };

  return <StructuredData data={data} />;
}

interface ArticleStructuredDataProps {
  title: string;
  description: string;
  author: string;
  publishDate: string;
  imageUrl?: string;
}

export function ArticleStructuredData({
  title,
  description,
  author,
  publishDate,
  imageUrl,
}: ArticleStructuredDataProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Physical.Capital',
      logo: {
        '@type': 'ImageObject',
        url: 'https://physical.capital/logo.png',
      },
    },
    datePublished: publishDate,
    ...(imageUrl && {
      image: {
        '@type': 'ImageObject',
        url: imageUrl,
      },
    }),
  };

  return <StructuredData data={data} />;
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <StructuredData data={data} />;
}

interface FAQStructuredDataProps {
  questions: Array<{ question: string; answer: string }>;
}

export function FAQStructuredData({ questions }: FAQStructuredDataProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return <StructuredData data={data} />;
}

export function WebsiteStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Physical.Capital',
    url: 'https://physical.capital',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://physical.capital/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <StructuredData data={data} />;
}
