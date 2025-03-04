import React from "react";

const CircularProgress = ({
  percentage,
  size = 50,
  strokeWidth = 4,
  color,
  bgColor = "transparent",
  innerPadding = 2,
}) => {
  const outerRadius = (size - strokeWidth * 2) / 2; // Outer circle radius
  const innerRadius = outerRadius - innerPadding; // Inner side length control

  const center = size / 2;
  const angle = (percentage / 100) * 360;
  const radians = (angle - 90) * (Math.PI / 180); // Start from top

  const x = center + innerRadius * Math.cos(radians);
  const y = center + innerRadius * Math.sin(radians);
  const largeArcFlag = percentage > 50 ? 1 : 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Outer Circle */}
      <circle
        cx={center}
        cy={center}
        r={outerRadius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill={bgColor}
      />

      {/* Progress Sector with Controlled Inner Side */}
      {percentage > 0 && (
        <path
          d={`
            M ${center},${center}
            L ${center},${center - innerRadius} 
            A ${innerRadius},${innerRadius} 0 ${largeArcFlag} 1 ${x},${y}
            Z
          `}
          fill={color}
        />
      )}
    </svg>
  );
};

export default CircularProgress;
