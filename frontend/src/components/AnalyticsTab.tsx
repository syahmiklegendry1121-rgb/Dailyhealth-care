'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import { TrendingUp, Moon, Activity, Droplet, Flame, Compass } from 'lucide-react';

interface AnalyticsTabProps {
  history: any[];
}

export default function AnalyticsTab({ history }: AnalyticsTabProps) {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<'7' | '14' | '30'>('14');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
        <Activity className="w-12 h-12 text-slate-350 animate-pulse mb-3" />
        <p className="font-bold text-sm">No historical log data available.</p>
        <p className="text-xs mt-1 text-slate-400">Fill in today's questionnaire to generate chart metrics.</p>
      </div>
    );
  }

  // Filter history based on selected timeframe
  const limit = Number(timeframe);
  const filteredData = history.slice(-limit).map(item => {
    // Format date string from YYYY-MM-DD to MM/DD
    const dateObj = new Date(item.date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    
    return {
      dateLabel: `${month}/${day}`,
      score: item.healthScore?.score || 0,
      sleep: item.sleep?.duration || 0,
      sleepQuality: item.sleep?.quality || 0,
      stress: item.stress?.level || 0,
      water: item.water?.glasses || 0,
      steps: item.steps?.count || 0,
      calories: item.food?.calories || 0,
      weight: item.food?.weight || 75.0, // fallback
    };
  });

  return (
    <div className="space-y-8 text-left">
      
      {/* Timeframe Selector */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-250 dark:border-slate-800">
        <div>
          <h3 className="font-extrabold text-slate-950 dark:text-white text-base">Wellness Trend Analytics</h3>
          <p className="text-xs text-slate-400">Interactive charts displaying daily biological habits and scores</p>
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          {(['7', '14', '30'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${timeframe === t ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}`}
            >
              {t} Days
            </button>
          ))}
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* 1. HEALTH SCORE TREND */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm text-slate-950 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Health Score Progress
            </span>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={10} fontWeight={600} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} fontWeight={600} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.95)' }} />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 3 }} name="Wellness Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. SLEEP TREND (DURATION & QUALITY) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm text-slate-950 dark:text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              Sleep Quality vs Duration
            </span>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={10} fontWeight={600} />
                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={600} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.95)' }} />
                <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2.5} name="Hours" />
                <Line type="monotone" dataKey="sleepQuality" stroke="#ec4899" strokeWidth={2} name="Quality (1-10)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. CALORIES & STEPS INTEGRATION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm text-slate-950 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Steps Activity Trend
            </span>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={10} fontWeight={600} />
                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={600} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.95)' }} />
                <Area type="monotone" dataKey="steps" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSteps)" name="Steps Walked" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. WATER INTAKE */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm text-slate-950 dark:text-white flex items-center gap-2">
              <Droplet className="w-4 h-4 text-sky-500" />
              Water Consumption
            </span>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={10} fontWeight={600} />
                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={600} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.95)' }} />
                <Bar dataKey="water" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Water Glasses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. STRESS INDEX */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm text-slate-950 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-red-500" />
              Daily Stress Level Index
            </span>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={10} fontWeight={600} />
                <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={10} fontWeight={600} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.95)' }} />
                <Area type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStress)" name="Stress Level (1-10)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
