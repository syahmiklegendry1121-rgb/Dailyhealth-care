'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Clipboard, Megaphone, Activity, BarChart, Trash2, Shield, RefreshCw, Send
} from 'lucide-react';
import { 
  getAdminStats, getAdminUsers, getAdminReports, updateAdminUserRole, sendAdminNotification
} from '@/utils/api';

export default function AdminTab() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Announcement state
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceMessage, setAnnounceMessage] = useState('');
  const [announceType, setAnnounceType] = useState('info');
  const [announceTargetUser, setAnnounceTargetUser] = useState('');
  const [announceSuccess, setAnnounceSuccess] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, reportsRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminReports()
      ]);
      setStats(statsRes);
      setUsers(usersRes);
      setReports(reportsRes);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch administrator records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await updateAdminUserRole(userId, nextRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u));
    } catch (err: any) {
      alert(err.message || 'Failed to update user role.');
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnounceSuccess(null);
    if (!announceTitle || !announceMessage) return;

    try {
      const payload: any = {
        title: announceTitle,
        message: announceMessage,
        type: announceType
      };
      if (announceTargetUser) {
        payload.userId = announceTargetUser;
      }

      await sendAdminNotification(payload);
      setAnnounceSuccess(announceTargetUser ? 'Direct message sent!' : 'Broadcast announcement dispatched!');
      setAnnounceTitle('');
      setAnnounceMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch notification.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-xs">Loading administrator resources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* Overview stats cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-2xs text-slate-400 font-bold uppercase tracking-wide">Total Users</span>
            <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              {stats.totalUsers}
            </h3>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-2xs text-slate-400 font-bold uppercase tracking-wide">Questionnaire Submissions</span>
            <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-2 flex items-center gap-2">
              <Clipboard className="w-5 h-5 text-purple-500" />
              {stats.totalLogs}
            </h3>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-2xs text-slate-400 font-bold uppercase tracking-wide">Daily Email Dispatches</span>
            <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              {stats.totalEmailsSent}
            </h3>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-2xs text-slate-400 font-bold uppercase tracking-wide">Average Health Score</span>
            <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-2 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-yellow-500" />
              {stats.averageHealthScore}/100
            </h3>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
          {error}
        </div>
      )}

      {/* Grid Split: User Management & Notifications dispatch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User list */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h4 className="font-extrabold text-slate-950 dark:text-white text-sm mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> User Accounts Mod
          </h4>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 uppercase font-bold text-3xs tracking-wider">
                  <th className="pb-3">Name / Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Logs</th>
                  <th className="pb-3">Created At</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-3.5 pr-2">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-slate-400 text-3xs">{u.email}</div>
                    </td>
                    <td className="py-3.5 pr-2">
                      <span className={`px-2 py-0.5 rounded text-3xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-650'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 font-semibold text-slate-700 dark:text-slate-350">{u._count.healthLogs} days</td>
                    <td className="py-3.5 pr-2 text-slate-450 text-3xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleRoleToggle(u.id, u.role)}
                        className="px-2 py-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-semibold text-3xs text-slate-650 dark:text-slate-300 transition-all flex items-center gap-1 inline-flex"
                      >
                        <Shield className="w-3 h-3 text-purple-500" />
                        Toggle Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Notification Panel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-slate-950 dark:text-white text-sm mb-4 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-purple-500" /> Broadcast Alerts
            </h4>

            {announceSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs mb-4">
                {announceSuccess}
              </div>
            )}

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-3xs font-bold text-slate-450 uppercase mb-1.5">Target Member</label>
                <select 
                  value={announceTargetUser} 
                  onChange={(e) => setAnnounceTargetUser(e.target.value)} 
                  className="w-full glass-input text-xs"
                >
                  <option value="">Broadcast: All Users</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-3xs font-bold text-slate-450 uppercase mb-1.5">Alert Level</label>
                <select 
                  value={announceType} 
                  onChange={(e) => setAnnounceType(e.target.value)} 
                  className="w-full glass-input text-xs"
                >
                  <option value="info">Info / Tip</option>
                  <option value="reminder">Reminder Check-in</option>
                  <option value="alert">System alert / Warning</option>
                </select>
              </div>

              <div>
                <label className="block text-3xs font-bold text-slate-450 uppercase mb-1.5">Announcement Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Water intake challenge" 
                  value={announceTitle} 
                  onChange={(e) => setAnnounceTitle(e.target.value)} 
                  className="w-full glass-input text-xs" 
                  required
                />
              </div>

              <div>
                <label className="block text-3xs font-bold text-slate-450 uppercase mb-1.5">Message Content</label>
                <textarea 
                  placeholder="Type alert instructions..." 
                  value={announceMessage} 
                  onChange={(e) => setAnnounceMessage(e.target.value)} 
                  className="w-full glass-input text-xs h-24 resize-none" 
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Alert
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Reports feed */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
        <h4 className="font-extrabold text-slate-950 dark:text-white text-sm mb-4 flex items-center gap-2">
          <Clipboard className="w-4 h-4 text-emerald-500" /> Recent Daily Questionnaire Feeds
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 uppercase font-bold text-3xs tracking-wider">
                <th className="pb-3">User</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Sleep</th>
                <th className="pb-3">Steps</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {reports.slice(0, 15).map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="py-3">
                    <div className="font-bold text-slate-900 dark:text-white">{r.user?.name}</div>
                    <div className="text-slate-400 text-3xs">{r.user?.email}</div>
                  </td>
                  <td className="py-3 font-semibold text-slate-700 dark:text-slate-350">{r.date}</td>
                  <td className="py-3 text-slate-500">{r.sleep?.duration || 0} hrs</td>
                  <td className="py-3 text-slate-500">{(r.steps?.count || 0).toLocaleString()}</td>
                  <td className="py-3 font-extrabold text-blue-500">{r.healthScore?.score || 0}/100</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-3xs font-bold uppercase ${r.healthScore?.rating === 'Excellent' || r.healthScore?.rating === 'Good' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450' : 'bg-red-500/10 text-red-650'}`}>
                      {r.healthScore?.rating || 'Average'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
