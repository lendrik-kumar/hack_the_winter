import {
  MessageSquare,
  Search,
  Rocket,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: "01",
      icon: MessageSquare,
      title: "Describe Your Idea",
      description:
        "Tell us about your startup concept, target market, and goals. Our AI analyzes everything to create a comprehensive plan.",
    },
    {
      number: "02",
      icon: Search,
      title: "Research & Analyze",
      description:
        "Get deep market insights, competitive analysis, and strategic recommendations tailored to your specific industry.",
    },
    {
      number: "03",
      icon: Rocket,
      title: "Generate Assets",
      description:
        "Launch with everything you need - website, marketing copy, social media content, and brand guidelines.",
    },
    {
      number: "04",
      icon: TrendingUp,
      title: "Scale & Iterate",
      description:
        "Monitor performance, get AI-driven optimization suggestions, and continuously improve your campaigns.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 bg-gray-800 text-gray-400 text-xs font-semibold rounded-full mb-4 border border-gray-700">
            HOW IT WORKS
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            How It Works
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            From idea to launch in just 4 simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="h-full p-8 rounded-2xl bg-gray-900 border-2 border-gray-800 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1">
                  {/* Step Number */}
                  <div className="text-5xl font-black text-gray-700 mb-4">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mb-6 inline-flex p-3 bg-gray-800 rounded-xl">
                    <Icon className="w-8 h-8 text-gray-300" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-600 to-transparent" />
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 pt-16 border-t border-gray-800">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            Ready to Launch?
          </h3>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Get started with CampaignAI today and transform your startup vision
            into reality.
          </p>
          <button
            onClick={() => navigate("/prompt")}
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-gray-900 bg-white hover:bg-gray-200 rounded-2xl transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Building
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
