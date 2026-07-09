'use client';

import React, { useState, useEffect } from 'react';
import { User, ShieldAlert, Award, RefreshCw, FileText, Upload, HeartHandshake, Edit2, Check } from 'lucide-react';
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
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const triggerGalleryAccess = () => {
    const hasPermission = window.confirm("DailyHealth requires permission to access your photo gallery to upload a profile picture. Do you want to proceed?");
    if (hasPermission) {
      fileInputRef.current?.click();
    }
  };
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [profilePic, setProfilePic] = useState('');

  // Customized User Profiles (stored inside goals JSON string)
  const [bloodType, setBloodType] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [primaryDoctor, setPrimaryDoctor] = useState('');

  // Daily targets (stored inside goals JSON string)
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
          if (parsed.bloodType) setBloodType(parsed.bloodType);
          if (parsed.allergies) setAllergies(parsed.allergies);
          if (parsed.primaryDoctor) setPrimaryDoctor(parsed.primaryDoctor);
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

  // Handle local DP image upload and encode to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit size to 2MB to keep DB fast
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setProfilePic(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const goalsObj = {
      steps: Number(targetSteps),
      water: Number(targetWater),
      sleep: Number(targetSleep),
      calories: Number(targetCalories),
      bloodType,
      allergies,
      primaryDoctor
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
      
      const localUserStr = localStorage.getItem('dh_user');
      if (localUserStr) {
        const local = JSON.parse(localUserStr);
        local.name = name;
        local.profilePic = profilePic;
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
            
            {isEditingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="glass-input text-xs py-1 px-2 text-center font-bold max-w-[150px] outline-none"
                  autoFocus
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingName(false);
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => setIsEditingName(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 justify-center mt-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{name}</h4>
                <button 
                  type="button" 
                  onClick={() => setIsEditingName(true)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                  title="Edit Name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-3xs text-slate-450 mt-0.5">Physical profile editor</p>
            
            {/* User Gallery Upload DP Button */}
            <button 
              type="button"
              onClick={triggerGalleryAccess}
              className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl cursor-pointer text-2xs font-extrabold text-slate-600 dark:text-slate-350 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-blue-500" />
              <span>Choose from Gallery</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
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

        {/* Right Columns: Physiological Data & Customized Profiles */}
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

            {/* CUSTOMIZED USER PROFILE PARAMETERS */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 space-y-4">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-500" />
                Customized Profile Details
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-3xs font-bold text-slate-455 uppercase mb-1.5">Blood Group</label>
                  <select value={bloodType} onChange={(e) => setBloodType(e.target.value)} className="w-full glass-input text-xs">
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-3xs font-bold text-slate-455 uppercase mb-1.5">Primary Physician</label>
                  <input 
                    type="text" 
                    placeholder="Dr. Name or Contact" 
                    value={primaryDoctor} 
                    onChange={(e) => setPrimaryDoctor(e.target.value)} 
                    className="w-full glass-input text-xs" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-3xs font-bold text-slate-455 uppercase mb-1.5">Allergies & Intolerances</label>
                <input 
                  type="text" 
                  placeholder="e.g. Penicillin, Gluten, Peanuts, None" 
                  value={allergies} 
                  onChange={(e) => setAllergies(e.target.value)} 
                  className="w-full glass-input text-xs" 
                />
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
                  placeholder="e.g. Asthma, previous heart condition details"
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className="w-full glass-input text-xs h-28 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Save Profile Details'}
            </button>

          </div>
        </div>

      </form>
    </div>
  );
}
