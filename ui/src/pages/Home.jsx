import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Workflow from "../components/HowItWorks";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-gray-800/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-gray-800/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
      
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gray-700 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      <main className="relative z-10">
        <Navbar />
        <main id="main-content">
          <section className="min-h-screen flex items-center">
            <div className="w-full">
              <Hero />
            </div>
          </section>

          <section className="min-h-screen flex items-center py-20 bg-gray-900/60 backdrop-blur-sm">
            <div className="w-full">
              <Features />
            </div>
          </section>

          <section className="min-h-screen flex items-center py-20">
            <div className="w-full">
              <Workflow />
            </div>
          </section>
        </main>
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
