import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function StudentProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ name: '', phoneNumber: '', email: '', department_name: '' });
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('/api/student/profile', { withCredentials: true });
            setProfile(res.data);
        } catch (err) {
            setMessage({ text: 'Failed to load profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });
        try {
            await axios.put('/api/student/profile', {
                name: profile.name,
                phoneNumber: profile.phone_number,
                password: password || null
            }, { withCredentials: true });
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            setPassword('');
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Update failed', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-sr-dark flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                <p className="text-slate-400 font-medium">Loading Profile...</p>
            </div>
        </div>
    );

    const inputClass = "w-full bg-white/[0.05] border border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-4 py-3 outline-none transition-all text-white";
    const readonlyClass = "w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed outline-none";

    return (
        <div className="min-h-screen bg-sr-dark">
            {/* Navbar */}
            <nav className="bg-white/[0.03] backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={async () => {
                            await axios.post('/api/logout', {}, { withCredentials: true });
                            navigate('/');
                        }}>
                            <span className="text-xl">🏛️</span>
                            <span className="text-lg font-bold text-white tracking-tight">Smart<span className="text-violet-400">Resolve</span></span>
                        </div>
                        <button
                            id="profile-back-btn"
                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-sm font-medium transition-colors"
                            onClick={() => navigate('/student/dashboard')}
                        >
                            ← Dashboard
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white/[0.03] border border-violet-500/20 rounded-3xl p-8 sm:p-10">
                    <div className="mb-8 border-b border-white/[0.06] pb-6">
                        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
                        <p className="text-slate-400">Update your personal information and account security.</p>
                    </div>

                    {message.text && (
                        <div className={`p-4 rounded-xl mb-8 font-medium text-sm border ${
                            message.type === 'success'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="flex flex-col gap-8">
                        <div className="flex flex-col gap-5">
                            <h3 className="text-lg font-bold text-violet-400 flex items-center gap-2">
                                <span className="bg-violet-500/20 p-1.5 rounded-lg">👤</span> Account Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-300">Full Name</label>
                                    <input id="profile-name" className={inputClass} type="text"
                                        value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} required />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-300">Phone Number</label>
                                    <input id="profile-phone" className={inputClass} type="text"
                                        value={profile.phone_number || ''} onChange={(e) => setProfile({...profile, phone_number: e.target.value})} required />
                                </div>
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-300">Email Address <span className="text-slate-500 font-normal">(Cannot change)</span></label>
                                    <input className={readonlyClass} type="email" value={profile.email} disabled />
                                </div>
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-300">Department <span className="text-slate-500 font-normal">(Cannot change)</span></label>
                                    <input className={readonlyClass} type="text" value={profile.department_name} disabled />
                                </div>
                            </div>
                        </div>

                        <div className="h-px w-full bg-white/[0.06]"></div>

                        <div className="flex flex-col gap-5">
                            <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
                                <span className="bg-rose-500/20 p-1.5 rounded-lg">🔒</span> Security
                            </h3>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-300">New Password <span className="text-slate-500 font-normal">(Leave blank to keep current)</span></label>
                                <input id="profile-password" className={inputClass} type="password"
                                    placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </div>

                        <button
                            id="profile-save-btn"
                            className="mt-6 w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 text-white rounded-xl font-bold text-lg shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                            type="submit" disabled={saving}
                        >
                            {saving ? 'Saving Changes...' : 'Save Profile'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
