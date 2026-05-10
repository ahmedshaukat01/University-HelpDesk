import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Landmark, Bell, Settings, ClipboardList, PlusCircle } from '../../components/Icons';

export default function StudentDashboard() {
    const navigate = useNavigate();

    const cards = [
        {
            id: 'card-submit-complaint',
            onClick: () => navigate('/student/submit-complaint'),
            Icon: PlusCircle,
            title: 'Submit Complaint',
            desc: 'Submit a new issue or request help.',
            accent: 'from-violet-500 to-purple-600',
            glow: 'shadow-violet-500/20',
            border: 'border-violet-500/30',
        },
        {
            id: 'card-my-complaints',
            onClick: () => navigate('/student/my-complaints'),
            Icon: ClipboardList,
            title: 'My Complaints',
            desc: 'View and track your submitted issues.',
            accent: 'from-emerald-500 to-teal-600',
            glow: 'shadow-emerald-500/20',
            border: 'border-emerald-500/30',
        },
        {
            id: 'card-profile',
            onClick: () => navigate('/student/profile'),
            Icon: Settings,
            title: 'Profile Settings',
            desc: 'Update your personal info & password.',
            accent: 'from-amber-500 to-orange-500',
            glow: 'shadow-amber-500/20',
            border: 'border-amber-500/30',
        },
    ];

    return (
        <div className="min-h-screen bg-sr-dark">
            <Navbar role="Student" />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Student Dashboard</h1>
                    <p className="text-slate-400">Welcome! Manage your complaints and track their progress.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cards.map((c) => (
                        <div
                            key={c.id}
                            id={c.id}
                            onClick={c.onClick}
                            className={`group cursor-pointer bg-white/[0.03] border ${c.border} rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300 hover:shadow-xl ${c.glow} flex flex-col items-start`}
                        >
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
