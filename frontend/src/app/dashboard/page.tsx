'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Activity, Moon, Droplet, Flame, Compass, Pill, ShieldAlert, 
  Award, TrendingUp, Sparkles, User, Settings, LogOut, Bell, ShieldCheck, 
  Play, Pause, RefreshCcw, Smartphone
} from 'lucide-react';
import QuestionnaireModal from '@/components/QuestionnaireModal';
import AnalyticsTab from '@/components/AnalyticsTab';
import ProfileTab from '@/components/ProfileTab';
import SettingsTab from '@/components/SettingsTab';
import AdminTab from '@/components/AdminTab';
import { 
  getHealthHistory, getHealthInsights, syncMobileSteps, sensorManager, 
  getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getSettings 
} from '@/utils/api';
import { translations, TranslationKey } from '@/utils/translations';

export default function Dashboard() {
  const router = useRouter();

  // Core User / Auth States
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Theme & Logout states
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [appLanguage, setAppLanguage] = useState('en');

  const t = (key: string): string => {
    const langDict = (translations as any)[appLanguage] || translations.en;
    return langDict[key] || (translations.en as any)[key] || String(key);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'insights' | 'profile' | 'settings' | 'admin'>('overview');

  // Daily logs and calculations
  const [history, setHistory] = useState<any[]>([]);
  const [todayLog, setTodayLog] = useState<any>(null);
  const [aiScore, setAiScore] = useState(0);
  const [aiRating, setAiRating] = useState('N/A');
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);

  // Sensor state
  const [sensorPermission, setSensorPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [sensorData, setSensorData] = useState({ steps: 0, distance: 0.0, calories: 0, activeMinutes: 0, speed: 0.0 });
  const [sensorSyncing, setSensorSyncing] = useState(false);
  const [sensorActive, setSensorActive] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Motivational quote
  const quotes = [
    "Your body hears everything your mind says. Keep it positive.",
    "Health is not about the weight you lose, it's about the life you gain.",
    "The groundwork of all happiness is health.",
    "It is health that is real wealth and not pieces of gold and silver.",
    "Small daily improvements over time lead to stunning results."
  ];
  const [quote, setQuote] = useState(quotes[0]);

  // Verify auth on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('dh_token');
      const savedUserStr = localStorage.getItem('dh_user');
      
      if (!savedToken || !savedUserStr) {
        router.push('/auth');
        return;
      }

      setToken(savedToken);
      setUser(JSON.parse(savedUserStr));
      
      // Select random quote
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }
  }, []);

  // Fetch data if authenticated
  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      
      // Get history
      const logs = await getHealthHistory(30);
      setHistory(logs);

      // Find if we have today's log in history
      const todayEntry = logs.find((l: any) => l.date === todayStr);
      if (todayEntry) {
        setTodayLog(todayEntry);
      }

      // Get today's insights
      const insightsData = await getHealthInsights(todayStr);
      setAiScore(insightsData.score);
      setAiRating(insightsData.rating);
      setAiInsights(insightsData.insights);

      // Get notifications
      const notifs = await getNotifications();
      setNotifications(notifs);

      // Get settings
      try {
        const s = await getSettings();
        if (s && s.language) {
          setAppLanguage(s.language);
        }
      } catch (e) {
        console.warn('Failed to load language settings:', e);
      }
    } catch (e) {
      console.error('Failed to load dashboard logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Subscribe to live mobile steps sensor
  useEffect(() => {
    const unsubscribe = sensorManager.subscribe((data) => {
      setSensorData(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Automatic periodic steps syncing to backend (every 3 minutes)
  useEffect(() => {
    if (!token || sensorData.steps === 0) return;

    const syncInterval = setInterval(async () => {
      await handleSyncSensor();
    }, 180000); // 3 minutes

    return () => clearInterval(syncInterval);
  }, [token, sensorData.steps]);

  // Manual & Auto sensor syncing
  const handleSyncSensor = async () => {
    if (!token) return;
    setSensorSyncing(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await syncMobileSteps({
        date: todayStr,
        count: sensorData.steps,
        distance: sensorData.distance,
        activeMinutes: sensorData.activeMinutes,
        caloriesBurned: sensorData.calories,
      });
      
      // Refresh logs & charts
      await fetchDashboardData();
    } catch (err) {
      console.error('Sensor steps sync error:', err);
    } finally {
      setSensorSyncing(false);
    }
  };

  // Enable smart mobile sensors
  const handleEnableSensors = async () => {
    try {
      const granted = await sensorManager.requestPermission();
      if (granted) {
        setSensorPermission('granted');
        setSensorActive(true);
        // Push notification of active sensor
        setNotifications(prev => [
          {
            id: 'sensor-activated',
            title: 'Mobile Pedometer Active',
            message: 'Simulated Google Fit / Apple HealthKit sync is running in the background.',
            type: 'info',
            read: false,
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
      } else {
        setSensorPermission('denied');
      }
    } catch (e) {
      setSensorPermission('denied');
    }
  };

  const handleDisableSensors = () => {
    sensorManager.stop();
    setSensorActive(false);
    setNotifications(prev => [
      {
        id: 'sensor-deactivated-' + Date.now(),
        title: 'Mobile Pedometer Deactivated',
        message: 'Step counting and sensor synchronization have been paused.',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const handleSignOut = () => {
    setIsSignOutModalOpen(true);
  };

  const handleConfirmSignOut = () => {
    localStorage.clear();
    setIsSignOutModalOpen(false);
    router.push('/');
  };

  // Questionnaire form completion
  const handleQuestionnaireSuccess = async (updatedData: any, newInsights: string[]) => {
    setTodayLog(updatedData);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const insightsData = await getHealthInsights(todayStr);
    setAiScore(insightsData.score);
    setAiRating(insightsData.rating);
    setAiInsights(insightsData.insights);

    // Refresh history array for charts
    const logs = await getHealthHistory(30);
    setHistory(logs);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  // Determine progress color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'stroke-emerald-500';
    if (score >= 70) return 'stroke-blue-500';
    if (score >= 50) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Syncing Secure Cloud Node...</span>
        </div>
      </div>
    );
  }

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none dark:bg-blue-900/10" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none dark:bg-purple-900/10" />

      {/* DASHBOARD HEADER */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-slate-800 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent hidden sm:block">
              DailyHealth
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-850">
            {[
              { id: 'overview', icon: Activity },
              { id: 'analytics', icon: TrendingUp },
              { id: 'insights', icon: Sparkles },
              { id: 'profile', icon: User },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {t(tab.id as TranslationKey)}
              </button>
            ))}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'admin' ? 'bg-white dark:bg-slate-855 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('adminPanel')}
              </button>
            )}
          </nav>

          {/* User Details & Notifications dropdown */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-slate-600 dark:text-slate-355 cursor-pointer"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Activity className="w-4 h-4 text-yellow-450" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-slate-660 dark:text-slate-300 relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0a0f1e]" />
                )}
              </button>

              {/* Dropdown menu */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 glass-panel border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50 text-left">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-800 mb-3">
                    <span className="font-bold text-xs">{t('notifications')} ({unreadNotificationsCount})</span>
                    {unreadNotificationsCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-3xs text-blue-500 hover:underline font-bold">{t('markAllRead')}</button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2.5">
                    {notifications.length === 0 ? (
                      <p className="text-3xs text-slate-400 text-center py-4">{t('noNotifications')}</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleMarkRead(n.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${n.read ? 'border-slate-100 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-900/10' : 'border-blue-500/10 bg-blue-500/5 hover:border-blue-500/20'}`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-bold text-xs">{n.title}</span>
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                          </div>
                          <p className="text-3xs text-slate-500 mt-1">{n.message}</p>
                          <span className="text-4xs text-slate-400 mt-1 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div 
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2.5 pl-3 border-l border-slate-250 dark:border-slate-850 cursor-pointer hover:opacity-80 transition-all select-none group"
              title="Open Settings"
            >
              <div className="w-8.5 h-8.5 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500 font-extrabold text-sm uppercase group-hover:scale-105 transition-transform">
                {user?.name?.slice(0, 2)}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-none group-hover:text-blue-500 transition-colors">{user?.name}</span>
                <span className="text-4xs text-slate-400 font-bold uppercase mt-1 tracking-wide">{user?.role}</span>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-slate-250 dark:border-slate-855 shadow-2xl p-2 z-40 flex justify-around">
        {[
          { id: 'overview', icon: Activity },
          { id: 'analytics', icon: TrendingUp },
          { id: 'insights', icon: Sparkles },
          { id: 'profile', icon: User },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-4xs font-bold transition-all ${activeTab === tab.id ? 'text-blue-500' : 'text-slate-450 hover:text-slate-700'}`}
          >
            <tab.icon className="w-5 h-5" />
            {t(tab.id as TranslationKey)}
          </button>
        ))}
      </div>

      {/* DASHBOARD CONTENT BODY */}
      <main className="flex-1 max-w-8xl w-full mx-auto px-6 sm:px-10 lg:px-16 py-12 pb-24 md:pb-12">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            
            {/* WELCOME BAR & HEALTH SCORE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Welcome card */}
              <div className="lg:col-span-2 p-10 rounded-[32px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-800 text-white relative overflow-hidden flex flex-col justify-between text-left shadow-xl shadow-indigo-500/10">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                
                <div>
                  <span className="text-xs uppercase tracking-widest font-bold opacity-80">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <h2 className="text-3xl font-black mt-2">{t('welcomeBack')}, {user?.name}!</h2>
                  <p className="text-sm opacity-90 mt-4 max-w-md italic leading-relaxed">
                    "{quote}"
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button 
                    onClick={() => setIsQuestionnaireOpen(true)}
                    className="px-6 py-3.5 bg-white text-blue-700 font-extrabold rounded-2xl shadow-md hover:bg-slate-100 transform active:scale-95 transition-all text-xs"
                  >
                    {t('logWellness')}
                  </button>
                  
                  {(!sensorActive || sensorPermission !== 'granted') ? (
                    <button 
                      onClick={handleEnableSensors}
                      className="px-6 py-3.5 bg-white/20 text-white border border-white/30 font-extrabold rounded-2xl hover:bg-white/30 transform active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4" /> {t('activateSensor')}
                    </button>
                  ) : (
                    <button 
                      onClick={handleDisableSensors}
                      className="px-6 py-3.5 bg-red-650 hover:bg-red-500 text-white font-extrabold rounded-2xl shadow-md hover:scale-[1.02] transform active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Deactivate sensor sync and stop steps live counting"
                    >
                      <Smartphone className="w-4 h-4 animate-pulse" /> Deactivate Sensor
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Ring Card */}
              <div className="p-10 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col items-center justify-center text-center">
                <span className="text-2xs text-slate-400 font-bold uppercase tracking-wide mb-4">{t('healthScore')}</span>
                
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="66" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="10" />
                    <circle 
                      cx="80" cy="80" r="66" 
                      className={`fill-none ${getScoreColor(aiScore)} transition-all duration-1000`} 
                      strokeWidth="10" 
                      strokeDasharray="414" 
                      strokeDashoffset={414 - (414 * aiScore) / 100}
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-4xl font-black text-slate-900 dark:text-white">{aiScore}</div>
                    <div className="text-4xs text-slate-400 uppercase font-extrabold tracking-widest mt-1">out of 100</div>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-xs bg-blue-500/10 text-blue-500 dark:text-blue-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    {aiRating}
                  </span>
                </div>
              </div>

            </div>

            {/* LIVE WIDGET CARDS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              
              {/* Card: Steps */}
              <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col justify-between text-left hover:border-blue-500/35 transition-all hover:scale-[1.01]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xs text-slate-450 font-bold uppercase">{t('stepTracker')}</span>
                  <Smartphone className="w-5.5 h-5.5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {todayLog?.steps?.count ? todayLog.steps.count.toLocaleString() : sensorData.steps.toLocaleString()}
                  </div>
                  <span className="text-3xs text-slate-400 mt-1 block">Distance: {todayLog?.steps?.distance || sensorData.distance} km</span>
                </div>
              </div>

              {/* Card: Sleep */}
              <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col justify-between text-left hover:border-purple-500/35 transition-all hover:scale-[1.01]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xs text-slate-455 font-bold uppercase">{t('sleepTracker')}</span>
                  <Moon className="w-5.5 h-5.5 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {todayLog?.sleep?.duration ? `${todayLog.sleep.duration} hrs` : '--'}
                  </div>
                  <span className="text-3xs text-slate-400 mt-1 block">Quality: {todayLog?.sleep?.quality || '--'}/10</span>
                </div>
              </div>

              {/* Card: Water */}
              <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col justify-between text-left hover:border-sky-500/35 transition-all hover:scale-[1.01]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xs text-slate-455 font-bold uppercase">{t('hydrationTracker')}</span>
                  <Droplet className="w-5.5 h-5.5 text-sky-500" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {todayLog?.water?.glasses ? `${todayLog.water.glasses} glasses` : '0 glasses'}
                  </div>
                  <span className="text-3xs text-slate-400 mt-1 block">Target is 8 glasses</span>
                </div>
              </div>

              {/* Card: Stress */}
              <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col justify-between text-left hover:border-red-500/35 transition-all hover:scale-[1.01]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xs text-slate-450 font-bold uppercase">Stress Index</span>
                  <Compass className="w-5.5 h-5.5 text-red-500" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {todayLog?.stress?.level ? `${todayLog.stress.level}/10` : '--'}
                  </div>
                  <span className="text-3xs text-slate-400 mt-1 block">Productivity: {todayLog?.stress?.productivity || '--'}/10</span>
                </div>
              </div>

            </div>

            {/* SECONDARY VITALS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              
              {/* Card: Heart Rate */}
              <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col justify-between text-left hover:border-rose-500/35 transition-all hover:scale-[1.01]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xs text-slate-450 font-bold uppercase">Heart Rate</span>
                  <Heart className="w-5.5 h-5.5 text-rose-500" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {todayLog?.heartRate?.bpm ? `${todayLog.heartRate.bpm} bpm` : '--'}
                  </div>
                  <span className="text-3xs text-slate-400 mt-1 block">Resting pulse range</span>
                </div>
              </div>

              {/* Card: Blood Sugar */}
              <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col justify-between text-left hover:border-emerald-500/35 transition-all hover:scale-[1.01]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xs text-slate-450 font-bold uppercase">Blood Sugar</span>
                  <Activity className="w-5.5 h-5.5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {todayLog?.bloodSugar?.level ? `${todayLog.bloodSugar.level} mg/dL` : '--'}
                  </div>
                  <span className="text-3xs text-slate-400 mt-1 block">Fasting glucose value</span>
                </div>
              </div>

              {/* Card: BP */}
              <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col justify-between text-left hover:border-indigo-500/35 transition-all hover:scale-[1.01]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xs text-slate-450 font-bold uppercase">Blood Pressure</span>
                  <ShieldAlert className="w-5.5 h-5.5 text-indigo-500" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {todayLog?.bloodPressure?.systolic ? `${todayLog.bloodPressure.systolic}/${todayLog.bloodPressure.diastolic}` : '--'}
                  </div>
                  <span className="text-3xs text-slate-400 mt-1 block">Systolic / Diastolic</span>
                </div>
              </div>

              {/* Card: Meds */}
              <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col justify-between text-left hover:border-teal-500/35 transition-all hover:scale-[1.01]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xs text-slate-450 font-bold uppercase">Medication</span>
                  <Pill className="w-5.5 h-5.5 text-teal-500" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {todayLog?.medication?.taken ? 'Taken' : todayLog?.medication ? 'Missed' : '--'}
                  </div>
                  <span className="text-3xs text-slate-450 mt-1 block truncate max-w-xs">{todayLog?.medication?.notes || 'No pills details logged'}</span>
                </div>
              </div>

            </div>

            {/* SENSOR STATUS PANEL */}
            {sensorPermission === 'granted' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-950 dark:text-white">Live Browser Pedometer Activated</h4>
                    <p className="text-3xs text-slate-450">Accelerometer (DeviceMotion API) reads. Shake device to simulate steps!</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-center">
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 dark:text-white">{sensorData.steps} Steps</div>
                    <div className="text-4xs text-slate-400 font-bold uppercase">Current Session</div>
                  </div>
                  <button
                    onClick={handleSyncSensor}
                    disabled={sensorSyncing}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
                  >
                    {sensorSyncing ? (
                      <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <RefreshCcw className="w-3.5 h-3.5" />
                        Sync Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && <AnalyticsTab history={history} />}

        {/* AI INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div className="space-y-6 text-left max-w-4xl mx-auto">
            <div className="bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-250 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-950 dark:text-white text-base">Personalized Health Insights</h3>
              <p className="text-xs text-slate-400">Biological evaluations computed using machine diagnostics recommendations</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {aiInsights.map((ins, index) => (
                <div 
                  key={index} 
                  className="p-5 rounded-2xl glass-panel border-l-4 border-l-blue-500 border-t border-r border-b border-slate-200 dark:border-slate-800 flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">{ins}</p>
                    <span className="text-4xs text-slate-400 font-bold uppercase mt-1 block">AI Recommendation • Just now</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <ProfileTab 
            onProfileUpdate={(updatedUser) => {
              setUser(updatedUser);
            }} 
          />
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && <SettingsTab onLanguageChange={(lang) => setAppLanguage(lang)} />}

        {/* ADMIN TAB */}
        {activeTab === 'admin' && user?.role === 'ADMIN' && <AdminTab />}

      </main>

      {/* QUESTIONNAIRE MODAL */}
      <QuestionnaireModal 
        isOpen={isQuestionnaireOpen} 
        onClose={() => setIsQuestionnaireOpen(false)}
        onSuccess={handleQuestionnaireSuccess}
        initialData={todayLog}
      />

      {/* SIGN OUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {isSignOutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 rounded-[28px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white mb-2">Sign Out Confirmation</h3>
              <p className="text-xs text-slate-500 mb-6">Are you sure you want to log out of your DailyHealth account? You will need to sign in again to access your dashboard.</p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setIsSignOutModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSignOut}
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Confirm Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
