import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Landmark, Bell, ClipboardList, Settings, BarChart, Star } from '../../components/Icons';

export default function StaffDashboard() {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState({ TotalAssigned: 0, Resolved: 0, Pending: 0, AvgRating: 0 });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const analyticsRes = await axios.get('/api/staff/analytics', { withCredentials: true });
                if (analyticsRes.data) setAnalytics(analyticsRes.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            }
        };
        fetchDashboardData();
    }, []);

    const statCards = [
        { label: 'Resolved', value: analytics.Resolved, color: 'text-emerald-400', border: 'border-b-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Pending', value: analytics.Pending, color: 'text-amber-400', border: 'border-b-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Total Tasks', value: analytics.TotalAssigned, color: 'text-violet-400', border: 'border-b-violet-500', bg: 'bg-violet-500/10' },
        { label: 'Avg Rating', value: Number(analytics.AvgRating).toFixed(1), Icon: Star, color: 'text-rose-400', border: 'border-b-rose-500', bg: 'bg-rose-500/10' },
    ];

    const navCards = [
        { id: 'staff-card-complaints', path: '/staff/complaints', Icon: ClipboardList, title: 'Assigned Complaints', desc: 'View & manage your tasks', accent: 'from-emerald-500 to-teal-600', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
        { id: 'staff-card-profile', path: '/staff/profile', Icon: Settings, title: 'Manage Profile', desc: 'Update info & password', accent: 'from-violet-500 to-purple-600', border: 'border-violet-500/30', glow: 'shadow-violet-500/20' },
        { id: 'staff-card-feedback', path: '/staff/feedback', Icon: Star, title: 'View Feedback', desc: 'Student ratings & comments', accent: 'from-amber-500 to-orange-500', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
    ];

    return (
        <div className="min-h-screen bg-sr-dark">
            <Navbar role="Staff" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Staff Dashboard</h1>
                    <p className="text-slate-400">Manage your assigned tasks and track your performance.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((s, i) => (
                        <div key={i} className={`${s.bg} border border-white/[0.06] border-b-4 ${s.border} rounded-2xl p-6`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
                                {s.Icon && <s.Icon size={14} className={s.color} fill={s.label === 'Avg Rating' ? 'currentColor' : 'none'} />}
                            </div>
                            <h3 className={`text-3xl font-black ${s.color}`}>{s.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Nav Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {navCards.map(c => (
                        <div key={c.id} id={c.id} onClick={() => navigate(c.path)}
                            className={`group cursor-pointer bg-white/[0.03] border ${c.border} rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300 hover:shadow-xl ${c.glow}`}>
                            <div className={`w-12 h-12 bg-gradient-to-br ${c.accent} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                <c.Icon size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{c.title}</h3>
                            <p className="text-sm text-slate-400">{c.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}