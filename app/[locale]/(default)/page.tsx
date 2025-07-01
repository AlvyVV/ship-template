import Branding from '@/components/blocks/branding';
import CTA from '@/components/blocks/cta';
import FAQ from '@/components/blocks/faq';
import Feature from '@/components/blocks/feature';
import Feature1 from '@/components/blocks/feature1';
import Feature2 from '@/components/blocks/feature2';
import Feature3 from '@/components/blocks/feature3';
import Hero from '@/components/blocks/hero';
import Pricing from '@/components/blocks/pricing';
import Showcase from '@/components/blocks/showcase';
import Stats from '@/components/blocks/stats';
import Testimonial from '@/components/blocks/testimonial';
import { LandingPage } from '@/types/pages/landing';
import { getPage } from '@/services/load-page';
import { getLocale } from 'next-intl/server';

export async function generateMetadata() {
  const locale = await getLocale();
  const pageResult = await getPage<LandingPage>(locale, 'home');

  // 根据实际加载的语言设置 canonical URL
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}`;
  if (pageResult.actualLocale !== 'en') {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${pageResult.actualLocale}`;
  }

  return {
    title: pageResult.content.meta?.title,
    description: pageResult.content.meta?.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function Landing({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await getLocale();
  const pageResult = await getPage<LandingPage>(locale, 'home');
  const page = pageResult.content;

  return (
    <>
      {page.hero && <Hero hero={page.hero} />}
      {page.branding && <Branding section={page.branding} />}
      {page.introduce && <Feature1 section={page.introduce} />}
      {page.benefit && <Feature2 section={page.benefit} />}
      {page.usage && <Feature3 section={page.usage} />}
      {page.feature && <Feature section={page.feature} />}
      {page.showcase && <Showcase section={page.showcase} />}
      {page.stats && <Stats section={page.stats} />}
      {page.pricing && <Pricing pricing={page.pricing} />}
      {page.testimonial && <Testimonial section={page.testimonial} />}
      {page.faq && <FAQ section={page.faq} />}
      {page.cta && <CTA section={page.cta} />}
    </>
  );
}
