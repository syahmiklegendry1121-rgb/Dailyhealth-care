'use client';

import React, { useState } from 'react';
import { X, Moon, Smile, Droplet, Flame, Heart, Pill, ShieldAlert, Award } from 'lucide-react';
import { submitHealthLog } from '@/utils/api';

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedData: any, insights: string[]) => void;
  initialData?: any;
}

export default function QuestionnaireModal({ isOpen, onClose, onSuccess, initialData }: QuestionnaireModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [sleepTime, setSleepTime] = useState(initialData?.sleep?.sleepTime || '23:00');
  const [wakeTime, setWakeTime] = useState(initialData?.sleep?.wakeTime || '07:00');
  const [sleepDuration, setSleepDuration] = useState(initialData?.sleep?.duration || 8);
  const [sleepQuality, setSleepQuality] = useState(initialData?.sleep?.quality || 7);

  const [stressLevel, setStressLevel] = useState(initialData?.stress?.level || 4);
  const [anxiety, setAnxiety] = useState(initialData?.stress?.anxiety || 3);
  const [happiness, setHappiness] = useState(initialData?.stress?.happiness || 7);
  const [energy, setEnergy] = useState(initialData?.stress?.energy || 7);
  const [focus, setFocus] = useState(initialData?.stress?.focus || 7);
  const [productivity, setProductivity] = useState(initialData?.stress?.productivity || 7);

  const [moodEmoji, setMoodEmoji] = useState(initialData?.mood?.emoji || '😐');

  const [waterGlasses, setWaterGlasses] = useState<number>(initialData?.water?.glasses || 4);

  const [breakfast, setBreakfast] = useState(initialData?.food?.breakfast || '');
  const [lunch, setLunch] = useState(initialData?.food?.lunch || '');
  const [dinner, setDinner] = useState(initialData?.food?.dinner || '');
  const [snacks, setSnacks] = useState(initialData?.food?.snacks || '');
  const [foodCalories, setFoodCalories] = useState(initialData?.food?.calories || 2000);
  const [foodProtein, setFoodProtein] = useState(initialData?.food?.protein || 60);
  const [foodCarbs, setFoodCarbs] = useState(initialData?.food?.carbs || 250);
  const [foodFat, setFoodFat] = useState(initialData?.food?.fat || 70);
  const [foodSugar, setFoodSugar] = useState(initialData?.food?.sugar || 40);
  const [foodFiber, setFoodFiber] = useState(initialData?.food?.fiber || 25);
  const [foodHasJunk, setFoodHasJunk] = useState(initialData?.food?.hasJunk || false);
  const [foodHasHealthy, setFoodHasHealthy] = useState(initialData?.food?.hasHealthy || true);

  const [workoutToday, setWorkoutToday] = useState(initialData?.exercise?.workoutToday || false);
  const [workoutType, setWorkoutType] = useState(initialData?.exercise?.type || 'Walking');
  const [workoutDuration, setWorkoutDuration] = useState(initialData?.exercise?.duration || 30);
  const [workoutCalories, setWorkoutCalories] = useState(initialData?.exercise?.caloriesBurned || 150);

  const [weight, setWeight] = useState(initialData?.weight || 75);
  const [bmi, setBmi] = useState(initialData?.bmi || 23.1);
  const [bodyFat, setBodyFat] = useState(initialData?.bodyFat || 18.5);

  const [heartRate, setHeartRate] = useState(initialData?.heartRate?.bpm || 72);
  const [bpSystolic, setBpSystolic] = useState(initialData?.bloodPressure?.systolic || 120);
  const [bpDiastolic, setBpDiastolic] = useState(initialData?.bloodPressure?.diastolic || 80);
  const [bloodSugar, setBloodSugar] = useState(initialData?.bloodSugar?.level || 90);

  const [medsTaken, setMedsTaken] = useState(initialData?.medication?.taken || true);
  const [medsNotes, setMedsNotes] = useState(initialData?.medication?.notes || '');

  const [symptomHeadache, setSymptomHeadache] = useState(initialData?.symptom?.headache || false);
  const [symptomCold, setSymptomCold] = useState(initialData?.symptom?.cold || false);
  const [symptomFever, setSymptomFever] = useState(initialData?.symptom?.fever || false);
  const [symptomPain, setSymptomPain] = useState(initialData?.symptom?.pain || false);
  const [symptomFatigue, setSymptomFatigue] = useState(initialData?.symptom?.fatigue || false);
  const [symptomOther, setSymptomOther] = useState(initialData?.symptom?.other || '');

  if (!isOpen) return null;

  const handleNext = () => setStep(s => Math.min(s + 1, 6));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      
      const payload = {
        date: todayDate,
        sleep: {
          sleepTime,
          wakeTime,
          duration: Number(sleepDuration),
          quality: Number(sleepQuality)
        },
        stress: {
          level: Number(stressLevel),
          anxiety: Number(anxiety),
          happiness: Number(happiness),
          energy: Number(energy),
          focus: Number(focus),
          productivity: Number(productivity)
        },
        mood: {
          emoji: moodEmoji
        },
        water: {
          glasses: Number(waterGlasses)
        },
        food: {
          breakfast,
          lunch,
          dinner,
          snacks,
          hasJunk: foodHasJunk,
          hasHealthy: foodHasHealthy,
          calories: Number(foodCalories),
          protein: Number(foodProtein),
          carbs: Number(foodCarbs),
          fat: Number(foodFat),
          sugar: Number(foodSugar),
          fiber: Number(foodFiber)
        },
        exercise: {
          workoutToday,
          type: workoutToday ? workoutType : null,
          duration: workoutToday ? Number(workoutDuration) : 0,
          caloriesBurned: workoutToday ? Number(workoutCalories) : 0
        },
        steps: {
          count: workoutToday && workoutType === 'Walking' ? Math.round(workoutDuration * 110) : 0,
          distance: workoutToday && workoutType === 'Walking' ? parseFloat((workoutDuration * 0.08).toFixed(2)) : 0.0,
          activeMinutes: workoutToday ? Number(workoutDuration) : 0,
          caloriesBurned: workoutToday ? Number(workoutCalories) : 0
        },
        heartRate: {
          bpm: Number(heartRate),
          source: 'manual'
        },
        bloodPressure: {
          systolic: Number(bpSystolic),
          diastolic: Number(bpDiastolic)
        },
        bloodSugar: {
          level: Number(bloodSugar)
        },
        medication: {
          taken: medsTaken,
          notes: medsNotes
        },
        symptom: {
          headache: symptomHeadache,
          cold: symptomCold,
          fever: symptomFever,
          pain: symptomPain,
          fatigue: symptomFatigue,
          other: symptomOther
        }
      };

      const res = await submitHealthLog(payload);
      onSuccess(res.data, res.insights);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit health log.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/80">
          <div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" />
              Daily Wellness Assessment
            </h3>
            <p className="text-2xs text-slate-400 mt-0.5">Step {step} of 6 — Fill details to calculate today's score</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-450 dark:text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
            {error}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* STEP 1: SLEEP & MOOD */}
          {step === 1 && (
            <div className="space-y-6 text-left">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-500" /> 1. Sleep & Daily Mood
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-2">Went to Sleep</label>
                  <input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-2">Woke Up</label>
                  <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="w-full glass-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-2">Sleep Duration (Hours)</label>
                  <input type="number" min="0" max="24" step="0.5" value={sleepDuration} onChange={(e) => setSleepDuration(Number(e.target.value))} className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-2">Sleep Quality (1 - 10)</label>
                  <input type="range" min="1" max="10" value={sleepQuality} onChange={(e) => setSleepQuality(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                  <span className="text-xs text-slate-550 dark:text-slate-400 font-bold block mt-1">{sleepQuality}/10</span>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              <div>
                <label className="block text-2xs font-bold text-slate-450 uppercase mb-3">Overall Mood Today</label>
                <div className="flex gap-4 justify-between">
                  {['😀', '😐', '😞', '😡', '😴'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setMoodEmoji(emoji)}
                      className={`text-3xl p-3 rounded-2xl border transition-all ${moodEmoji === emoji ? 'border-blue-500 bg-blue-500/10 scale-110 shadow-md' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STRESS & MENTAL HEALTH */}
          {step === 2 && (
            <div className="space-y-6 text-left">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Smile className="w-5 h-5 text-yellow-500" /> 2. Stress & Mental Wellness
              </h4>

              <div>
                <label className="block text-2xs font-bold text-slate-450 uppercase mb-2">Stress Level (1 - 10)</label>
                <input type="range" min="1" max="10" value={stressLevel} onChange={(e) => setStressLevel(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500" />
                <span className="text-xs text-slate-550 dark:text-slate-400 font-bold block mt-1">{stressLevel}/10 (1: calm, 10: severe stress)</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-2">Anxiety Level (1 - 10)</label>
                  <input type="range" min="1" max="10" value={anxiety} onChange={(e) => setAnxiety(Number(e.target.value))} className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                  <span className="text-xs text-slate-550 dark:text-slate-400 font-bold block mt-1">{anxiety}/10</span>
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-2">Happiness Level (1 - 10)</label>
                  <input type="range" min="1" max="10" value={happiness} onChange={(e) => setHappiness(Number(e.target.value))} className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                  <span className="text-xs text-slate-550 dark:text-slate-400 font-bold block mt-1">{happiness}/10</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Energy (1-10)</label>
                  <input type="number" min="1" max="10" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Focus (1-10)</label>
                  <input type="number" min="1" max="10" value={focus} onChange={(e) => setFocus(Number(e.target.value))} className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Productivity (1-10)</label>
                  <input type="number" min="1" max="10" value={productivity} onChange={(e) => setProductivity(Number(e.target.value))} className="w-full glass-input" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: NUTRITION & HYDRATION */}
          {step === 3 && (
            <div className="space-y-6 text-left">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Droplet className="w-5 h-5 text-sky-500" /> 3. Nutrition & Hydration
              </h4>

              <div>
                <label className="block text-2xs font-bold text-slate-450 uppercase mb-2">Water Intake (Glasses of Water)</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setWaterGlasses(g => Math.max(0, g - 1))} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700">-</button>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white w-12 text-center">{waterGlasses}</span>
                  <button type="button" onClick={() => setWaterGlasses(g => g + 1)} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700">+</button>
                  <span className="text-xs text-slate-400">Target is 8 glasses (approx 2 Litres)</span>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Breakfast</label>
                  <input type="text" placeholder="e.g. Oatmeal & Eggs" value={breakfast} onChange={(e) => setBreakfast(e.target.value)} className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Lunch</label>
                  <input type="text" placeholder="e.g. Chicken & Rice" value={lunch} onChange={(e) => setLunch(e.target.value)} className="w-full glass-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Dinner</label>
                  <input type="text" placeholder="e.g. Salmon & Salad" value={dinner} onChange={(e) => setDinner(e.target.value)} className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Snacks</label>
                  <input type="text" placeholder="e.g. Nuts or Protein shake" value={snacks} onChange={(e) => setSnacks(e.target.value)} className="w-full glass-input" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Calories (kcal)</label>
                  <input type="number" value={foodCalories} onChange={(e) => setFoodCalories(Number(e.target.value))} className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Protein (g)</label>
                  <input type="number" value={foodProtein} onChange={(e) => setFoodProtein(Number(e.target.value))} className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Carbohydrates (g)</label>
                  <input type="number" value={foodCarbs} onChange={(e) => setFoodCarbs(Number(e.target.value))} className="w-full glass-input" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Fats (g)</label>
                  <input type="number" value={foodFat} onChange={(e) => setFoodFat(Number(e.target.value))} className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Sugar (g)</label>
                  <input type="number" value={foodSugar} onChange={(e) => setFoodSugar(Number(e.target.value))} className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Fiber (g)</label>
                  <input type="number" value={foodFiber} onChange={(e) => setFoodFiber(Number(e.target.value))} className="w-full glass-input" />
                </div>
              </div>

              <div className="flex gap-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-350">
                  <input type="checkbox" checked={foodHasHealthy} onChange={(e) => setFoodHasHealthy(e.target.checked)} className="rounded border-slate-300 dark:border-slate-800 text-blue-500 focus:ring-blue-500 h-4.5 w-4.5" />
                  Contains Healthy Options
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-350">
                  <input type="checkbox" checked={foodHasJunk} onChange={(e) => setFoodHasJunk(e.target.checked)} className="rounded border-slate-300 dark:border-slate-800 text-red-500 focus:ring-red-500 h-4.5 w-4.5" />
                  Had Junk/Fast Food
                </label>
              </div>

            </div>
          )}

          {/* STEP 4: EXERCISE & WEIGHT */}
          {step === 4 && (
            <div className="space-y-6 text-left">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" /> 4. Physical Exercise & Weight
              </h4>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Did you workout today?</span>
                  <p className="text-2xs text-slate-400">Gym, running, walk, stretching, cycling, etc.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={workoutToday} 
                  onChange={(e) => setWorkoutToday(e.target.checked)} 
                  className="rounded border-slate-300 dark:border-slate-800 text-blue-500 focus:ring-blue-500 h-5 w-5 cursor-pointer"
                />
              </div>

              {workoutToday && (
                <div className="grid grid-cols-3 gap-4 border border-blue-500/10 p-5 rounded-2xl bg-blue-500/5">
                  <div>
                    <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Workout Type</label>
                    <select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)} className="w-full glass-input">
                      <option>Running</option>
                      <option>Walking</option>
                      <option>Cycling</option>
                      <option>Gym</option>
                      <option>Yoga</option>
                      <option>Stretching</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Duration (mins)</label>
                    <input type="number" value={workoutDuration} onChange={(e) => setWorkoutDuration(Number(e.target.value))} className="w-full glass-input" />
                  </div>
                  <div>
                    <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Calories Burned</label>
                    <input type="number" value={workoutCalories} onChange={(e) => setWorkoutCalories(Number(e.target.value))} className="w-full glass-input" />
                  </div>
                </div>
              )}

              <hr className="border-slate-200 dark:border-slate-800" />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Weight (kg)</label>
                  <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">BMI</label>
                  <input type="number" step="0.1" value={bmi} onChange={(e) => setBmi(Number(e.target.value))} className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Body Fat %</label>
                  <input type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(Number(e.target.value))} className="w-full glass-input" />
                </div>
              </div>

            </div>
          )}

          {/* STEP 5: CLINICAL VITALS */}
          {step === 5 && (
            <div className="space-y-6 text-left">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> 5. Clinical Vitals
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Resting Heart Rate (bpm)</label>
                  <input type="number" value={heartRate} onChange={(e) => setHeartRate(Number(e.target.value))} className="w-full glass-input" />
                  <span className="text-3xs text-slate-400 mt-1 block">Norm: 60 - 90 bpm</span>
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Blood Sugar (mg/dL)</label>
                  <input type="number" value={bloodSugar} onChange={(e) => setBloodSugar(Number(e.target.value))} className="w-full glass-input" />
                  <span className="text-3xs text-slate-400 mt-1 block">Fasting normal: 70 - 100 mg/dL</span>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-450 uppercase mb-2">Blood Pressure (mmHg)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input type="number" placeholder="Systolic (e.g. 120)" value={bpSystolic} onChange={(e) => setBpSystolic(Number(e.target.value))} className="w-full glass-input" />
                    <span className="text-3xs text-slate-450 mt-1 block">Systolic (Normal &lt; 130)</span>
                  </div>
                  <div>
                    <input type="number" placeholder="Diastolic (e.g. 80)" value={bpDiastolic} onChange={(e) => setBpDiastolic(Number(e.target.value))} className="w-full glass-input" />
                    <span className="text-3xs text-slate-450 mt-1 block">Diastolic (Normal &lt; 85)</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 6: MEDICATION & SYMPTOMS */}
          {step === 6 && (
            <div className="space-y-6 text-left">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-500" /> 6. Medication & Symptoms
              </h4>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Did you take your medicines today?</span>
                  <p className="text-2xs text-slate-400">Select Yes if you completed your prescribed medications.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={medsTaken} 
                  onChange={(e) => setMedsTaken(e.target.checked)} 
                  className="rounded border-slate-300 dark:border-slate-800 text-blue-500 focus:ring-blue-500 h-5 w-5 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Medicine/supplement details</label>
                <textarea 
                  placeholder="e.g. Vitamin D3, allergy prescription, daily multivitamin" 
                  value={medsNotes} 
                  onChange={(e) => setMedsNotes(e.target.value)} 
                  className="w-full glass-input h-20 resize-none"
                />
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              <div>
                <label className="block text-2xs font-bold text-slate-450 uppercase mb-3 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  Are you experiencing any symptoms today?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Headache', val: symptomHeadache, set: setSymptomHeadache },
                    { label: 'Cold / Runny Nose', val: symptomCold, set: setSymptomCold },
                    { label: 'Fever / Chills', val: symptomFever, set: setSymptomFever },
                    { label: 'Muscle Pain', val: symptomPain, set: setSymptomPain },
                    { label: 'Fatigue / Weakness', val: symptomFatigue, set: setSymptomFatigue }
                  ].map((sympt) => (
                    <label key={sympt.label} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${sympt.val ? 'border-red-500 bg-red-500/5 text-red-700 dark:text-red-400' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'}`}>
                      <input type="checkbox" checked={sympt.val} onChange={(e) => sympt.set(e.target.checked)} className="rounded border-slate-350 dark:border-slate-850 focus:ring-red-500 text-red-500 h-4.5 w-4.5 cursor-pointer" />
                      {sympt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-450 uppercase mb-1.5">Other Symptom Notes</label>
                <input type="text" placeholder="e.g. Mild throat itchiness" value={symptomOther} onChange={(e) => setSymptomOther(e.target.value)} className="w-full glass-input" />
              </div>

            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between bg-slate-50 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1 || loading}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold disabled:opacity-40 disabled:hover:bg-transparent transition-all"
          >
            Previous
          </button>
          
          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 transition-all"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Submit Report'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
