import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { HowToWorkWithUs } from "./components/HowToWorkWithUs";
import { Features } from "./components/Features";
import { Benefits } from "./components/Benefits";
import { UnifiedCaseStudies } from "./components/UnifiedCaseStudies";
import { AutoScrollTestimonials } from "./components/AutoScrollTestimonials";
import { Pricing } from "./components/Pricing";
import { FAQ } from "./components/FAQ";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <Hero />
        <HowToWorkWithUs />
        <Features />
        <Benefits />
        <UnifiedCaseStudies/>
        <AutoScrollTestimonials />
        <Pricing />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}