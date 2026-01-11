import { useState } from "react";
import { useNavigate } from "react-router-dom";

// small helper to convert hex -> rgba string used for shadows/gradients
function hexToRgba(hex, alpha = 1) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function Card({
  id,
  title,
  description,
  accentColor = "accent",
  brdUrl,
  strategyMarkdown,
  landingPageCode,
  contentData,
  generatedAssets,
}) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const colors = ["#f472b6", "#a855f7", "#ec4899", "#fb7185"];

  const isReady = (() => {
    if (id === 1) return Boolean(brdUrl) && Boolean(strategyMarkdown);
    if (id === 2) return Boolean(landingPageCode);
    if (id === 3) return Boolean(contentData) && Boolean(generatedAssets);
    if (id === 4) return true;
    return true;
  })();

  const handleClick = () => {
    if (!isReady) return;
    try {
      if (id === 1) {
        if (brdUrl || strategyMarkdown) {
          localStorage.setItem(
            "campaign_breakdown",
            JSON.stringify({ brdUrl, strategyMarkdown })
          );
        }
        window.open("/breakdown", "_blank");
      } else if (id === 2) {
        if (landingPageCode) {
          localStorage.setItem("campaign_landingPageCode", landingPageCode);
        }
        window.open("/web-editor", "_blank");
      } else if (id === 3) {
        if (contentData || generatedAssets) {
          localStorage.setItem(
            "campaign_content",
            JSON.stringify({ contentData, generatedAssets })
          );
        }
        window.open("/postmaker", "_blank");
      } else if (id === 4) {
        window.open("/control", "_blank");
      }
    } catch (e) {
      console.error("Failed opening new tab:", e);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (isReady && (e.key === "Enter" || e.key === " ")) {
          handleClick();
        }
      }}
      role="button"
      tabIndex={isReady ? 0 : -1}
      className={`
        relative rounded-2xl p-8
        border-2 border-gray-700
        transition-all duration-300 ease-out
        min-h-[260px]
        flex flex-col justify-between
        group
        overflow-hidden
        ${isReady ? "cursor-pointer hover:border-gray-500" : "cursor-not-allowed opacity-50"}
        ${isHovered && isReady ? "shadow-xl shadow-black/30 scale-[1.02] -translate-y-1" : "shadow-lg shadow-black/20"}
        bg-gray-800
      `}
    >
      {isHovered && isReady && (
        <div className="absolute inset-0 z-20 opacity-20 pointer-events-none">
          <div
            aria-hidden
            className="w-full h-full rounded-lg bg-gradient-to-br from-gray-700 to-gray-800"
          />
        </div>
      )}

      <div className="relative z-10">
        <div className="text-5xl font-black mb-3 text-gray-600">
          {String(id).padStart(2, "0")}
        </div>
        <h3 className="text-xl font-bold text-white mb-3 leading-tight">
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
        {!isReady && (
          <p className="mt-4 text-xs font-semibold text-gray-500 animate-pulse">
            ⏳ Waiting for backend...
          </p>
        )}
      </div>
    </div>
  );
}

export default Card;
