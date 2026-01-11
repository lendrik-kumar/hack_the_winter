import { Brain, Globe, Share2, Zap } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Breakdown",
      description:
        "Get structured, actionable steps with comprehensive analysis. Intelligent recommendations tailored to your startup needs.",
    },
    {
      icon: Globe,
      title: "Website Generation",
      description:
        "Professional, responsive websites created instantly. Production-ready code with SEO optimization and mobile-first design.",
    },
    {
      icon: Share2,
      title: "Social Media",
      description:
        "Auto-generate and post engaging content to Instagram and Twitter. AI-powered copy and visuals that drive engagement.",
    },
    {
      icon: Zap,
      title: "Smart Automation",
      description:
        "Integrated call management and automated responses. Streamline customer engagement with intelligent routing.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 bg-gray-800 text-gray-400 text-xs font-semibold rounded-full mb-4 border border-gray-700">
            FEATURES
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            Everything You Need
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Build, launch, and scale your startup with our comprehensive suite
            of AI-powered tools
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-gray-900 border-2 border-gray-800 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex p-3 bg-gray-800 rounded-xl group-hover:bg-gray-700 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-6 h-6 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
