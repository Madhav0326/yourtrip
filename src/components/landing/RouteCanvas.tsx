import React from 'react';
import { motion } from 'framer-motion';

export const RouteCanvas: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 select-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D95D39" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#E58B24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2E6F56" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Dynamic Curved Route Path */}
        <motion.path
          d="M 50,450 C 250,200 450,600 650,300 C 850,50 950,500 1150,250"
          stroke="url(#routeGradient)"
          strokeWidth="3"
          strokeDasharray="8 8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Animated Waypoint Pins */}
        <motion.circle
          cx="250"
          cy="310"
          r="6"
          fill="#D95D39"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <circle cx="250" cy="310" r="14" stroke="#D95D39" strokeWidth="1.5" strokeOpacity="0.4" />

        <motion.circle
          cx="650"
          cy="300"
          r="6"
          fill="#E58B24"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2.5, delay: 0.8, repeat: Infinity }}
        />
        <circle cx="650" cy="300" r="14" stroke="#E58B24" strokeWidth="1.5" strokeOpacity="0.4" />

        <motion.circle
          cx="950"
          cy="420"
          r="6"
          fill="#2E6F56"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2.5, delay: 1.6, repeat: Infinity }}
        />
        <circle cx="950" cy="420" r="14" stroke="#2E6F56" strokeWidth="1.5" strokeOpacity="0.4" />
      </svg>
    </div>
  );
};
