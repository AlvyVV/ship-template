import Footer from '@/components/blocks/footer';
import Header from '@/components/blocks/header';
import { ReactNode } from 'react';
import { getLandingPage } from '@/services/page';
import Feedback from '@/components/feedback';

export default async function DefaultLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  return (
    <>
      <Header />
      <main className="overflow-x-hidden">{children}</main>
      <Footer />
      {/* <Feedback socialLinks={page.footer?.social?.items} /> */}
    </>
  );
}
