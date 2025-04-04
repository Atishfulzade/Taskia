import React, { useEffect } from "react";

const AnimatedLogoLoader = () => {
  useEffect(() => {
    // Function to reset and restart the animation
    const resetAnimation = () => {
      const horizontalPath = document.getElementById("horizontal-path");
      const letterPath = document.getElementById("letter-path");

      if (horizontalPath && letterPath) {
        // Reset the SVG paths
        horizontalPath.style.strokeDashoffset = "400";
        horizontalPath.style.fillOpacity = "0";
        letterPath.style.strokeDashoffset = "1500";
        letterPath.style.fillOpacity = "0";
      }
    };

    // Loop the animation
    const intervalId = setInterval(resetAnimation, 4000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        margin: 0,
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        className="logo-container"
        style={{
          width: "265px",
          height: "310px",
          position: "relative",
        }}
      >
        <svg
          className="logo-svg"
          width="265"
          height="310"
          viewBox="0 0 265 310"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            animation: "reset-animation 4s infinite",
          }}
        >
          {/* Horizontal line path */}
          <path
            id="horizontal-path"
            d="M0 107C0 89.3269 14.3269 75 32 75H265V75C265 92.6731 250.673 107 233 107H0V107Z"
            style={{
              stroke: "#5D0EC0",
              strokeWidth: 2,
              fill: "#5D0EC0",
              strokeDasharray: 400,
              strokeDashoffset: 400,
              animation: "draw-horizontal 1s ease-in-out forwards",
            }}
          />

          {/* Letter A path */}
          <path
            id="letter-path"
            d="M182.4 305.6C171.2 305.6 162.7 302 156.9 294.8C151.3 287.4 147.5 273.7 145.5 253.7C144.3 243.3 143.1 229.8 141.9 213.2C127.9 217.4 113.8 221.8 99.6 226.4L89.4 254.6C87.4 260 86 263.9 85.2 266.3C84.4 268.5 82.9 271.9 80.7 276.5C78.7 281.1 76.9 284.5 75.3 286.7C73.9 288.7 71.8 291.3 69 294.5C66.4 297.7 63.7 300 60.9 301.4C53.7 305 46 306.8 37.8 306.8C29.6 306.8 22.9 303.9 17.7 298.1C12.7 292.1 10.2 284.8 10.2 276.2C10.2 273.8 10.4 271.3 10.8 268.7C13.4 249.5 33.1 232 69.9 216.2C80.3 189.6 97.6 144.8 121.8 81.8C128.2 78.2 136.3 76.4 146.1 76.4C148.3 76.4 150.4 76.4 152.4 76.4C154.4 76.4 156.8 76.4 159.6 76.4C162.6 76.4 166.3 77 170.7 78.2C170.9 87.6 175.5 145.9 184.5 253.1C185.3 262.1 186.4 268 187.8 270.8C189.2 273.4 191.6 274.7 195 274.7C200.6 274.7 208 270.9 217.2 263.3C226.6 255.7 235 246.2 242.4 234.8L250.8 255.2L243.6 264.8C222.6 292 202.2 305.6 182.4 305.6ZM134.7 128.6L108.6 201.5C122.6 196.7 133 193.2 139.8 191L134.7 128.6ZM59.4 242.3C40.8 251.7 31.5 260.9 31.5 269.9C31.5 276.3 33.9 279.5 38.7 279.5C42.3 279.5 45.2 276.9 47.4 271.7C50 266.1 54 256.3 59.4 242.3Z"
            style={{
              stroke: "#5D0EC0",
              strokeWidth: 2,
              fill: "#5D0EC0",
              fillOpacity: 0,
              strokeDasharray: 1500,
              strokeDashoffset: 1500,
              animation: "draw-letter 2s ease-in-out 1s forwards",
            }}
          />
        </svg>
      </div>

      <style>
        {`
          @keyframes draw-horizontal {
            to {
              stroke-dashoffset: 0;
              fill-opacity: 1;
            }
          }
          
          @keyframes draw-letter {
            to {
              stroke-dashoffset: 0;
              fill-opacity: 1;
            }
          }
          
          @keyframes reset-animation {
            0%, 90% {
              opacity: 1;
            }
            95% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AnimatedLogoLoader;
