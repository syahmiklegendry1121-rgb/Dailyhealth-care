'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, KeyRound, Download, Trash2, RefreshCw, Sun, Moon, ToggleLeft, ToggleRight
} from 'lucide-react';
import { 
  getSettings, updateSettings, changePassword, exportUserData, deleteUserAccount 
} from '@/utils/api';

export default function SettingsTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
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
      // Use application/octet-stream to force browser file-save dialog instead of previewing JSON as text
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health_data_export_${new Date().toISOString().split('T')[0]}.json`;
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
                Export Full Health Profile (JSON)
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
