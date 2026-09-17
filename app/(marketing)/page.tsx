import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { CtaWithPenny } from '@/components/landing/CtaWithPenny';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingHero } from '@/components/landing/LandingHero';
import { PricingSection } from '@/components/landing/PricingSection';
import { ProductCapabilities } from '@/components/landing/ProductCapabilities';
import { faqItems, jsonLdFeatureList, landingMetadata } from '@/lib/landingContent';
import { siteUrl } from '@/lib/site';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: landingMetadata.title,
  description: landingMetadata.description,
  openGraph: {
    url: siteUrl,
    type: 'website',
  },
  alternates: {
    canonical: siteUrl,
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ThoughtExpense',
    description: landingMetadata.description,
    url: siteUrl,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ThoughtExpense',
      url: siteUrl,
      logo: `${siteUrl}/icon`,
    },
    featureList: jsonLdFeatureList,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  },
];

export default function HomePage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <LandingHero />
      <HowItWorks />
      <FeatureGrid />
      <ProductCapabilities />
      <PricingSection />

      <section id="faq" className="border-b border-token bg-token-card px-4 py-20 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-token-primary md:text-4xl">
              Questions
            </h2>
            <p className="mt-3 text-lg text-token-secondary">
              Straight answers about offline mode, Premium, and your data.
            </p>
          </div>
          <div className="mt-10">
            <FAQAccordion />
          </div>
        </div>
      </section>

      <CtaWithPenny />
      <LandingFooter />
    </>
  );
}
