import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Workflow from "../components/HowItWorks";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden text-gray-100">
      {/* Background Decorations (slightly softer) */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gray-800/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[450px] h-[450px] bg-gray-800/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-gray-700 text-white rounded-lg shadow-lg"
      >
        Skip to main content
      </a>

      {/* Navbar wrapper (glass effect) */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-gray-950/70 border-b border-white/10">
        <Navbar />
      </header>

      <main id="main-content" className="relative z-10">
        {/* HERO */}
        <section className="min-h-[90vh] flex items-center">
          <div className="w-full max-w-7xl mx-auto px-6">
            <Hero />
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 md:py-28 bg-gray-900/60 backdrop-blur-sm">
          <div className="w-full max-w-7xl mx-auto px-6">
            <Features />
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="py-16 md:py-28">
          <div className="w-full max-w-7xl mx-auto px-6">
            <Workflow />
          </div>
        </section>
      </main>

      {/* Footer separation */}
      <footer className="border-t border-white/10">
        <Footer />
      </footer>
    </div>
  );
}

export default LandingPage;
