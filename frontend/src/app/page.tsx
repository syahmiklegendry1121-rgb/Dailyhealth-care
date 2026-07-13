'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Activity, 
  Moon, 
  Droplet, 
  Flame, 
  Shield, 
  TrendingUp, 
  ChevronDown, 
  ChevronRight, 
  Smartphone, 
  Star,
  Zap,
  Menu,
  X,
  Pill
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [appLang, setAppLang] = useState('en');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Monitor PWA installation status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setDeferredPrompt(null);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("To install DailyHealth App on your device:\n\n• For Apple iOS Safari: Tap the Share button (⎙) at the bottom and choose 'Add to Home Screen'.\n• For Android Chrome: Tap the menu (⋮) in the top-right and choose 'Install app' or 'Add to Home screen'.\n• For Desktop: Click the Install icon in the right side of the URL search bar.");
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check language preferences, theme settings, and auth status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lang = localStorage.getItem('theme_lang') || 'en';
      setAppLang(lang);
      
      const token = localStorage.getItem('dh_token');
      setIsLoggedIn(!!token);
    }
  }, []);

  const handleLanguageChange = async (lang: string) => {
    setAppLang(lang);
    const { setLanguageCookie } = await import('@/utils/translations');
    setLanguageCookie(lang);
  };

  // Check dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const faqData = [
    {
      q: "How does the AI Health Score calculation work?",
      a: "Our algorithm calculates your health score out of 100 daily by analyzing multiple inputs: sleep duration & quality, stress levels, hydration (water intake), exercise & physical activity, heart rate, blood pressure, medication adherence, and logs consistency. A score above 90 is Excellent, 70-89 is Good, and below 50 indicates fields needing immediate improvement."
    },
    {
      q: "Can I connect my smart watch or phone sensors?",
      a: "Yes! The portal features automatic mobile sensor integration. We support browser accelerometers for active pedometer step-counting directly, as well as mock adapters that simulate background synchronization from Apple HealthKit, Google Fit, and Android Health Connect."
    },
    {
      q: "Where is my health data stored, and is it secure?",
      a: "Your health reports are saved in our secure PostgreSQL database and instantly delivered to your registered email address every night. We use standard JWT authentication, cryptographically hashed passwords, SSL encryption, and input validation to keep your information safe."
    },
    {
      q: "Is there a mobile application I can install?",
      a: "This website is fully configured as a Progressive Web App (PWA). You can click 'Add to Home Screen' or the install icon in your browser search bar on Chrome, iOS Safari, or Android to run it as a standalone native-feeling health app with offline capabilities."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#060a13] transition-colors duration-300 text-slate-900 dark:text-slate-105">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none dark:from-blue-900/15" />
      <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none dark:bg-teal-900/10" />
      <div className="absolute top-[40%] left-[-5%] w-[700px] h-[700px] bg-rose-500/5 rounded-full blur-[160px] pointer-events-none dark:bg-rose-900/10" />

      {/* HEADER NAVBAR */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-slate-950/95 shadow-lg py-4.5 border-b border-slate-200/50 dark:border-slate-800/50' : 'bg-transparent py-7'}`}>
        <div className="max-w-8xl mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Heart className="w-6 h-6 text-white animate-pulse" />
            </div>
            <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              DailyHealth
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-10">
            <Link href="#features" className="text-sm font-extrabold text-slate-650 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-450 transition-colors">Features</Link>
            <Link href="#statistics" className="text-sm font-extrabold text-slate-655 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-450 transition-colors">Stats</Link>
            <Link href="#testimonials" className="text-sm font-extrabold text-slate-650 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-455 transition-colors">Testimonials</Link>
            <Link href="#faq" className="text-sm font-extrabold text-slate-655 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-450 transition-colors">FAQ</Link>
            <Link href="/dashboard" className="text-sm font-extrabold text-slate-650 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-455 transition-colors">Dashboard</Link>
          </nav>

          {/* Actions & Buttons */}
          <div className="hidden md:flex items-center gap-8">
            <select
              value={appLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-slate-700 dark:text-slate-300 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 cursor-pointer outline-none hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
              <option value="ur">اردو (Urdu)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="tcy">ತುಳು (Tulu)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>

            <button 
              onClick={toggleDarkMode}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Activity className="w-4.5 h-4.5 text-yellow-400" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            
            {!isLoggedIn ? (
              <>
                <Link 
                  href="/auth?tab=login" 
                  className="text-sm font-extrabold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                
                <Link 
                  href="/auth?tab=register" 
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-extrabold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.02] transform active:scale-[0.98] transition-all duration-200 whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <Link 
                href="/dashboard" 
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-extrabold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.02] transform active:scale-[0.98] transition-all duration-200 whitespace-nowrap"
              >
                Go to Dashboard
              </Link>
            )}
          </div>

          {/* Mobile Navigation controls */}
          <div className="flex items-center gap-4 md:hidden">
            <select
              value={appLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-slate-700 dark:text-slate-300 border border-slate-250 dark:border-slate-800 rounded-xl px-2.5 py-1.5 cursor-pointer outline-none hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="bn">BN</option>
              <option value="mr">MR</option>
              <option value="te">TE</option>
              <option value="ta">TA</option>
              <option value="gu">GU</option>
              <option value="ur">UR</option>
              <option value="kn">KN</option>
              <option value="tcy">TCY</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
              <option value="de">DE</option>
            </select>

            <button 
              onClick={toggleDarkMode}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Activity className="w-4.5 h-4.5 text-yellow-400" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6.5 h-6.5" /> : <Menu className="w-6.5 h-6.5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 mt-2 px-6 py-6 flex flex-col gap-4 shadow-2xl"
            >
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-sm font-bold text-slate-750 dark:text-slate-300">Features</Link>
              <Link href="#statistics" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-sm font-bold text-slate-755 dark:text-slate-300">Stats</Link>
              <Link href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-sm font-bold text-slate-750 dark:text-slate-300">Testimonials</Link>
              <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-sm font-bold text-slate-755 dark:text-slate-300">FAQ</Link>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-sm font-bold text-slate-755 dark:text-slate-300">Dashboard</Link>
              <hr className="border-slate-200 dark:border-slate-850 my-1" />
              <div className="flex gap-4 items-center w-full">
                {!isLoggedIn ? (
                  <>
                    <Link href="/auth?tab=login" onClick={() => setMobileMenuOpen(false)} className="w-1/2 text-center py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-sm">
                      Sign In
                    </Link>
                    <Link href="/auth?tab=register" onClick={() => setMobileMenuOpen(false)} className="w-1/2 text-center py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-sm">
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-sm">
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-36 md:pt-36 md:pb-48 px-6 sm:px-10 lg:px-16">
        <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          
          {/* Left Text Block */}
          <div className="lg:col-span-7 flex flex-col text-left space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-extrabold self-start">
              <Zap className="w-4.5 h-4.5 fill-current" />
              Next-Gen Personal Health Dashboard
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05]">
              Empower Your <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent animate-gradient">Daily Wellness</span> Journey.
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-350 leading-relaxed max-w-2xl">
              Track sleep, stress, activity, nutrition, and clinical metrics with Google Fit & Apple Health. Receive real-time AI Insights, calculated wellness scoring, and secure email reports.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              {!isLoggedIn ? (
                <Link 
                  href="/auth?tab=register"
                  className="px-9 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-550 text-white font-extrabold text-center shadow-xl shadow-blue-500/25 hover:scale-[1.02] transform active:scale-[0.98] transition-all duration-205 text-base"
                >
                  Start Free Trial
                </Link>
              ) : (
                <Link 
                  href="/dashboard"
                  className="px-9 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-550 text-white font-extrabold text-center shadow-xl shadow-blue-500/25 hover:scale-[1.02] transform active:scale-[0.98] transition-all duration-205 text-base"
                >
                  Go to Dashboard
                </Link>
              )}
              <Link 
                href="#features"
                className="px-9 py-5 rounded-2xl border border-slate-250 dark:border-slate-800 bg-white/60 hover:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-900 font-extrabold text-slate-700 dark:text-slate-300 text-center hover:scale-[1.02] transform transition-all duration-200 text-base"
              >
                Learn More
              </Link>
            </div>
            
            {!isInstalled && (
              <div className="pt-3 text-left">
                <button 
                  onClick={handleInstallClick}
                  className="px-7 py-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/50 hover:bg-slate-150 dark:bg-slate-900/20 dark:hover:bg-slate-900 font-bold text-xs text-slate-655 dark:text-slate-400 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <Smartphone className="w-4 h-4 text-blue-500 animate-pulse" /> Download App
                </button>
              </div>
            )}
          </div>

          {/* Right Layout: Health Score Widget */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="w-full max-w-[460px] aspect-square rounded-[40px] p-8.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col justify-between relative z-10">
              
              {/* Floating score overlay */}
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 rounded-2xl p-4.5 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10.5 h-10.5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Activity className="w-5.5 h-5.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xs text-slate-400 font-bold uppercase tracking-wider">Today's Score</div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">88/100 (Good)</div>
                  </div>
                </div>
                <div className="h-2 w-20 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full w-[88%] bg-blue-500" />
                </div>
              </div>

              {/* Progress Ring */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-52 h-52 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    <circle cx="100" cy="100" r="82" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="12" />
                    <circle cx="100" cy="100" r="82" className="stroke-blue-500 fill-none" strokeWidth="12" strokeDasharray="515" strokeDashoffset="62" strokeLinecap="round" />
                    <circle cx="100" cy="100" r="68" className="stroke-purple-500 fill-none" strokeWidth="10" strokeDasharray="427" strokeDashoffset="125" strokeLinecap="round" />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider">Total Steps</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">8,452</h3>
                    <span className="text-3xs text-emerald-500 font-bold">+15% vs yesterday</span>
                  </div>
                </div>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-2xs text-purple-600 dark:text-purple-400 font-bold uppercase">Sleep</span>
                    <Moon className="w-4.5 h-4.5 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">7h 45m</div>
                    <div className="text-3xs text-slate-400 font-bold mt-0.5">Quality: 8/10</div>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-2xs text-teal-600 dark:text-teal-400 font-bold uppercase">Hydration</span>
                    <Droplet className="w-4.5 h-4.5 text-teal-500" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">6 / 8 gl.</div>
                    <div className="text-3xs text-slate-400 font-bold mt-0.5">Goal: 8 Glasses</div>
                  </div>
                </div>
              </div>

              {/* Floating advice banner */}
              <div className="absolute top-[48%] -left-16 hidden md:flex items-center gap-3.5 bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-64 z-10 transition-all hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-3xs text-slate-400 font-bold uppercase">AI INSIGHT</div>
                  <div className="text-2xs font-extrabold text-slate-850 dark:text-slate-200">"Drink 2 more glasses to hit target"</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section id="features" className="py-32 bg-white dark:bg-slate-900/30 border-t border-b border-slate-200/40 dark:border-slate-900/80">
        <div className="max-w-8xl mx-auto px-6 sm:px-10 lg:px-16">
          
          <div className="text-center max-w-2xl mx-auto mb-24">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Features Built for Your Goals
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm font-semibold">
              Everything you need to track, analyze, and optimize your fitness and clinical healthcare routines.
            </p>
          </div>

          {/* Expanded 3x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            
            {/* Feature 1 */}
            <div className="p-9.5 rounded-[32px] bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between gap-8 text-left shadow-sm">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-8">
                  <Activity className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Daily Health Questionnaire</h3>
                <p className="text-sm text-slate-500 dark:text-slate-405 leading-relaxed">
                  Log Sleep, Stress, Mood, Hydration, Nutrition, Exercise, Medication compliance, and physical symptoms daily with our intuitive interface.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-9.5 rounded-[32px] bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between gap-8 text-left shadow-sm">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-8">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Smart Pedometer Integration</h3>
                <p className="text-sm text-slate-500 dark:text-slate-405 leading-relaxed">
                  Sync walk counts, active duration, and calories burned using standard browser sensor wrappers, HealthKit, and Google Fit.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-9.5 rounded-[32px] bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between gap-8 text-left shadow-sm">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-8">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Detailed Trend Analytics</h3>
                <p className="text-sm text-slate-500 dark:text-slate-405 leading-relaxed">
                  Render interactive weekly, monthly, and yearly historical line graphs and charts using Recharts. Track weight, calories, water, and sleep.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-9.5 rounded-[32px] bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 hover:border-rose-500/30 transition-all duration-300 flex flex-col justify-between gap-8 text-left shadow-sm">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-8">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Health Score & Advice</h3>
                <p className="text-sm text-slate-500 dark:text-slate-405 leading-relaxed">
                  Formulate an automated 1-100 overall score and detailed feedback tips on how to improve sleep cycles, hydration levels, and exercise ratios.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-9.5 rounded-[32px] bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between gap-8 text-left shadow-sm">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-8">
                  <Shield className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Secure Email Summaries</h3>
                <p className="text-sm text-slate-500 dark:text-slate-405 leading-relaxed">
                  Automatically deliver daily health cards to your personal inbox upon submission, preserving health trends and offering diagnostic reports.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-9.5 rounded-[32px] bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 hover:border-yellow-500/30 transition-all duration-300 flex flex-col justify-between gap-8 text-left shadow-sm">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-8">
                  <Flame className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Progressive Web App</h3>
                <p className="text-sm text-slate-500 dark:text-slate-405 leading-relaxed">
                  Add to your mobile home screen to enjoy rapid launches, standalone window views, offline databases, and push reminders.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATISTICS & TREND ANALYSIS */}
      <section id="statistics" className="py-32 px-6 sm:px-10 lg:px-16">
        <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <div className="flex flex-col text-left space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Track Trends with Medical-Grade Visuals
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-350 leading-relaxed">
              Observe resting pulse frequency variations, systolic vs diastolic levels, and weight charts. Understand how sleeping cycles affect your stress indexes.
            </p>
          </div>

          {/* Extended Chart Card */}
          <div className="bg-white dark:bg-slate-900 p-8.5 rounded-[36px] border border-slate-200/85 dark:border-slate-800 shadow-xl w-full max-w-2xl mx-auto flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Active Heart Rate Trend</h3>
              <span className="text-2xs bg-red-500/10 text-red-500 font-extrabold px-3.5 py-1.5 rounded-lg uppercase tracking-wide">Live</span>
            </div>
            
            {/* Chart Area */}
            <div className="flex gap-6 items-end">
              
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between h-56 text-3xs font-extrabold text-slate-450 pb-2 text-right w-14 select-none">
                <span>90 bpm</span>
                <span>70 bpm</span>
                <span>50/min</span>
              </div>

              {/* Bar Grid Grid */}
              <div className="flex-1 h-56 flex items-end justify-between gap-2.5 pt-6 px-4 border-b border-l border-slate-200 dark:border-slate-850 relative">
                <div className="w-[11%] bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-xl transition-all duration-300 hover:opacity-85 cursor-pointer" style={{height: '65%'}} />
                <div className="w-[11%] bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-xl transition-all duration-300 hover:opacity-85 cursor-pointer" style={{height: '75%'}} />
                <div className="w-[11%] bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-xl transition-all duration-300 hover:opacity-85 cursor-pointer" style={{height: '58%'}} />
                <div className="w-[11%] bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-xl transition-all duration-300 hover:opacity-85 cursor-pointer" style={{height: '80%'}} />
                <div className="w-[11%] bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-xl transition-all duration-300 hover:opacity-85 cursor-pointer" style={{height: '70%'}} />
                <div className="w-[11%] bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-xl transition-all duration-300 hover:opacity-85 cursor-pointer" style={{height: '92%'}} />
                <div className="w-[11%] bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-xl transition-all duration-300 hover:opacity-85 cursor-pointer" style={{height: '85%'}} />
              </div>

            </div>

            {/* X-Axis Ticks */}
            <div className="flex justify-between mt-5 pl-20 pr-4 text-xs font-bold text-slate-400 uppercase tracking-wide select-none">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>

          </div>

        </div>
      </section>

      {/* HEALTH TRACKING METRICS DIRECTORY */}
      <section className="py-24 px-6 sm:px-10 lg:px-16 bg-slate-100/20 dark:bg-slate-900/5 border-t border-slate-200/50 dark:border-slate-800/40">
        <div className="max-w-8xl mx-auto text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Interactive Health Directory
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 text-base leading-relaxed">
              Explore professional insights and guidelines for each critical wellness metric. Click any card to view detailed stages, age ranges, patterns, and medical recommendations in a new tab.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: 'steps', title: 'Step Tracker', desc: 'Daily steps, physical targets, active walking speeds, and calorie burn conversion.', icon: Activity, color: 'text-blue-500 bg-blue-500/10' },
              { id: 'sleep', title: 'Sleep Tracker', desc: 'Sleep cycles, REM/Deep/Light stages, optimal duration, and 14-hour pattern details.', icon: Moon, color: 'text-purple-500 bg-purple-500/10' },
              { id: 'hydration', title: 'Hydration Tracker', desc: 'Hydration limits, water intake index, dehydration alerts, and consumption guidelines.', icon: Droplet, color: 'text-sky-500 bg-sky-500/10' },
              { id: 'stress', title: 'Stress Index', desc: 'Cortisol level tracking, stress scores, heart-rate variability, and relaxation techniques.', icon: Zap, color: 'text-red-500 bg-red-500/10' },
              { id: 'heartRate', title: 'Heart Rate', desc: 'Pulse frequency zones, bradycardia and tachycardia warnings, and aerobic targets.', icon: Heart, color: 'text-rose-500 bg-rose-500/10' },
              { id: 'bloodSugar', title: 'Blood Sugar', desc: 'Fasting vs post-prandial ranges, pre-diabetic thresholds, and glycemic load analysis.', icon: Activity, color: 'text-amber-500 bg-amber-500/10' },
              { id: 'bloodPressure', title: 'Blood Pressure', desc: 'Systolic and diastolic markers, hypertension stages, and stroke prevention tips.', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10' },
              { id: 'medication', title: 'Medication', desc: 'Prescription schedules, dosage reminders, drug adherence plans, and precautions.', icon: Pill, color: 'text-indigo-500 bg-indigo-500/10' }
            ].map(card => (
              <Link
                key={card.id}
                href={`/education?metric=${card.id}`}
                className="group p-8 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02] transform flex flex-col justify-between text-left h-72 cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-850 flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300">
                    <card.icon className={`w-6 h-6 ${card.color.split(' ')[0]}`} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 group-hover:text-blue-500 transition-colors">{card.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{card.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-3xs font-extrabold text-blue-500 mt-4 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS (Simplified to 2 large balanced cards for clean visual impact) */}
      <section id="testimonials" className="py-32 bg-slate-100/40 dark:bg-slate-900/10 border-t border-b border-slate-200/50 dark:border-slate-900">
        <div className="max-w-8xl mx-auto px-6 sm:px-10 lg:px-16">
          
          <div className="text-center max-w-2xl mx-auto mb-24">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Loved by Health Enthusiasts
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm font-semibold">
              Here is what our members have to say about their wellness transformations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            
            {/* Card 1 */}
            <div className="p-10 rounded-[36px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between text-left min-h-[300px] hover:shadow-md transition-shadow">
              <div>
                <div className="flex gap-1.5 text-amber-500 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4.5 h-4.5 fill-current" />)}
                </div>
                <p className="text-base text-slate-600 dark:text-slate-300 italic mb-8 leading-relaxed font-medium">
                  "Logging water and stress scores daily made me realize how dehydrated I was. My average sleep quality rose from 5 to 8 within two weeks of implementing the AI insights."
                </p>
              </div>
              <div className="flex items-center gap-4.5">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-500 text-sm">
                  AM
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Amanda Miller</h4>
                  <p className="text-3xs text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">Marketing Lead</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-10 rounded-[36px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between text-left min-h-[300px] hover:shadow-md transition-shadow">
              <div>
                <div className="flex gap-1.5 text-amber-500 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4.5 h-4.5 fill-current" />)}
                </div>
                <p className="text-base text-slate-600 dark:text-slate-300 italic mb-8 leading-relaxed font-medium">
                  "The PWA install is so snappy on iOS. I sync my active walking steps, and the automated email reports are extremely useful to show to my cardiologist."
                </p>
              </div>
              <div className="flex items-center gap-4.5">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center font-bold text-purple-500 text-sm">
                  DB
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">David Brooks</h4>
                  <p className="text-3xs text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">Software Architect</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-32 px-6 sm:px-10 lg:px-16">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 dark:text-slate-405 mt-4 text-sm font-semibold">
              Have questions about DailyHealth? Find the answers below.
            </p>
          </div>

          <div className="space-y-5">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-7 text-left focus:outline-none cursor-pointer"
                >
                  <span className="font-bold text-slate-950 dark:text-white text-sm sm:text-base">{faq.q}</span>
                  {activeFaq === index ? <ChevronDown className="w-5.5 h-5.5 text-slate-400" /> : <ChevronRight className="w-5.5 h-5.5 text-slate-400" />}
                </button>
                
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20"
                    >
                      <p className="p-7 text-sm text-slate-600 dark:text-slate-350 leading-relaxed text-left">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-800 text-white py-28 px-6 sm:px-10 lg:px-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <h2 className="text-4xl sm:text-5xl font-black">Ready to take control of your health?</h2>
          <p className="text-blue-100 max-w-xl mx-auto text-base">Start tracking your sleep, stress, activity, and goals with AI support today.</p>
          <div className="flex flex-col gap-4.5 items-center pt-4">
             {!isLoggedIn ? (
               <Link 
                 href="/auth?tab=register"
                 className="px-9 py-4.5 bg-slate-950 text-white font-black rounded-2xl hover:bg-slate-900 hover:scale-[1.02] transform active:scale-[0.98] transition-all duration-200 text-base shadow-xl border border-slate-800 w-full sm:w-auto inline-block text-center"
               >
                 Create Account
               </Link>
             ) : (
               <Link 
                 href="/dashboard"
                 className="px-9 py-4.5 bg-slate-950 text-white font-black rounded-2xl hover:bg-slate-900 hover:scale-[1.02] transform active:scale-[0.98] transition-all duration-200 text-base shadow-xl border border-slate-800 w-full sm:w-auto inline-block text-center"
               >
                 Go to Dashboard
               </Link>
             )}
             {!isInstalled && (
               <button 
                 onClick={handleInstallClick}
                 className="px-9 py-4 bg-white text-slate-900 font-extrabold rounded-2xl hover:bg-slate-50 hover:scale-[1.02] transform active:scale-[0.98] transition-all duration-200 text-sm shadow-md border border-slate-200 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto text-center"
               >
                 <Smartphone className="w-4 h-4 text-blue-500 animate-bounce" /> Download App
               </button>
             )}
           </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-20 px-6 sm:px-10 lg:px-16 border-t border-slate-850">
        <div className="max-w-8xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16 text-left">
          
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-xl">DailyHealth</span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs text-slate-500 font-semibold mt-2">
              Next-generation health portal providing metrics logs, calculated wellness indexes, and diagnostic insights.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-5">Navigations</h4>
            <ul className="space-y-4 text-xs font-bold">
              <li><Link href="#" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#statistics" className="hover:text-white transition-colors">Stats</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-5">Integrations</h4>
            <ul className="space-y-4 text-xs font-bold text-slate-550">
              <li><span className="hover:text-white cursor-default">Google Fit API</span></li>
              <li><span className="hover:text-white cursor-default">Apple HealthKit</span></li>
              <li><span className="hover:text-white cursor-default">Android Health Connect</span></li>
              <li><span className="hover:text-white cursor-default">Device Accelerometer</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-5">Support</h4>
            <p className="text-xs leading-relaxed text-slate-500 mb-4 font-semibold">For inquiries, support, or privacy questions, reach out to us at:</p>
            <p className="text-xs text-blue-400 font-bold hover:underline cursor-pointer">syahmiklegendry1121@gmail.com</p>
          </div>

        </div>

        <div className="max-w-8xl mx-auto border-t border-slate-800 pt-10 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600 gap-4">
          <p>© 2026 DailyHealth. All rights reserved. Created with Antigravity.</p>
          <div className="flex gap-6 font-semibold">
            <span className="hover:text-slate-350 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-355 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-350 cursor-pointer transition-colors">Cookie Policy</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
