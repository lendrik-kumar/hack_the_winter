
export default LandingPage;
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Workflow from "../components/HowItWorks";

function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-primary-600 text-white rounded-lg shadow-lg"
      >
        Skip to main content
      </a>

      {/* Navbar with subtle backdrop */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 dark:bg-neutral-950/80 border-b border-neutral-200 dark:border-neutral-800">
        <Navbar />
      </header>

      <main id="main-content">
        {/* HERO */}
        <section className="relative min-h-[90vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-50/40 to-transparent dark:from-primary-900/10 pointer-events-none" />
          <div className="relative w-full px-6">
            <Hero />
          </div>
        </section>

        {/* FEATURES */}
        <section className="relative py-28 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <Features />
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="relative py-28">
          <div className="max-w-7xl mx-auto px-6">
            <Workflow />
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800">
        <Footer />
      </footer>
    </div>
  );
}

