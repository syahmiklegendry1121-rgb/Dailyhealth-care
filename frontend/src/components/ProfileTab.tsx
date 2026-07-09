'use client';

import React, { useState, useEffect } from 'react';
import { User, ShieldAlert, Award, RefreshCw, FileText, Upload, HeartHandshake, Edit2, Check, Plus, Camera } from 'lucide-react';
import { getProfile, updateProfile } from '@/utils/api';

const AVATAR_TEMPLATES = [
  {
    id: 'av_1',
    name: 'Teal Female with Glasses',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2dd4bf"/><stop offset="100%" stop-color="#14b8a6"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g1)"/><path d="M22,92 C22,74 34,64 50,64 C66,64 78,74 78,92" fill="#cbd5e1"/><circle cx="50" cy="42" r="18" fill="#fed7aa"/><path d="M30,38 C30,22 42,20 50,20 C58,20 70,22 70,38 C70,44 68,46 68,48 C65,42 55,42 50,45 C45,42 35,42 32,48 C32,46 30,44 30,38 Z" fill="#1e293b"/><circle cx="44" cy="42" r="2" fill="#1e293b"/><circle cx="56" cy="42" r="2" fill="#1e293b"/><path d="M41,40 L47,40 M53,40 L59,40 M47,42 C47,38 41,38 41,42 M59,42 C59,38 53,38 53,42" stroke="#1e293b" stroke-width="1.5" fill="none"/><path d="M47,41 L53,41" stroke="#1e293b" stroke-width="1"/><path d="M45,49 Q50,53 55,49" stroke="#1e293b" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'av_2',
    name: 'Blue Bearded Male',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g2)"/><path d="M22,92 C22,74 34,64 50,64 C66,64 78,74 78,92" fill="#e2e8f0"/><circle cx="50" cy="42" r="18" fill="#ffedd5"/><path d="M32,32 Q50,16 68,32 C74,38 72,42 66,40 C60,38 40,38 34,40 C28,42 26,38 32,32 Z" fill="#475569"/><path d="M32,42 C32,54 40,62 50,62 C60,62 68,54 68,42 C68,42 62,45 50,45 C38,45 32,42 32,42 Z" fill="#475569"/><circle cx="43" cy="40" r="2" fill="#1e293b"/><circle cx="57" cy="40" r="2" fill="#1e293b"/><path d="M46,48 Q50,51 54,48" stroke="#ffedd5" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'av_3',
    name: 'Emerald Active Female',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#047857"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g3)"/><path d="M22,92 C22,74 34,64 50,64 C66,64 78,74 78,92" fill="#f1f5f9"/><circle cx="50" cy="42" r="18" fill="#fde047"/><path d="M32,30 C32,18 68,18 68,30 C68,36 64,46 64,48 C56,44 44,44 36,48 C36,46 32,36 32,30 Z" fill="#b45309"/><circle cx="44" cy="40" r="2" fill="#1e293b"/><circle cx="56" cy="40" r="2" fill="#1e293b"/><path d="M46,47 Q50,51 54,47" stroke="#1e293b" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'av_4',
    name: 'Purple Senior Female',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#6d28d9"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g4)"/><path d="M22,92 C22,74 34,64 50,64 C66,64 78,74 78,92" fill="#e2e8f0"/><circle cx="50" cy="42" r="18" fill="#fbcfe8"/><path d="M30,35 C30,22 40,16 50,16 C60,16 70,22 70,35 C70,42 66,42 66,44 C60,38 40,38 34,44 C34,42 30,42 30,35 Z" fill="#94a3b8"/><circle cx="43" cy="41" r="2" fill="#1e293b"/><circle cx="57" cy="41" r="2" fill="#1e293b"/><path d="M45,48 Q50,51 55,48" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'av_5',
    name: 'Indigo Athletic Male',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#4338ca"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g5)"/><path d="M22,92 C22,74 34,64 50,64 C66,64 78,74 78,92" fill="#f8fafc"/><circle cx="50" cy="42" r="18" fill="#ffedd5"/><path d="M32,32 L68,32 L64,24 L36,24 Z" fill="#0f172a"/><path d="M34,24 Q50,22 66,24 L72,28 L64,32 Z" fill="#f43f5e"/><circle cx="44" cy="41" r="2" fill="#1e293b"/><circle cx="56" cy="41" r="2" fill="#1e293b"/><path d="M46,48 Q50,51 54,48" stroke="#1e293b" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'av_6',
    name: 'Orange Hijab Female',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f97316"/><stop offset="100%" stop-color="#c2410c"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g6)"/><path d="M20,92 C20,70 30,60 50,60 C70,60 80,70 80,92" fill="#cbd5e1"/><path d="M30,30 C30,16 70,16 70,30 C70,52 64,68 50,68 C36,68 30,52 30,30 Z" fill="#475569"/><ellipse cx="50" cy="40" rx="14" ry="17" fill="#fed7aa"/><circle cx="44" cy="38" r="2" fill="#1e293b"/><circle cx="56" cy="38" r="2" fill="#1e293b"/><path d="M45,46 Q50,50 55,46" stroke="#1e293b" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'av_7',
    name: 'Pink Short Hair Gender-Neutral',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g7" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ec4899"/><stop offset="100%" stop-color="#be185d"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g7)"/><path d="M22,92 C22,74 34,64 50,64 C66,64 78,74 78,92" fill="#e2e8f0"/><circle cx="50" cy="42" r="18" fill="#f59e0b"/><path d="M32,32 C32,22 40,20 50,20 C60,20 68,22 68,32 C68,34 62,32 50,32 C38,32 32,34 32,32 Z" fill="#1e293b"/><circle cx="44" cy="41" r="2" fill="#1e293b"/><circle cx="56" cy="41" r="2" fill="#1e293b"/><path d="M46,47 Q50,50 54,47" stroke="#1e293b" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'av_8',
    name: 'Sky Curly Hair Female',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g8" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#0369a1"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g8)"/><path d="M22,92 C22,74 34,64 50,64 C66,64 78,74 78,92" fill="#f8fafc"/><circle cx="48" cy="28" r="12" fill="#78350f"/><circle cx="36" cy="34" r="10" fill="#78350f"/><circle cx="64" cy="34" r="10" fill="#78350f"/><circle cx="50" cy="42" r="18" fill="#f59e0b"/><circle cx="44" cy="41" r="2" fill="#1e293b"/><circle cx="56" cy="41" r="2" fill="#1e293b"/><path d="M46,47 Q50,51 54,47" stroke="#1e293b" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'av_9',
    name: 'Amber Senior Male',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g9" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g9)"/><path d="M22,92 C22,74 34,64 50,64 C66,64 78,74 78,92" fill="#e2e8f0"/><circle cx="50" cy="42" r="18" fill="#fed7aa"/><path d="M34,30 C34,22 40,18 50,18 C60,18 66,22 66,30 Z" fill="#e2e8f0"/><circle cx="43" cy="40" r="2" fill="#1e293b"/><circle cx="57" cy="40" r="2" fill="#1e293b"/><path d="M40,39 L46,39 M54,39 L60,39" stroke="#1e293b" stroke-width="1.5"/><path d="M46,47 Q50,50 54,47" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'av_10',
    name: 'Cyan Beanie Gender-Neutral',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g10" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#0891b2"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g10)"/><path d="M22,92 C22,74 34,64 50,64 C66,64 78,74 78,92" fill="#f1f5f9"/><circle cx="50" cy="42" r="18" fill="#fde047"/><path d="M30,30 Q50,12 70,30 L66,36 L34,36 Z" fill="#64748b"/><circle cx="44" cy="41" r="2" fill="#1e293b"/><circle cx="56" cy="41" r="2" fill="#1e293b"/><path d="M46,47 Q50,50 54,47" stroke="#1e293b" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'av_11',
    name: 'Rose Ponytail Female',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g11" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#be123c"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g11)"/><path d="M22,92 C22,74 34,64 50,64 C66,64 78,74 78,92" fill="#cbd5e1"/><path d="M56,36 Q78,32 72,50 L64,44 Z" fill="#d97706"/><circle cx="50" cy="42" r="18" fill="#ffedd5"/><path d="M32,32 C32,20 44,18 50,18 C56,18 68,20 68,32 C68,36 60,34 50,34 C40,34 32,36 32,32 Z" fill="#d97706"/><circle cx="44" cy="41" r="2" fill="#1e293b"/><circle cx="56" cy="41" r="2" fill="#1e293b"/><path d="M46,47 Q50,50 54,47" stroke="#1e293b" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'av_12',
    name: 'Fuchsia Afro Male',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g12" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#d946ef"/><stop offset="100%" stop-color="#a21caf"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g12)"/><path d="M22,92 C22,74 34,64 50,64 C66,64 78,74 78,92" fill="#e2e8f0"/><circle cx="36" cy="30" r="10" fill="#1e293b"/><circle cx="44" cy="24" r="11" fill="#1e293b"/><circle cx="56" cy="24" r="11" fill="#1e293b"/><circle cx="64" cy="30" r="10" fill="#1e293b"/><circle cx="50" cy="42" r="18" fill="#d97706"/><circle cx="44" cy="41" r="2" fill="#1e293b"/><circle cx="56" cy="41" r="2" fill="#1e293b"/><path d="M46,47 Q50,50 54,47" stroke="#1e293b" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`
  }
];

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
  const [tempName, setTempName] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const triggerGalleryAccess = () => {
    const hasPermission = window.confirm("DailyHealth requires permission to access your photo gallery to upload a profile picture. Do you want to proceed?");
    if (hasPermission) {
      fileInputRef.current?.click();
    }
  };

  const startEditingName = () => {
    setTempName(name);
    setIsEditingName(true);
  };

  const handleNameSave = async (newName: string) => {
    if (!newName || !newName.trim()) {
      setIsEditingName(false);
      return;
    }
    const trimmed = newName.trim();
    setName(trimmed);
    setIsEditingName(false);

    try {
      const goalsObj = {
        steps: Number(targetSteps),
        water: Number(targetWater),
        sleep: Number(targetSleep),
        calories: Number(targetCalories),
        bloodType,
        allergies,
        primaryDoctor
      };

      const payload = {
        name: trimmed,
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

      // Sync local storage user
      const localUserStr = localStorage.getItem('dh_user');
      if (localUserStr) {
        const local = JSON.parse(localUserStr);
        local.name = trimmed;
        localStorage.setItem('dh_user', JSON.stringify(local));
      }

      setSuccess('Profile name updated in real time.');
      if (onProfileUpdate) {
        onProfileUpdate(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update name in database.');
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
        handleAvatarSave(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarSave = async (imgUri: string) => {
    setProfilePic(imgUri);

    try {
      const goalsObj = {
        steps: Number(targetSteps),
        water: Number(targetWater),
        sleep: Number(targetSleep),
        calories: Number(targetCalories),
        bloodType,
        allergies,
        primaryDoctor
      };

      const payload = {
        name,
        age: age ? Number(age) : null,
        gender,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        medicalNotes,
        goals: JSON.stringify(goalsObj),
        emergencyContact,
        profilePic: imgUri
      };

      const res = await updateProfile(payload);

      // Sync local storage user
      const localUserStr = localStorage.getItem('dh_user');
      if (localUserStr) {
        const local = JSON.parse(localUserStr);
        local.profilePic = imgUri;
        localStorage.setItem('dh_user', JSON.stringify(local));
      }

      setSuccess('Profile avatar updated in real time.');
      if (onProfileUpdate) {
        onProfileUpdate(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update avatar in database.');
    }
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
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)} 
                  className="glass-input text-xs py-1 px-2 text-center font-bold max-w-[150px] outline-none"
                  autoFocus
                  onBlur={() => handleNameSave(tempName)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameSave(tempName);
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => handleNameSave(tempName)}
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
                  onClick={startEditingName}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                  title="Edit Name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-3xs text-slate-450 mt-0.5">Physical profile editor</p>
            
            {/* Modern Avatar Selection Grid System */}
            <div className="w-full mt-6 space-y-3.5 border-t border-slate-100 dark:border-slate-800 pt-5 text-left">
              <div>
                <span className="font-extrabold text-slate-950 dark:text-white text-2xs tracking-wide uppercase">Select Avatar</span>
                <p className="text-3xs text-slate-400 mt-0.5">Choose an illustration or upload a custom photo</p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {AVATAR_TEMPLATES.map((avatar) => {
                  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(avatar.svg)}`;
                  const isSelected = profilePic === dataUri;
                  
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleAvatarSave(dataUri)}
                      className={`relative aspect-square rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 duration-200 ${
                        isSelected 
                          ? 'border-blue-500 shadow-md shadow-blue-500/20 ring-2 ring-blue-500/10' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                      }`}
                      title={avatar.name}
                    >
                      <div dangerouslySetInnerHTML={{ __html: avatar.svg }} className="w-full h-full" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                          <div className="bg-blue-500 text-white rounded-full p-0.5 shadow-sm">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Custom Gallery Upload Slot */}
                <button
                  type="button"
                  onClick={triggerGalleryAccess}
                  className="relative aspect-square rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-450 dark:hover:border-slate-500 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 bg-slate-50/50 dark:bg-slate-950/20 group"
                  title="Upload custom picture"
                >
                  <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[7px] text-slate-450 font-extrabold uppercase mt-0.5">Custom</span>
                </button>
              </div>
            </div>

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
