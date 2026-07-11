'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, KeyRound, Download, Trash2, RefreshCw, Sun, Moon, ToggleLeft, ToggleRight
} from 'lucide-react';
import { 
  getSettings, updateSettings, changePassword, exportUserData, deleteUserAccount 
} from '@/utils/api';

interface SettingsTabProps {
  onLanguageChange?: (lang: string) => void;
}

export default function SettingsTab({ onLanguageChange }: SettingsTabProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [luxuryMono, setLuxuryMono] = useState(false);
  const [privacySettings, setPrivacySettings] = useState('private');
  const [notificationSettings, setNotificationSettings] = useState('all');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  const fetchSettingsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getSettings();
      setDarkMode(s.darkMode);
      setLanguage(s.language || 'en');
      setPrivacySettings(s.privacySettings || 'private');
      setNotificationSettings(s.notificationSettings || 'all');
      
      const isMono = localStorage.getItem('theme_luxury_mono') === 'true';
      setLuxuryMono(isMono);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to retrieve application settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const handleUpdateSettings = async (field: string, val: any) => {
    setError(null);
    setSuccess(null);
    
    // Optimistic UI updates
    let updatedDarkMode = darkMode;
    let updatedLanguage = language;
    let updatedPrivacy = privacySettings;
    let updatedNotifs = notificationSettings;

    if (field === 'darkMode') {
      updatedDarkMode = val;
      setDarkMode(val);
      // Toggle CSS class
      if (val) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } else if (field === 'language') {
      updatedLanguage = val;
      setLanguage(val);
      if (onLanguageChange) {
        onLanguageChange(val);
      }
    } else if (field === 'privacySettings') {
      updatedPrivacy = val;
      setPrivacySettings(val);
    } else if (field === 'notificationSettings') {
      updatedNotifs = val;
      setNotificationSettings(val);
    }

    try {
      await updateSettings({
        darkMode: updatedDarkMode,
        language: updatedLanguage,
        privacySettings: updatedPrivacy,
        notificationSettings: updatedNotifs
      });
      setSuccess('Settings updated successfully.');
      
      if (field === 'language') {
        const { setLanguageCookie } = await import('@/utils/translations');
        setLanguageCookie(updatedLanguage);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPassSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportUserData();
      
      let stepsTarget = 10000;
      let waterTarget = 8;
      let sleepTarget = 8;
      let caloriesTarget = 2200;
      let bloodGroup = 'N/A';
      let doctor = 'None';
      let allergiesInfo = 'None';

      if (data.goals) {
        try {
          const parsed = JSON.parse(data.goals);
          if (parsed.steps) stepsTarget = parsed.steps;
          if (parsed.water) waterTarget = parsed.water;
          if (parsed.sleep) sleepTarget = parsed.sleep;
          if (parsed.calories) caloriesTarget = parsed.calories;
          if (parsed.bloodType) bloodGroup = parsed.bloodType;
          if (parsed.primaryDoctor) doctor = parsed.primaryDoctor;
          if (parsed.allergies) allergiesInfo = parsed.allergies;
        } catch (e) {
          console.warn(e);
        }
      }

      let report = `==================================================\n`;
      report += `      DAILYHEALTH PROFILE & WELLNESS REPORT\n`;
      report += `==================================================\n`;
      report += `Generated on: ${new Date().toLocaleString('en-US')}\n\n`;

      report += `--------------------------------------------------\n`;
      report += `1. PERSONAL PROFILE\n`;
      report += `--------------------------------------------------\n`;
      report += `Name: ${data.name || 'N/A'}\n`;
      report += `Email: ${data.email || 'N/A'}\n`;
      report += `Age: ${data.age ? data.age + ' years' : 'N/A'}\n`;
      report += `Gender: ${data.gender || 'N/A'}\n`;
      report += `Height: ${data.height ? data.height + ' cm' : 'N/A'}\n`;
      report += `Weight: ${data.weight ? data.weight + ' kg' : 'N/A'}\n`;
      report += `Blood Group: ${bloodGroup}\n`;
      report += `Primary Physician: ${doctor}\n`;
      report += `Emergency Contact: ${data.emergencyContact || 'None'}\n\n`;

      report += `--------------------------------------------------\n`;
      report += `2. MEDICAL CONDITIONS & NOTES\n`;
      report += `--------------------------------------------------\n`;
      report += `Medical Notes: ${data.medicalNotes || 'No chronic conditions recorded.'}\n`;
      report += `Allergies / Intolerances: ${allergiesInfo}\n\n`;

      report += `--------------------------------------------------\n`;
      report += `3. DAILY WELLNESS TARGETS\n`;
      report += `--------------------------------------------------\n`;
      report += `Target Steps: ${stepsTarget.toLocaleString()} steps/day\n`;
      report += `Target Hydration: ${waterTarget} glasses/day\n`;
      report += `Target Sleep: ${sleepTarget} hours/night\n`;
      report += `Target Calories: ${caloriesTarget} kcal/day\n\n`;

      report += `--------------------------------------------------\n`;
      report += `4. RECENT HEALTH LOGS HISTORY\n`;
      report += `--------------------------------------------------\n`;
      
      const logs = data.healthLogs || [];
      if (logs.length === 0) {
        report += `No daily health logs found in history.\n`;
      } else {
        const sortedLogs = [...logs].sort((x: any, y: any) => y.date.localeCompare(x.date));
        sortedLogs.forEach((log: any) => {
          report += `- Date: ${log.date}\n`;
          if (log.steps) {
            report += `  Steps: ${log.steps.count.toLocaleString()} steps (${log.steps.distance} km)\n`;
          }
          if (log.sleep) {
            report += `  Sleep: ${log.sleep.duration} hours (Quality: ${log.sleep.quality}/10)\n`;
          }
          if (log.water) {
            report += `  Water: ${log.water.glasses} glasses\n`;
          }
          if (log.stress) {
            report += `  Stress Level: ${log.stress.level}/10 (Energy: ${log.stress.energy}/10, Focus: ${log.stress.focus}/10)\n`;
          }
          if (log.heartRate) {
            report += `  Heart Rate: ${log.heartRate.bpm} bpm\n`;
          }
          if (log.bloodPressure) {
            report += `  Blood Pressure: ${log.bloodPressure.systolic}/${log.bloodPressure.diastolic} mmHg\n`;
          }
          if (log.bloodSugar) {
            report += `  Blood Sugar: ${log.bloodSugar.level} mg/dL\n`;
          }
          if (log.medication) {
            report += `  Medication: ${log.medication.taken ? 'Taken' : 'Not Taken'} (${log.medication.notes || 'No notes'})\n`;
          }
          if (log.symptom) {
            const symptoms = [];
            if (log.symptom.headache) symptoms.push('Headache');
            if (log.symptom.cold) symptoms.push('Cold/Flu');
            if (log.symptom.fever) symptoms.push('Fever');
            if (log.symptom.pain) symptoms.push('Muscle Pain');
            if (log.symptom.fatigue) symptoms.push('Fatigue');
            if (log.symptom.other) symptoms.push(log.symptom.other);
            report += `  Symptoms: ${symptoms.length > 0 ? symptoms.join(', ') : 'None'}\n`;
          }
          if (log.healthScore) {
            report += `  Daily Health Index: ${log.healthScore.score}/100 (${log.healthScore.rating})\n`;
          }
          report += `\n`;
        });
      }

      report += `==================================================\n`;
      report += `Report compiled by DailyHealth AI Wellness Assistant.\n`;
      report += `==================================================\n`;

      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health_profile_report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to export user records.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you absolutely sure you want to delete your account? This action is permanent and will purge all your historical health logs, clinical details, and profile data.')) {
      return;
    }

    try {
      await deleteUserAccount();
      localStorage.clear();
      router.push('/auth');
    } catch (err: any) {
      alert(err.message || 'Failed to delete account.');
    }
  };

  const toggleLuxuryMono = (val: boolean) => {
    setLuxuryMono(val);
    if (typeof window !== 'undefined') {
      if (val) {
        document.documentElement.classList.add('luxury-monochromatic');
        localStorage.setItem('theme_luxury_mono', 'true');
        // Force dark mode theme
        handleUpdateSettings('darkMode', true);
      } else {
        document.documentElement.classList.remove('luxury-monochromatic');
        localStorage.setItem('theme_luxury_mono', 'false');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-xs">Loading preferences configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      
      <div className="bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-250 dark:border-slate-800">
        <h3 className="font-extrabold text-slate-950 dark:text-white text-base">Application Preferences</h3>
        <p className="text-xs text-slate-400">Configure theme modes, security overrides, and database operations</p>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-455 text-xs">
          {success}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Toggles & Preferences */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h4 className="font-extrabold text-slate-950 dark:text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-blue-500" />
              General Preferences
            </h4>

            {/* Dark Mode toggle */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white">Dark Mode Theme</span>
                <p className="text-3xs text-slate-400">Toggle dark styling across panels</p>
              </div>
              <button 
                type="button"
                onClick={() => handleUpdateSettings('darkMode', !darkMode)}
                className="text-slate-650 hover:scale-105 transition-transform"
              >
                {darkMode ? <ToggleRight className="w-9 h-9 text-blue-500 fill-current" /> : <ToggleLeft className="w-9 h-9 text-slate-350" />}
              </button>
            </div>

            {/* Luxurious Monochromatic Theme Toggle Card */}
            <div 
              className={`p-6 rounded-[24px] flex justify-between items-center relative overflow-hidden transition-all duration-300 animate-float-glass mb-4
                ${luxuryMono 
                  ? 'bg-black/90 border-white/20' 
                  : 'bg-white/10 dark:bg-white/5 border-slate-200 dark:border-slate-800'
                }
              `}
              style={{
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderWidth: '1px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.3)',
              }}
            >
              {/* Card shine overlay */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.05))',
                }}
              />
              
              <div className="z-10 text-left">
                <span className={`font-bold text-xs transition-colors duration-300 ${luxuryMono ? 'text-[#F5F5F5]' : 'text-slate-900 dark:text-white'}`}>
                  Luxurious Monochromatic Mode
                </span>
                <p className={`text-3xs transition-colors duration-300 mt-1 ${luxuryMono ? 'text-[#B0B0B0]' : 'text-slate-450'}`}>
                  Apply a premium high-contrast monochromatic overlay with macOS glassmorphism styling
                </p>
              </div>

              <div className="z-10">
                <button
                  type="button"
                  onClick={() => toggleLuxuryMono(!luxuryMono)}
                  className={`relative w-14 h-7 rounded-full p-0.5 transition-all duration-300 ease-in-out cursor-pointer flex items-center select-none border
                    ${luxuryMono 
                      ? 'bg-white/25 border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.4)]' 
                      : 'bg-black/20 dark:bg-white/5 border-slate-300 dark:border-white/10'
                    }
                  `}
                  style={{
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                  }}
                >
                  {/* Toggle shine layer */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-60 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.05))',
                    }}
                  />

                  {/* Slider pill */}
                  <div
                    className={`w-5 h-5 rounded-full transition-all duration-300 ease-out relative overflow-hidden flex items-center justify-center
                      ${luxuryMono ? 'translate-x-7 bg-white/95 shadow-[0_1px_6px_rgba(255,255,255,0.8)]' : 'translate-x-0.5 bg-slate-400 dark:bg-white/30'}
                    `}
                    style={{
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), 0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  >
                    {/* Reflective highlight line */}
                    {luxuryMono && (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/70 to-transparent transform -skew-x-20 animate-shine-glow" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white">Language Selection</span>
                <p className="text-3xs text-slate-400">Preferred content writing layout</p>
              </div>
              <select 
                value={language} 
                onChange={(e) => handleUpdateSettings('language', e.target.value)} 
                className="glass-input text-2xs py-1 px-2.5 font-bold"
              >
                <option value="en">English (US)</option>
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
            </div>

            {/* Privacy selection */}
            <div className="flex justify-between items-center py-2">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white">Cloud Privacy Settings</span>
                <p className="text-3xs text-slate-400">Biological diagnostics reports visibility</p>
              </div>
              <select 
                value={privacySettings} 
                onChange={(e) => handleUpdateSettings('privacySettings', e.target.value)} 
                className="glass-input text-2xs py-1 px-2.5 font-bold"
              >
                <option value="private">Strictly Private</option>
                <option value="medical-only">Share with Doctors</option>
                <option value="anonymous-aggregate">Anonymous Audit</option>
              </select>
            </div>
          </div>

          {/* Backup & Purge Panel */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-950 dark:text-white text-xs uppercase tracking-wide">Data Administration</h4>
            
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleExportData}
                className="w-full py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-blue-500" />
                Export Full Health Profile (English Report)
              </button>
              
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full py-3 border border-red-200 dark:border-red-950 hover:bg-red-500/10 text-red-500 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                Delete My Account Permanently
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Password Management */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-slate-950 dark:text-white text-xs uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-purple-500" />
                Security Credentials
              </h4>

              {passSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-450 text-xs mb-4">
                  {passSuccess}
                </div>
              )}

              {passError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs mb-4">
                  {passError}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-3xs font-bold text-slate-450 uppercase mb-1.5">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    className="w-full glass-input text-xs" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-3xs font-bold text-slate-450 uppercase mb-1.5">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="w-full glass-input text-xs" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-3xs font-bold text-slate-450 uppercase mb-1.5">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="w-full glass-input text-xs" 
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  {passLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Modify Password'}
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
