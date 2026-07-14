'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Smartphone, TrendingUp, ShieldCheck, Heart } from 'lucide-react';

interface PreloaderProps {
  text?: string;
}

export default function Preloader({ text = 'Optimizing Your Health Data... Please wait.' }: PreloaderProps) {
  const icons = [Activity, Smartphone, TrendingUp, ShieldCheck, Heart];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % icons.length);
    }, 180); // Rapid icon-swapping speed (180ms)
    return () => clearInterval(interval);
  }, []);

  const ActiveIcon = icons[currentIndex];

  // Match the colors in the user's uploaded mockup:
  // Activity -> Blue, Smartphone -> Purple, TrendingUp -> Green, Shield -> Cyan, Heart -> Red
  const colors = [
    'text-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.25)] border-blue-500/30',
    'text-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.25)] border-purple-500/30',
    'text-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.25)] border-emerald-500/30',
    'text-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.25)] border-cyan-500/30',
    'text-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.25)] border-rose-500/30'
  ];
  const activeColorClass = colors[currentIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="flex flex-col items-center gap-6">
        
        {/* Animated cycling icon block */}
        <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${activeColorClass}`}>
          <ActiveIcon className="w-10 h-10 animate-pulse" />
        </div>

        {/* Text underneath */}
        <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 tracking-wide animate-pulse">
          {text}
        </span>
      </div>
    </div>
  );
}
