import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Landmark, ClipboardList, BarChart, Settings, PlusCircle, Users, Building } from '../../components/Icons';

export default function AdminDashboard() {
    const navigate = useNavigate();

    const cards = [
        { id: 'admin-card-complaints', path: '/admin/complaints', Icon: ClipboardList, title: 'Manage Complaints', desc: 'View, assign & prioritise issues', accent: 'from-violet-500 to-purple-600', border: 'border-violet-500/30', glow: 'shadow-violet-500/20' },
        { id: 'admin-card-reports', path: '/admin/reports', Icon: BarChart, title: 'Generate Reports', desc: 'View department analytics & stats', accent: 'from-emerald-500 to-teal-600', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
        { id: 'admin-card-departments', path: '/admin/departments', Icon: Building, title: 'Manage Departments', desc: 'View and edit department names', accent: 'from-cyan-500 to-sky-600', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20' },
        { id: 'admin-card-users', path: '/admin/users', Icon: Users, title: 'Manage Users', desc: 'Add, view and deactivate users', accent: 'from-amber-500 to-orange-500', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
        { id: 'admin-card-reopen', path: '/admin/reopen-requests', Icon: PlusCircle, title: 'Reopen Requests', desc: 'Review student reopen requests', accent: 'from-rose-500 to-pink-600', border: 'border-rose-500/30', glow: 'shadow-rose-500/20' },
        { id: 'admin-card-profile', path: '/admin/profile', Icon: Settings, title: 'Personal Info', desc: 'Update your profile details', accent: 'from-slate-400 to-slate-600', border: 'border-slate-500/30', glow: 'shadow-slate-500/20' },
    ];

    return (
        <div className="min-h-screen bg-sr-dark">
            <Navbar role="Admin" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-slate-400">Manage your university helpdesk operations.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map(c => (
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