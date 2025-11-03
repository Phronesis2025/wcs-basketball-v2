"use client";

import React from "react";

/**
 * BasketballLoader Component
 * 
 * A basketball bouncing animation loader without background.
 * Recreated from the original basketball loader with animations.
 * 
 * @param className - Additional CSS classes to apply to the container
 * @param size - Size of the basketball in pixels (default: 100)
 */
export default function BasketballLoader({ 
  className = "",
  size = 100 
}: { 
  className?: string;
  size?: number;
}) {
  // Calculate animation values based on size
  const bounce190 = size * 1.9;
  const bounce50 = size * 0.5;
  const bounce60 = size * 0.6;
  const shadow10 = size * 0.1;
  const shadow30 = size * 0.3;
  const shadow58 = size * 0.58;
  const shadowHalf = size / 2;
  const shadow05 = size * 0.05;
  const shadow15 = size * 0.15;
  const shadow29 = size * 0.29;
  const ballRadius = size / 2;
  
  return (
    <>
      <style>{`
        .basketball-loader-${size} {
          position: relative;
          width: ${size * 2}px;
          height: ${size * 3}px;
          margin: 0 auto;
        }
        
        .basketball-ball-${size} {
          z-index: 3;
          width: ${size}px;
          height: ${size}px;
          position: absolute;
          top: 0px;
          left: 50%;
          margin-left: -${ballRadius}px;
          border-radius: ${ballRadius}px;
          animation: bounce-${size} 3.95s forwards infinite;
        }
        
        .basketball-shadow-${size} {
          position: absolute;
          height: 5px;
          width: ${size}px;
          background-color: rgba(0, 0, 0, 1);
          bottom: 10px;
          left: 50%;
          margin-left: -${shadowHalf}px;
          animation: shadow-${size} 3.85s forwards infinite;
        }
        
        .basketball-loading-text-${size} {
          position: absolute;
          text-align: center;
          font-family: sans-serif;
          width: 100%;
          margin-left: 10px;
          letter-spacing: 3px;
          bottom: -20px;
          font-weight: bolder;
          text-transform: uppercase;
          font-size: 8px;
          color: inherit;
        }
        
        @keyframes bounce-${size} {
          0% {
            top: 0;
            animation-timing-function: ease-in;
          }
          16% {
            top: ${bounce190}px;
            animation-timing-function: ease-out;
          }
          32% {
            top: ${bounce50}px;
            animation-timing-function: ease-in;
          }
          48% {
            top: ${bounce190}px;
            animation-timing-function: ease-out;
          }
          62% {
            top: ${bounce60}px;
            animation-timing-function: ease-in;
          }
          78% {
            top: ${bounce190}px;
            animation-timing-function: ease-out;
          }
          85% {
            top: ${bounce50}px;
            animation-timing-function: ease-in;
          }
          90% {
            top: ${bounce190}px;
            animation-timing-function: ease-out;
          }
          100% {
            top: 0;
            animation-timing-function: ease-in;
          }
        }
        
        @keyframes shadow-${size} {
          0% {
            width: ${shadow10}px;
            border-radius: ${shadow10}px / 5px;
            margin-left: -${shadow05}px;
            animation-timing-function: ease-in;
            background-color: rgba(0, 0, 0, 0.2);
          }
          16% {
            width: ${size}px;
            border-radius: ${size}px / 5px;
            margin-left: -${shadowHalf}px;
            animation-timing-function: ease-out;
            background-color: rgba(0, 0, 0, 0.9);
          }
          32% {
            width: ${shadow30}px;
            border-radius: ${shadow30}px / 5px;
            margin-left: -${shadow15}px;
            animation-timing-function: ease-in;
            background-color: rgba(0, 0, 0, 0.7);
          }
          48% {
            width: ${size}px;
            border-radius: ${size}px / 5px;
            margin-left: -${shadowHalf}px;
            animation-timing-function: ease-out;
            background-color: rgba(0, 0, 0, 0.9);
          }
          62% {
            width: ${shadow58}px;
            border-radius: ${shadow58}px / 5px;
            margin-left: -${shadow29}px;
            animation-timing-function: ease-in;
            background-color: rgba(0, 0, 0, 0.7);
          }
          78% {
            width: ${size}px;
            border-radius: ${size}px / 5px;
            margin-left: -${shadowHalf}px;
            animation-timing-function: ease-all;
            background-color: rgba(0, 0, 0, 0.9);
          }
          85% {
            width: ${shadow58}px;
            border-radius: ${shadow58}px / 5px;
            margin-left: -${shadow29}px;
            animation-timing-function: ease-all;
            background-color: rgba(0, 0, 0, 0.85);
          }
          90% {
            width: ${size}px;
            border-radius: ${size}px / 5px;
            margin-left: -${shadowHalf}px;
            animation-timing-function: ease-out;
            background-color: rgba(0, 0, 0, 0.85);
          }
          100% {
            width: ${shadow10}px;
            border-radius: ${shadow10}px / 5px;
            margin-left: -${shadow05}px;
            animation-timing-function: ease-in;
            background-color: rgba(0, 0, 0, 0.9);
          }
        }
      `}</style>
      <div className={`basketball-loader-${size} ${className}`}>
        <div className={`basketball-ball-${size}`}>
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 100 100"
            enableBackground="new 0 0 100 100"
            xmlSpace="preserve"
            width={size}
            height={size}
          >
            <g>
              <path
                d="M72.6,33.1c6.7-2,14.3-0.9,22.7,3.2c1.3,0.6,2.7-0.6,2.3-1.9c-2.3-7.1-6.2-13.6-11.3-18.9c-0.5-0.5-1.2-0.6-1.8-0.4
                C78,18,72,21,66.5,24.1c-0.9,0.5-1.1,1.7-0.4,2.5c0,0,0,0,0,0c1.6,1.9,3.2,3.9,4.6,5.9C71.1,33.1,71.9,33.3,72.6,33.1z"
                fill="#000000"
              />
              <path
                d="M44,14.6c-6.6-3.5-13.2-5.8-19-7.3c-0.4-0.1-0.9,0-1.3,0.2C14.4,13.2,7.2,21.9,3.3,32.2c-0.5,1.2,0.6,2.5,1.9,2.2
                c9.5-2.3,27-7.6,39-17C45.2,16.6,45.1,15.1,44,14.6z"
                fill="#000000"
              />
              <path
                d="M79.8,9.9C74.6,6,68.7,3.1,62.3,1.5c-0.8-0.2-1.7,0.3-1.9,1.1c-1.2,4.1-3.3,7.8-6.1,11.1c-0.6,0.7-0.4,1.8,0.3,2.3
                c2.1,1.5,4.2,3.2,6.2,5c0.5,0.5,1.3,0.6,1.9,0.2c5.2-3,10.8-5.9,16.8-8.6C80.6,12.2,80.8,10.6,79.8,9.9z"
                fill="#000000"
              />
              <path
                d="M56.1,22.8c-1.7-1.4-3.4-2.7-5.1-3.9c-0.6-0.4-1.4-0.4-2,0.1C34.3,31.8,10.5,37.7,2.1,39.5c-0.6,0.1-1.1,0.6-1.3,1.3
                C0.3,43.8,0,46.8,0,50c0,8.8,2.3,17,6.3,24.2c0.6,1.1,2.2,1.1,2.8,0c1.1-2,2.3-4,3.6-6C21.1,55,34.6,39.2,56,25.4
                C56.9,24.8,57,23.5,56.1,22.8z"
                fill="#000000"
              />
              <path
                d="M50.3,11.6c2.4-2.8,4.4-5.9,5.5-9.3c0.4-1-0.3-2.1-1.4-2.2C53,0.1,51.5,0,50,0c-5.4,0-10.7,0.9-15.6,2.5
                C33,3,33,5,34.4,5.6c4.5,1.6,9.2,3.7,13.9,6.4C49,12.3,49.8,12.2,50.3,11.6z"
                fill="#000000"
              />
              <path
                d="M74.8,39.2c6.4,12.2,9.4,26.8,9,43.8c0,1.5,1.8,2.3,2.8,1.2C94.9,75.2,100,63.2,100,50c0-1.8-0.1-3.6-0.3-5.4
                c-0.1-0.5-0.3-0.9-0.8-1.2c-8.7-5.5-16.5-7.7-23.1-6.6C74.8,37,74.2,38.2,74.8,39.2z"
                fill="#000000"
              />
              <path
                d="M66,36.2c0.8-0.5,0.9-1.5,0.4-2.3c-1.1-1.6-2.3-3.1-3.5-4.5c-0.3-0.4-0.7-0.7-1-1.1c-0.5-0.6-1.4-0.7-2.1-0.3
                c-21.5,13.6-35,29.2-43.4,42.3c-2,3.2-3.8,6.4-5.4,9.4c-0.3,0.6-0.2,1.3,0.2,1.8c7.3,9,17.7,15.4,29.6,17.6
                c0.9,0.2,1.8-0.5,1.9-1.5C44.4,77.9,49.7,47.1,66,36.2z"
                fill="#000000"
              />
              <path
                d="M68.2,39.9C53.5,49.9,48.7,79.3,47,98.2c-0.1,0.9,0.7,1.7,1.6,1.8c0.5,0,0.9,0,1.4,0c10.5,0,20.3-3.3,28.4-8.8
                c0.4-0.3,0.7-0.7,0.7-1.2c1.5-19.6-1.3-36.2-8.5-49.4C70.1,39.7,69,39.4,68.2,39.9z"
                fill="#000000"
              />
            </g>
          </svg>
        </div>
        <div className={`basketball-shadow-${size}`}></div>
        <p className={`basketball-loading-text-${size}`}>Loading...</p>
      </div>
    </>
  );
}
