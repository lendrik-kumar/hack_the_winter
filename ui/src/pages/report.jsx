import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CardGrid from "../components/cards/CardGrid";

export default function Report() {
  const loc = useLocation();
  const navigate = useNavigate();
  const locationState = loc.state || {};

  // Get prompt from navigation state (sent from PromptPage)
  const [prompt, setPrompt] = useState(locationState.prompt || "");
  const [logNodes, setLogNodes] = useState([]);
  const [jsonState, setJsonState] = useState({});
  const [plannerData, setPlannerData] = useState(null);
  const [researchData, setResearchData] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [generatedAssets, setGeneratedAssets] = useState({});
  const [landingPageCode, setLandingPageCode] = useState(null);
  const wsRef = useRef(null);
  const outputRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [brdUrl, setBrdUrl] = useState(null);
  const [strategyMarkdown, setStrategyMarkdown] = useState(null);

  // Add CSS for animations
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .log-item {
        animation: fadeIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // helper to append to log
  function addOutputMessage(htmlContent, isSeparator = false) {
    setLogNodes((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), html: htmlContent, isSeparator },
    ]);
  }

  // connect on mount and auto-start if navigated from PromptPage
  useEffect(() => {
    addOutputMessage("<strong>STATUS:</strong> Connecting...");
    connect();

    // Auto-run if autoStart flag is set from PromptPage
    if (locationState.autoStart && prompt) {
      setTimeout(() => {
        sendPrompt();
      }, 1000);
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [logNodes]);

  function connect() {
    try {
      const ws = new WebSocket("ws://localhost:8000/ws_stream_campaign");
      wsRef.current = ws;

      ws.onopen = () => {
        setLogNodes((prev) =>
          prev.filter((n) => !n.html.includes("Connecting..."))
        );
        addOutputMessage(
          "<strong>STATUS:</strong> Connected to server. Ready to run."
        );
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.event === "step") {
          const nodeName = message.node;
          try {
            const jsonData = JSON.parse(message.data);
            setJsonState(jsonData);
            if (nodeName === "planner_agent") {
              const plannerFields = {
                goal: jsonData.goal || null,
                topic: jsonData.topic || null,
                target_audience: jsonData.target_audience || null,
                source_docs_url: jsonData.source_docs_url || null,
                campaign_date: jsonData.campaign_date || null,
              };
              setPlannerData(plannerFields);
            }

            if (nodeName === "research_agent") {
              const researchFields = {
                audience_persona: jsonData.audience_persona || {},
                core_messaging: jsonData.core_messaging || {},
              };
              setResearchData(researchFields);
            }

            if (nodeName === "content_agent") {
              const contentFields = {
                webinar_details: jsonData.webinar_details || {},
                social_posts: jsonData.social_posts || [],
              };
              setContentData(contentFields);
            }

            if (nodeName === "design_agent") {
              if (jsonData.generated_assets) {
                setGeneratedAssets(jsonData.generated_assets);
              }
            }

            if (nodeName === "web_agent") {
              if (jsonData.landing_page_code) {
                setLandingPageCode(jsonData.landing_page_code);
              }
            }

            if (nodeName === "brd_agent") {
              if (jsonData.brd_url) {
                setBrdUrl(jsonData.brd_url);
              }
            }

            if (nodeName === "strategy_agent") {
              if (jsonData.strategy_markdown) {
                setStrategyMarkdown(jsonData.strategy_markdown);
              }
            }

            let snippet = `Updated landing_page_url: ${jsonData.landing_page_url}`;
            if (nodeName === "planner_agent")
              snippet = `Planned topic: ${jsonData.topic}`;
            if (nodeName === "research_agent")
              snippet = `Found pain point: ${
                jsonData.audience_persona?.pain_point || "N/A"
              }`;
            if (nodeName === "content_agent")
              snippet = `Wrote ${jsonData.email_sequence?.length || 0} emails.`;
            if (nodeName === "design_agent")
              snippet = `Created logo prompt: ${
                jsonData.brand_kit?.logo_prompt || "N/A"
              }`;

            addOutputMessage(
              `<strong>${nodeName.toUpperCase()}</strong><br>${snippet}`
            );
          } catch (e) {
            addOutputMessage(
              `<strong>ERROR:</strong> Failed to parse server JSON: ${e}`
            );
          }
        } else if (message.event === "done") {
          addOutputMessage("<strong>STATUS:</strong> Campaign Complete!");
          setRunning(false);
          if (wsRef.current) wsRef.current.close();
        } else if (message.event === "error") {
          addOutputMessage(`<strong>ERROR:</strong> ${message.data}`);
          setRunning(false);
        }
      };

      ws.onclose = () => {
        addOutputMessage(
          "<strong>STATUS:</strong> Disconnected. Trying to reconnect..."
        );
        setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        addOutputMessage(
          "<strong>ERROR:</strong> Could not connect to ws://localhost:8000. Is the server running?"
        );
      };
    } catch (e) {
      console.error("WS connect failed", e);
      addOutputMessage(`<strong>ERROR:</strong> ${e}`);
    }
  }

  function sendPrompt() {
    const ws = wsRef.current;
    if (!ws || ws.readyState === WebSocket.CLOSED) {
      connect();
      setTimeout(() => sendPrompt(), 1000);
      return;
    } else if (ws.readyState !== WebSocket.OPEN) {
      alert("Not connected to server. Please wait.");
      return;
    }

    if (!prompt) {
      alert("Please enter a prompt.");
      return;
    }

    setJsonState({});
    addOutputMessage(
      "<strong>STATUS:</strong> Sending prompt to Foundry...",
      true
    );

    ws.send(JSON.stringify({ initial_prompt: prompt }));
    setRunning(true);
  }

  function goToResearch() {
    if (!researchData) return;
    try {
      localStorage.setItem(
        "campaign_research",
        JSON.stringify({ researchData })
      );
      window.open("/research", "_blank");
    } catch (e) {
      console.error("Failed opening research in new tab", e);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-800/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-800/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Back + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-400 hidden sm:inline">Back</span>
            </button>
            <div className="h-6 w-px bg-gray-700" />
            <a href="/" className="font-bold text-xl text-white hover:text-gray-300 transition-colors">
              CampaignAI
            </a>
          </div>

          {/* Center: Status */}
          <div className="hidden md:flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${running ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-600 font-medium">
              {running ? 'Campaign Running...' : 'Ready'}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/prompt")}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              New Campaign
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-sm font-semibold text-gray-900 bg-white hover:bg-gray-200 rounded-lg transition-colors shadow-sm"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row w-full min-h-screen relative z-10 pt-16">
        {/* Left Section - 70% */}
        <div className="lg:w-[70%] w-full p-6 pt-8 space-y-8">
          {/* Page Title */}
          <div className="mb-10">
            <div className="inline-block px-3 py-1 bg-gray-800 text-gray-400 text-xs font-semibold rounded-full mb-3 border border-gray-700">
              CAMPAIGN MANAGER
            </div>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              Campaign Dashboard
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Monitor your campaign generation progress in real-time</p>
          </div>

          {/* Campaign Plan Card */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-lg shadow-black/20 p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-300 text-lg">📋</span>
                </div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  Campaign Plan
                </h2>
              </div>
              {plannerData && (
                <span className="px-4 py-1.5 bg-green-900/50 text-green-400 rounded-full text-sm font-semibold border border-green-800">
                  ✓ Generated
                </span>
              )}
            </div>

            {plannerData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Goal</div>
                  <div className="text-white font-medium">{plannerData.goal || "—"}</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Topic</div>
                  <div className="text-white font-medium">{plannerData.topic || "—"}</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Target Audience</div>
                  <div className="text-white font-medium">{plannerData.target_audience || "—"}</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Campaign Date</div>
                  <div className="text-white font-medium">
                    {plannerData.campaign_date
                      ? new Date(plannerData.campaign_date).toLocaleDateString()
                      : "TBD"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-400">Waiting for Campaign Plan...</p>
                <p className="text-gray-500 text-sm mt-1">The AI is analyzing your request</p>
              </div>
            )}
          </div>

          {/* Campaign Tools */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                <span className="text-gray-300 text-lg">🛠️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  Campaign Tools
                </h3>
                <p className="text-gray-400 text-sm">Access your campaign assets and tools</p>
              </div>
            </div>
            <CardGrid
              brdUrl={brdUrl}
              strategyMarkdown={strategyMarkdown}
              landingPageCode={landingPageCode}
              contentData={contentData}
              generatedAssets={generatedAssets}
            />
          </div>

          {/* Research Button */}
          <div className="flex justify-center pt-6 pb-4">
            <button
              onClick={goToResearch}
              disabled={!researchData}
              className={`px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                researchData
                  ? "bg-white text-gray-900 hover:bg-gray-200 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
              }`}
            >
              {researchData ? "📊 View Research Analytics" : "⏳ Waiting for Research Agent..."}
            </button>
          </div>
        </div>

        {/* Right Section - 30% */}
        <div className="lg:w-[30%] w-full p-6 pt-8 space-y-6 bg-gradient-to-b from-gray-900 to-gray-950 border-l border-gray-800">
          {/* Activity Log */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-lg shadow-black/20">
            <div className="px-5 py-4 border-b border-gray-800 bg-gray-800/50">
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <h2 className="font-bold text-white" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  Activity Log
                </h2>
              </div>
            </div>
            <div
              className="max-h-80 overflow-y-auto p-4 space-y-2"
              ref={outputRef}
            >
              {logNodes.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No activity yet</p>
              ) : (
                logNodes.map((n) => (
                  <div
                    key={n.id}
                    className={`log-item p-3 rounded-lg text-sm ${
                      n.isSeparator
                        ? "bg-amber-900/30 border-l-4 border-amber-500 text-amber-300"
                        : n.html.includes("ERROR")
                        ? "bg-red-900/30 border-l-4 border-red-500 text-red-300"
                        : n.html.includes("STATUS")
                        ? "bg-blue-900/30 border-l-4 border-blue-500 text-blue-300"
                        : "bg-gray-800 border-l-4 border-gray-600 text-gray-300"
                    }`}
                    dangerouslySetInnerHTML={{ __html: n.html }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Live State JSON */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-lg shadow-black/20">
            <div className="px-5 py-4 border-b border-gray-800 bg-gray-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <h2 className="font-bold text-white" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  Live State
                </h2>
              </div>
              <span className="text-xs text-gray-400 font-mono bg-gray-700 px-2 py-0.5 rounded">JSON</span>
            </div>
            <pre className="p-4 max-h-64 overflow-auto text-xs font-mono text-gray-300 bg-gray-800/50">
              {Object.keys(jsonState).length > 0 
                ? JSON.stringify(jsonState, null, 2)
                : "{\n  // Waiting for data...\n}"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
