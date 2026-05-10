import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ name: '', email: '', phone: '', password: '' });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/admin/profile', { withCredentials: true });
                setProfile({
                    name: res.data.name || '',
                    email: res.data.email || '',
                    phone: res.data.phone || '',
                    password: '' // Don't populate password
                });
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch profile details.');
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);
        setSuccess(null);
        try {
            await axios.patch('/api/admin/profile', profile, { withCredentials: true });
            setSuccess('Profile updated successfully.');
            setProfile(prev => ({ ...prev, password: '' })); // clear password field
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to update profile.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-sr-dark flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                <p className="text-slate-400 font-medium">Loading...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-sr-dark p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Change Personal Info</h1>
                        <p className="text-slate-400 text-sm">Update your admin account details.</p>
                    </div>
                    <button
                        id="admin-profile-back-btn"
                        className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl font-medium transition-colors"
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        ← Dashboard
                    </button>
                </div>

                <div className="bg-white/[0.03] border border-amber-500/20 rounded-2xl p-8">
                    {error && <p className="text-red-400 text-sm mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">{error}</p>}
                    {success && <p className="text-emerald-400 text-sm mb-6 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">{success}</p>}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-300">Email (Read-only)</label>
                            <input type="email" name="email" value={profile.email} readOnly
                                className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed outline-none" />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-300">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/[0.05] border border-white/10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 outline-none transition-all text-white"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-300">Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/[0.05] border border-white/10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 outline-none transition-all text-white"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-300">New Password (Optional)</label>
                            <input
                                type="password"
                                name="password"
                                value={profile.password}
                                onChange={handleChange}
                                placeholder="Leave blank to keep current password"
                                className="w-full bg-white/[0.05] border border-white/10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 outline-none transition-all text-white placeholder-slate-600"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={updating}
                            className="mt-4 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white shadow-lg shadow-amber-500/25 rounded-xl font-semibold transition-all disabled:opacity-50"
                        >
                            {updating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
