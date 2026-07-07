'use client';

import React, { useState, useEffect } from 'react';
import { User, ShieldAlert, Award, RefreshCw, FileText } from 'lucide-react';
import { getProfile, updateProfile } from '@/utils/api';

interface ProfileTabProps {
  onProfileUpdate?: (updatedUser: any) => void;
}

export default function ProfileTab({ onProfileUpdate }: ProfileTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [profilePic, setProfilePic] = useState('');

  // Targets (inside goals)
  const [targetSteps, setTargetSteps] = useState(10000);
  const [targetWater, setTargetWater] = useState(8);
  const [targetSleep, setTargetSleep] = useState(8);
  const [targetCalories, setTargetCalories] = useState(2200);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await getProfile();
      setName(p.name || '');
      setAge(p.age ? String(p.age) : '');
      setGender(p.gender || 'Male');
      setHeight(p.height ? String(p.height) : '');
      setWeight(p.weight ? String(p.weight) : '');
      setMedicalNotes(p.medicalNotes || '');
      setEmergencyContact(p.emergencyContact || '');
      setProfilePic(p.profilePic || '');

      if (p.goals) {
        try {
          const parsed = JSON.parse(p.goals);
          if (parsed.steps) setTargetSteps(parsed.steps);
          if (parsed.water) setTargetWater(parsed.water);
          if (parsed.sleep) setTargetSleep(parsed.sleep);
          if (parsed.calories) setTargetCalories(parsed.calories);
        } catch (e) {
          console.warn('Failed to parse goals JSON:', e);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const goalsObj = {
      steps: Number(targetSteps),
      water: Number(targetWater),
      sleep: Number(targetSleep),
      calories: Number(targetCalories)
    };

    try {
      const payload = {
        name,
        age: age ? Number(age) : null,
        gender,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        medicalNotes,
        goals: JSON.stringify(goalsObj),
        emergencyContact,
        profilePic
      };

      const res = await updateProfile(payload);
      
      // Update local storage dh_user name
      const localUserStr = localStorage.getItem('dh_user');
      if (localUserStr) {
        const local = JSON.parse(localUserStr);
        local.name = name;
        localStorage.setItem('dh_user', JSON.stringify(local));
      }

      setSuccess('Profile updated successfully.');
      if (onProfileUpdate) {
        onProfileUpdate(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-xs">Loading profile records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      
      <div className="bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-250 dark:border-slate-800">
        <h3 className="font-extrabold text-slate-950 dark:text-white text-base">Personal Health Profile</h3>
        <p className="text-xs text-slate-400">Configure physiological parameters and emergency instructions</p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-450 text-xs">
          {success}
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Picture & Goals */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden border border-slate-250 dark:border-slate-850 mb-4 flex items-center justify-center text-slate-350">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12" />
              )}
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{name}</h4>
            <p className="text-3xs text-slate-450 mt-0.5">Physical profile editor</p>
            <input
              type="text"
              placeholder="Profile Picture URL"
              value={profilePic}
              onChange={(e) => setProfilePic(e.target.value)}
              className="w-full glass-input text-2xs mt-4"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-950 dark:text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-500" />
              Daily Targets
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-3xs font-bold text-slate-450 uppercase mb-1">Target Steps</label>
                <input type="number" value={targetSteps} onChange={(e) => setTargetSteps(Number(e.target.value))} className="w-full glass-input text-xs" />
              </div>
              <div>
                <label className="block text-3xs font-bold text-slate-450 uppercase mb-1">Target Water (Glasses)</label>
                <input type="number" value={targetWater} onChange={(e) => setTargetWater(Number(e.target.value))} className="w-full glass-input text-xs" />
              </div>
              <div>
                <label className="block text-3xs font-bold text-slate-450 uppercase mb-1">Target Sleep (Hours)</label>
                <input type="number" value={targetSleep} onChange={(e) => setTargetSleep(Number(e.target.value))} className="w-full glass-input text-xs" />
              </div>
              <div>
                <label className="block text-3xs font-bold text-slate-450 uppercase mb-1">Caloric Target (kcal)</label>
                <input type="number" value={targetCalories} onChange={(e) => setTargetCalories(Number(e.target.value))} className="w-full glass-input text-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Vitals & Medical Conditions */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h4 className="font-extrabold text-slate-950 dark:text-white text-xs uppercase tracking-wide">Physiological Data</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-3xs font-bold text-slate-450 uppercase mb-1.5">Age</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full glass-input text-xs" />
              </div>
              <div>
                <label className="block text-3xs font-bold text-slate-450 uppercase mb-1.5">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full glass-input text-xs">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-3xs font-bold text-slate-450 uppercase mb-1.5">Height (cm)</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full glass-input text-xs" />
              </div>
              <div>
                <label className="block text-3xs font-bold text-slate-450 uppercase mb-1.5">Weight (kg)</label>
                <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full glass-input text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-3xs font-bold text-slate-450 uppercase mb-1.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Emergency Contact
                </label>
                <input type="text" placeholder="Name and phone number" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} className="w-full glass-input text-xs" />
              </div>
              <div>
                <label className="block text-3xs font-bold text-slate-450 uppercase mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-500" /> Medical Conditions / Notes
                </label>
                <textarea
                  placeholder="e.g. Asthma, allergies to penicillin, previous heart condition details"
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className="w-full glass-input text-xs h-28 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Save Profile Details'}
            </button>

          </div>
        </div>

      </form>
    </div>
  );
}
