import React, { useState } from 'react'

const FeatureCard = ({ icon: Icon, title, description, delay = 0, isExpanded, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-lg p-6 md:p-8 transition-smooth group overflow-hidden hover:shadow-lg"
      style={{
        aspectRatio: '1/1',
        background: 'linear-gradient(to bottom right, #c084fc, #a855f7 20%, #9333ea 65%, #7e22ce)',
      }}
    >
      <div className="flex flex-col h-full relative">
        {/* Icon and Title - centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            {/* Dark silhouette background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="w-20 h-20 md:w-24 md:h-24 text-black/10" />
            </div>
            {/* Icon container */}
            <div className="relative">
              <Icon className="w-20 h-20 md:w-24 md:h-24 text-white" strokeWidth={1.5} />
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-white text-center">
            {title}
          </h3>
        </div>

        {/* Description - revealed on hover */}
        <div className={`absolute bottom-0 left-0 right-0 h-1/2 flex items-center justify-center p-4 transition-smooth ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-white/90 text-sm md:text-base leading-relaxed text-center">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FeatureCard
