import { Navbar } from '@/components/public/Navbar';
import { HeroSection } from '@/components/public/HeroSection';
import { CatalogSection } from '@/components/public/CatalogSection';
import { AboutSection } from '@/components/public/AboutSection';
import { Footer } from '@/components/public/Footer';
import { WhatsAppButton } from '@/components/public/WhatsAppButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Navbar />
      <main>
        <HeroSection />
        <CatalogSection />
        <AboutSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
