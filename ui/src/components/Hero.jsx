import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8">
      {/* Subtle decorative background circles */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gray-800/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-gray-800/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 container mx-auto max-w-5xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm font-semibold mb-8 border border-gray-700">
          <Sparkles className="w-4 h-4" />
          AI-Powered Campaign Builder
        </div>

        {/* Main heading */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            Campaign Planning Made{" "}
            <span className="text-gray-400">
              Intelligent
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Create, plan, and execute your marketing campaigns in minutes with
            AI-powered assistance. No complexity. Just results.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={() => navigate("/prompt")}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-gray-900 bg-white hover:bg-gray-200 rounded-2xl transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-gray-300 bg-gray-800 border-2 border-gray-700 hover:border-gray-600 hover:bg-gray-700 rounded-2xl transition-all duration-300">
            Learn More
          </button>
        </div>

        {/* Stats or key features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 border-t border-gray-800">
          <div className="p-6 rounded-2xl bg-gray-900/60 backdrop-blur-sm border border-gray-800 shadow-sm">
            <div className="text-4xl font-bold text-white mb-2">
              100%
            </div>
            <p className="text-gray-400 font-medium">
              AI Generated
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-900/60 backdrop-blur-sm border border-gray-800 shadow-sm">
            <div className="text-4xl font-bold text-white mb-2">
              &lt;5min
            </div>
            <p className="text-gray-400 font-medium">
              Setup Time
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-900/60 backdrop-blur-sm border border-gray-800 shadow-sm">
            <div className="text-4xl font-bold text-white mb-2">
              ∞
            </div>
            <p className="text-gray-400 font-medium">
              Possibilities
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
