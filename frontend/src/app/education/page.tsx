'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Heart, Activity, Moon, Droplet, Flame, Compass, Pill, ShieldAlert, 
  Award, TrendingUp, Sparkles, User, Settings, ArrowLeft, BookOpen, Clock, 
  UserCheck, ShieldCheck, HeartHandshake, Zap
} from 'lucide-react';
import { translations } from '@/utils/translations';

function EducationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const metric = searchParams.get('metric') || 'sleep';
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [appLanguage, setAppLanguage] = useState('en');

  // Sync theme and language settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
      const lang = localStorage.getItem('theme_lang') || 'en';
      setAppLanguage(lang);
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

  // Educational Data Dictionary
  const educationData: Record<string, {
    title: string;
    subtitle: string;
    icon: any;
    color: string;
    summary: string;
    stages?: { name: string; duration: string; details: string }[];
    patterns?: { range: string; population: string; status: string }[];
    recommendations: string[];
    faq: { q: string; a: string }[];
  }> = {
    sleep: {
      title: "Sleep Tracker & Sleep Cycle Stages",
      subtitle: "Optimize your body recovery, cognitive consolidation, and mental health.",
      icon: Moon,
      color: "text-purple-500 bg-purple-500/10 border-purple-200/50 dark:border-purple-900/40",
      summary: "Sleep is a vital biological process divided into repeating 90-to-110-minute cycles. Each cycle contains four distinct stages: three stages of Non-Rapid Eye Movement (NREM) sleep and one stage of Rapid Eye Movement (REM) sleep. Balancing these stages is critical for physiological repair and neurochemical rejuvenation.",
      stages: [
        { name: "Stage 1 (Light N1)", duration: "5% of night", details: "The transition period from wakefulness to sleep. Brain waves slow down, muscles relax, and heart rate drops. Easily awakened." },
        { name: "Stage 2 (Light N2)", duration: "45-50% of night", details: "Body temperature drops, heart rate slows further, and eye movements stop. Brain activity exhibits short bursts called sleep spindles." },
        { name: "Stage 3 (Deep N3)", duration: "15-20% of night", details: "Also known as slow-wave delta sleep. Critical for muscle repair, tissue growth, hormone release, and immune system rejuvenation." },
        { name: "Stage 4 (REM Sleep)", duration: "20-25% of night", details: "Brain activity increases to near-wakefulness levels. Rapid eye movements occur, dreams are vivid, and cognitive consolidation (memory storage) takes place." }
      ],
      patterns: [
        { range: "14 - 17 Hours", population: "Newborns (0-3 Months)", status: "Optimal / Biological Standard" },
        { range: "11 - 14 Hours", population: "Toddlers (1-2 Years)", status: "Optimal / Developmental Standard" },
        { range: "8 - 10 Hours", population: "Teenagers (14-17 Years)", status: "Optimal / Cognitive Development" },
        { range: "7 - 9 Hours", population: "Adults (18-64 Years)", status: "Optimal / Standard Health Target" },
        { range: "14+ Hours (Adults)", population: "Hypersomnia / Oversleeping", status: "Warning: Medical Check Required. Could indicate clinical depression, sleep apnea, or recovery fatigue." }
      ],
      recommendations: [
        "Maintain a consistent sleep schedule by waking up at the same time every day, including weekends.",
        "Ensure your bedroom is dark, quiet, and cool (around 65°F / 18°C) for optimal deep sleep cycles.",
        "Avoid blue light exposure from smartphones or computers at least 1 hour before bed.",
        "Limit caffeine consumption after 2:00 PM and avoid heavy meals before sleep."
      ],
      faq: [
        { q: "What does it mean if an adult sleeps 14 hours?", a: "Sleeping 14+ hours (oversleeping) as an adult can be a biological reaction to extreme sleep debt, or a symptom of medical conditions like hypersomnia, sleep apnea, thyroid issues, or clinical depression. Consult a primary care physician if this is recurring." },
        { q: "How many sleep cycles do I need per night?", a: "A healthy adult requires 5 to 6 full cycles (translating to 7.5 to 9 hours of sleep) to fully navigate light, deep, and REM sleep phases." }
      ]
    },
    steps: {
      title: "Step Tracker & Physical Activity Guidelines",
      subtitle: "Track physical movement, distance goals, and calorie expenditure metrics.",
      icon: Activity,
      color: "text-blue-500 bg-blue-500/10 border-blue-200/50 dark:border-blue-900/40",
      summary: "Walking is a low-impact aerobic exercise that enhances cardiovascular strength, controls weight, increases lung capacity, and releases mood-boosting endorphins. Active step targets reduce the risk of diabetes, stroke, and joint stiffness.",
      stages: [
        { name: "Stroll", duration: "Below 3 km/h", details: "Casual walking. Offers low cardiovascular stress, suitable for recovery, warm-ups, or elderly joint therapy." },
        { name: "Brisk Walk", duration: "4.5 - 6 km/h", details: "Active speed. Elevates heart rate to the aerobic zone, promoting calorie burning and respiratory health." },
        { name: "Power Walk", duration: "Above 6.5 km/h", details: "High-intensity pace. Engages core and upper body muscles, burning calories at a rate comparable to jogging." }
      ],
      patterns: [
        { range: "< 5,000 steps", population: "Sedentary lifestyle", status: "Warning: High risk of metabolic diseases" },
        { range: "5,000 - 7,499 steps", population: "Low active range", status: "Average / Baseline movement" },
        { range: "7,500 - 9,999 steps", population: "Somewhat active", status: "Good / Meets minimum health checks" },
        { range: "10,000+ steps", population: "Highly active", status: "Excellent / The gold standard target for cardiovascular health" }
      ],
      recommendations: [
        "Aim for a daily baseline of 10,000 steps to maintain optimal cardiovascular health.",
        "Break walking targets into shorter sessions, such as three 10-minute brisk walks during the day.",
        "Take the stairs instead of the elevator to naturally accumulate active step counts.",
        "Ensure you wear supportive, cushioned footwear to protect your ankle and knee joints."
      ],
      faq: [
        { q: "How many calories are burned per step?", a: "On average, a healthy individual burns about 0.04 calories per step. 10,000 steps burn approximately 400 active calories depending on pace, weight, and grade." },
        { q: "Does speed matter for step counts?", a: "Yes. Brisk walking (higher speeds) keeps your heart rate elevated in the active fat-burn zone longer, maximizing cardiovascular benefits." }
      ]
    },
    hydration: {
      title: "Hydration Tracker & Water Balance Index",
      subtitle: "Maintain cellular function, regulate body temperature, and clear biological waste.",
      icon: Droplet,
      color: "text-sky-500 bg-sky-500/10 border-sky-200/50 dark:border-sky-900/40",
      summary: "The human body is composed of approximately 60% water. Hydration governs everything from joint lubrication to brain function, food digestion, and skin health. Constant fluid balance prevents chronic fatigue and brain fog.",
      stages: [
        { name: "Optimal Balance", duration: "2 - 3 Liters/day", details: "Maintains clear/light yellow urine. Body is fully fueled, joints are lubricated, and digestion runs smoothly." },
        { name: "Mild Dehydration", duration: "1.5% water loss", details: "Triggers thirst response, dry mouth, dark urine, mild fatigue, and headache alerts." },
        { name: "Severe Dehydration", duration: "4%+ water loss", details: "Leads to dizziness, high heart rate, severe confusion, and heat exhaustion. Requires medical intervention." }
      ],
      patterns: [
        { range: "4 - 5 Glasses", population: "Under-hydrated", status: "Warning: Triggers kidney stress and headaches" },
        { range: "8 Glasses (2L)", population: "Average Adult baseline", status: "Optimal / Standard wellness target" },
        { range: "12+ Glasses (3L+)", population: "Athletes / Hot climates", status: "Optimal / Required for metabolic replacement" }
      ],
      recommendations: [
        "Drink a glass of warm water immediately upon waking to rehydrate your internal organs.",
        "Keep a reusable water bottle beside you throughout the day to remind you to take sips.",
        "Hydrate before, during, and after physical exercise to replenish lost sweat volume.",
        "Monitor your urine color: a pale yellow color indicates excellent hydration."
      ],
      faq: [
        { q: "Can you drink too much water?", a: "Yes. Drinking excessive amounts of water in a short period can lead to hyponatremia (water intoxication), diluting blood sodium. Stay within a steady 2-3.5L daily target." },
        { q: "Does coffee count towards hydration?", a: "While coffee acts as a mild diuretic, moderate consumption does contribute to your daily fluid intake, though pure water remains the ideal source." }
      ]
    },
    stress: {
      title: "Stress Index & Cortisol Management",
      subtitle: "Understand your sympathetic nervous system and reduce stress levels.",
      icon: Zap,
      color: "text-red-500 bg-red-500/10 border-red-200/50 dark:border-red-900/40",
      summary: "Stress triggers the release of cortisol and adrenaline. Under chronic stress, these hormones disrupt sleep quality, elevate blood pressure, impair metabolic control, and weaken immune system responses.",
      stages: [
        { name: "Relaxed (1-3)", duration: "Low Cortisol", details: "Parasympathetic system dominant. Clear thinking, stable heart rate, and high digestive efficiency." },
        { name: "Alert (4-6)", duration: "Moderate Cortisol", details: "Active focus. Natural during workouts or deep work, but shouldn't persist at night." },
        { name: "High Stress (7-10)", duration: "Chronic Cortisol", details: "Sympathetic system overload. Muscle tension, anxiety spikes, shallow breathing, and racing thoughts." }
      ],
      patterns: [
        { range: "Index 1 - 3", population: "Relaxed State", status: "Optimal / High energy recovery" },
        { range: "Index 4 - 6", population: "Managed stress", status: "Moderate / Normal daily activity" },
        { range: "Index 7 - 10", population: "Chronic anxiety", status: "Warning: High risk of exhaustion, sleep disorders, and hypertension" }
      ],
      recommendations: [
        "Practice 'Box Breathing' (inhale 4s, hold 4s, exhale 4s, hold 4s) to reset your nervous system.",
        "Incorporate at least 20 minutes of daily physical exercise to burn off excess cortisol.",
        "Allocate designated screen-free relaxation windows in the evenings.",
        "Track sleep patterns since poor sleep sleep hours directly double stress indexes."
      ],
      faq: [
        { q: "How is the stress score measured?", a: "Our portal tracks stress logs alongside heart rate variability (HRV) indicators. High HRV indicates relaxation, while low HRV points to physical/mental stress." },
        { q: "Can diet affect stress levels?", a: "Yes. Refined sugars and excessive caffeine cause blood glucose spikes and adrenaline releases, mimicking anxiety and elevating your stress index." }
      ]
    },
    heartRate: {
      title: "Heart Rate & Cardiovascular Target Zones",
      subtitle: "Understand resting pulse frequency and training zones.",
      icon: Heart,
      color: "text-rose-500 bg-rose-500/10 border-rose-200/50 dark:border-rose-900/40",
      summary: "Your heart rate (measured in beats per minute, or bpm) is a primary indicator of cardiovascular health. Resting heart rate tells you about your overall heart efficiency, while active heart rate zones define exercise intensity.",
      stages: [
        { name: "Resting (RHR)", duration: "60 - 100 bpm", details: "Normal baseline at rest. Efficient heart function results in lower numbers (athletes often measure 40-50 bpm)." },
        { name: "Aerobic Zone", duration: "60-80% of max HR", details: "Target for cardiovascular stamina, fat burn, and steady endurance training." },
        { name: "Anaerobic Zone", duration: "80-90% of max HR", details: "High-intensity training. Muscles produce lactic acid; improves peak athletic speed." }
      ],
      patterns: [
        { range: "< 50 bpm", population: "Athletes / Bradycardia", status: "Healthy / High cardiovascular efficiency" },
        { range: "60 - 100 bpm", population: "Average Adult population", status: "Optimal / Standard resting range" },
        { range: "100+ bpm (Resting)", population: "Tachycardia", status: "Warning: High stress, fever, dehydration, or potential cardiovascular issue" }
      ],
      recommendations: [
        "Measure your resting heart rate in the morning before getting out of bed for the most accurate baseline.",
        "Do 150 minutes of moderate-intensity aerobic exercise weekly to lower your long-term resting pulse.",
        "Stay hydrated to maintain healthy blood volume, keeping heart workload lower.",
        "Avoid nicotine and excessive alcohol, which artificially elevate resting bpm."
      ],
      faq: [
        { q: "How do I calculate my maximum heart rate?", a: "An approximate formula is: 220 minus your age. For a 30-year-old, the max heart rate is approximately 190 bpm." },
        { q: "When should I consult a doctor about resting heart rate?", a: "If your resting pulse consistently stays above 100 bpm (Tachycardia) or below 50 bpm when not an athlete (Bradycardia), seek medical advice." }
      ]
    },
    bloodSugar: {
      title: "Blood Sugar & Glycemic Index Ranges",
      subtitle: "Monitor glucose levels to manage diabetes and metabolic energy.",
      icon: Activity,
      color: "text-amber-500 bg-amber-500/10 border-amber-200/50 dark:border-amber-900/40",
      summary: "Blood glucose is the primary energy source for your body's cells. Insulin regulates these levels. Consistently high glucose levels damage blood vessels, kidneys, nerves, and heart tissue over time.",
      stages: [
        { name: "Fasting", duration: "Before eating", details: "Baseline check. Ideal values should sit under 100 mg/dL after 8 hours of fasting." },
        { name: "Post-Prandial", duration: "2 hours post-meal", details: "Spike measurement. Normal levels should return to under 140 mg/dL as insulin responds." },
        { name: "HbA1c", duration: "3-Month Average", details: "Long-term metabolic health marker. Below 5.7% is normal; 6.5%+ indicates diabetes." }
      ],
      patterns: [
        { range: "70 - 99 mg/dL", population: "Normal Fasting", status: "Optimal / Healthy insulin response" },
        { range: "100 - 125 mg/dL", population: "Pre-Diabetes Fasting", status: "Warning: Insulin resistance developing" },
        { range: "126+ mg/dL", population: "Diabetes Fasting", status: "Alert: Clinical management and medical consult required" }
      ],
      recommendations: [
        "Prioritize complex carbohydrates (vegetables, oats, whole grains) over simple sugars.",
        "Incorporate strength training and active steps: muscles burn glucose for fuel, improving insulin sensitivity.",
        "Avoid high-glycemic snacks before sleeping to prevent morning glucose spikes.",
        "Eat fiber-rich meals to slow down sugar absorption in the bloodstream."
      ],
      faq: [
        { q: "Why does stress elevate blood sugar?", a: "Stress releases cortisol and adrenaline, which signal the liver to release stored glucose into the blood to prepare for action, raising blood sugar levels." },
        { q: "What is a glycemic index (GI)?", a: "It is a rating system for foods showing how quickly they raise blood sugar. Low GI foods (<55) promote sustained energy and prevent insulin spikes." }
      ]
    },
    bloodPressure: {
      title: "Blood Pressure & Hypertension Classifications",
      subtitle: "Understand systolic vs diastolic forces to protect arterial health.",
      icon: TrendingUp,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-900/40",
      summary: "Blood pressure is the force of blood pushing against arterial walls. Systolic pressure (top number) measures force during heart contractions; Diastolic pressure (bottom number) measures pressure when the heart rests between beats.",
      stages: [
        { name: "Normal", duration: "Below 120/80", details: "Optimal arterial tension. Low risk of cardiovascular diseases." },
        { name: "Elevated", duration: "120-129 / <80", details: "Slight increase. Indicates need for lifestyle improvements to prevent hypertension." },
        { name: "Stage 1 Hypertension", duration: "130-139 / 80-89", details: "Arterial walls starting to harden. Regular checks and dietary adjustments required." },
        { name: "Stage 2 Hypertension", duration: "145+ / 90+", details: "Severe pressure. High risk of cardiovascular events; medical prescription recommended." }
      ],
      patterns: [
        { range: "< 120 / 80", population: "Normal range", status: "Optimal / Healthy arteries" },
        { range: "130/80 - 139/89", population: "Stage 1 Hypertension", status: "Warning: Heart workload is high" },
        { range: "140+/90+ (Resting)", population: "Stage 2 Hypertension", status: "Alert: High risk of heart attack, kidney damage, and stroke" }
      ],
      recommendations: [
        "Reduce daily sodium (salt) intake to less than 2,300 mg (about 1 teaspoon of salt).",
        "Eat a diet rich in potassium (bananas, spinach, avocados) to help relax blood vessels.",
        "Avoid smoking: nicotine immediately constricts arteries and raises blood pressure.",
        "Maintain a healthy weight to reduce load on your cardiovascular system."
      ],
      faq: [
        { q: "Why is high blood pressure called the 'silent killer'?", a: "Hypertension rarely presents noticeable physical symptoms until significant internal arterial damage has already occurred. Regular monitoring is the only way to detect it." },
        { q: "How long should I sit before taking a reading?", a: "Sit quietly for at least 5 minutes, keep both feet flat on the floor, and avoid talking during the reading for an accurate measurement." }
      ]
    },
    medication: {
      title: "Medication Adherence & Drug Safety",
      subtitle: "Consistently manage dosage plans, schedules, and clinical precautions.",
      icon: Pill,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-200/50 dark:border-indigo-900/40",
      summary: "Adhering to prescribed medication ensures consistent blood concentration levels of the drug, allowing clinical therapies to succeed. Missing doses or mixing meds incorrectly can lead to side effects or treatment failure.",
      stages: [
        { name: "Frequency", duration: "Once or multi-daily", details: "Taking pills at the same hours daily maintains therapeutic serum levels in the blood." },
        { name: "Absorption", duration: "With or without food", details: "Some drugs require dietary fats to absorb, while others bind to food particles and lose efficiency." },
        { name: "Contraindications", duration: "Drug interactions", details: "Avoid mixing medications that compound effects (e.g. blood thinners and aspirin) without physician supervision." }
      ],
      patterns: [
        { range: "100% Adherence", population: "Optimal recovery", status: "Optimal / Maximizes clinical success" },
        { range: "80% Adherence", population: "Marginal coverage", status: "Warning: Reduced effectiveness; seek consistency" },
        { range: "< 50% Adherence", population: "High risk of failure", status: "Alert: High risk of relapse or treatment failure" }
      ],
      recommendations: [
        "Use a physical pillbox or set digital alarms on your phone to build a consistent habit.",
        "Read patient leaflets carefully and verify if the medication should be taken with meals or on an empty stomach.",
        "Consult your pharmacist or physician before taking any new over-the-counter supplements.",
        "Never double your dose to make up for a missed one unless explicitly advised by a doctor."
      ],
      faq: [
        { q: "What should I do if I miss a dose?", a: "Take the missed dose as soon as you remember. If it is close to the time for your next dose, skip the missed dose and resume your regular schedule. Do not take a double dose." },
        { q: "Does grapefruit juice interact with medications?", a: "Yes. Grapefruit juice blocks enzymes needed to break down certain cholesterol-lowering drugs (statins) and blood pressure medications, leading to dangerously high levels of the drug in the body." }
      ]
    }
  };

  const activeData = educationData[metric] || educationData.sleep;
  const ActiveIcon = activeData.icon;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#060a13] transition-colors duration-300 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none dark:from-blue-900/15" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200 dark:border-slate-800 shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Heart className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-extrabold text-base bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">DailyHealth Edu</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-650 dark:text-slate-300 cursor-pointer text-xs font-bold"
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={() => router.push('/#directory')}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-855 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Close Tab
            </button>
          </div>
        </div>
      </header>

      {/* Main Educational Report */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-12 space-y-12 text-left">
        
        {/* Metric Introduction Header */}
        <div className={`p-8 rounded-[36px] bg-white dark:bg-slate-900 border-2 ${activeData.color} flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm`}>
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-950 shadow-md flex items-center justify-center flex-shrink-0 text-slate-900 dark:text-white">
            <ActiveIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">{activeData.title}</h1>
            <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 font-semibold mt-1">{activeData.subtitle}</p>
          </div>
        </div>

        {/* Core Summary Paragraph */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" /> Executive Overview
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-350 bg-white/40 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            {activeData.summary}
          </p>
        </section>

        {/* Stages of the Metric (if exists) */}
        {activeData.stages && (
          <section className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" /> Stages & Phases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeData.stages.map((stage, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-extrabold text-sm text-slate-950 dark:text-white">{stage.name}</span>
                      <span className="text-4xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded">{stage.duration}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{stage.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Patterns, Ranges & Demographics (e.g. 14 hours sleep range) */}
        {activeData.patterns && (
          <section className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-500" /> Ranges & Age Patterns
            </h2>
            <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-850">
                    <th className="p-4.5 font-extrabold text-slate-500 uppercase">Target Range / Duration</th>
                    <th className="p-4.5 font-extrabold text-slate-500 uppercase">Target Group / Age Bracket</th>
                    <th className="p-4.5 font-extrabold text-slate-500 uppercase">Medical Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-850 font-semibold">
                  {activeData.patterns.map((pat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                      <td className="p-4.5 font-black text-slate-950 dark:text-white">{pat.range}</td>
                      <td className="p-4.5 text-slate-600 dark:text-slate-355">{pat.population}</td>
                      <td className="p-4.5">
                        <span className={`text-4xs px-2.5 py-1 rounded-full font-bold uppercase ${
                          pat.status.includes('Warning') || pat.status.includes('Alert') 
                            ? 'bg-red-500/10 text-red-500' 
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {pat.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Clinical Recommendations */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-rose-500" /> Medical & Wellness Guidelines
          </h2>
          <ul className="space-y-3.5">
            {activeData.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed text-slate-655 dark:text-slate-350 font-medium">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0 font-bold mt-0.5">{idx + 1}</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Metric FAQs */}
        <section className="space-y-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-500" /> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {activeData.faq.map((faq, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-2">
                <h4 className="font-extrabold text-sm text-slate-950 dark:text-white">Q: {faq.q}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-500 text-xs border-t border-slate-850 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© 2026 DailyHealth Monitoring. All guidelines compiled from standard clinical datasets.</span>
          <button onClick={() => router.push('/#directory')} className="text-blue-400 hover:underline font-bold">Close Window</button>
        </div>
      </footer>
    </div>
  );
}

export default function EducationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#060a13] text-slate-450 text-xs font-bold">
        Loading educational data...
      </div>
    }>
      <EducationContent />
    </Suspense>
  );
}
