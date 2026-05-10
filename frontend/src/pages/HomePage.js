import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, GraduationCap, Wrench, Settings, ArrowRight } from '../components/Icons';

export default function HomePage() {
    const navigate = useNavigate();

    const portals = [
        {
            id: 'student-portal',
            Icon: GraduationCap,
            title: 'Student Portal',
            description: 'Submit complaints, track progress, and manage your profile.',
            cta: 'Login as Student',
            path: '/login',
            accent: 'from-violet-500 to-purple-600',
            glow: 'shadow-violet-500/20',
            border: 'border-violet-500/30',
        },
        {
            id: 'staff-portal',
            Icon: Wrench,
            title: 'Staff Portal',
            description: 'Manage assigned complaints, update statuses, and provide feedback.',
            cta: 'Login as Staff',
            path: '/login',
            accent: 'from-emerald-500 to-teal-600',
            glow: 'shadow-emerald-500/20',
            border: 'border-emerald-500/30',
        },
        {
            id: 'admin-portal',
            Icon: Settings,
            title: 'Admin Portal',
            description: 'Oversee departments, users, reports, and system settings.',
            cta: 'Admin Login',
            path: '/admin/login',
            accent: 'from-amber-500 to-orange-500',
            glow: 'shadow-amber-500/20',
            border: 'border-amber-500/30',
        },
    ];

    return (
        <div className="min-h-screen bg-sr-dark flex flex-col">

            {/* Top Nav */}
            <nav className="w-full flex items-center justify-between px-8 py-5 border-b border-white/5">
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
                    <Landmark size={28} className="text-white" />
                    <span className="text-xl font-bold tracking-tight text-white">
                        Smart<span className="text-violet-400">Resolve</span>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        id="nav-register-btn"
                        onClick={() => navigate('/register')}
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                    >
                        Register
                    </button>
                    <button
                        id="nav-login-btn"
                        onClick={() => navigate('/login')}
                        className="text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
                    >
                        Login
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-10">
                <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></span>
                    University Help Desk System
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4 max-w-3xl">
                    Your Complaints,{' '}
                    <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                        Resolved Fast
                    </span>
                </h1>

                <p className="text-lg text-slate-400 max-w-xl mb-10">
                    A unified platform for students, staff, and administrators to handle university complaints efficiently and transparently.
                </p>

                <button
                    id="hero-get-started-btn"
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-base font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 px-8 py-3.5 rounded-xl shadow-xl shadow-violet-500/30 hover:opacity-90 transition-all duration-200 hover:scale-105"
                >
                    Get Started <ArrowRight size={18} />
                </button>
            </section>

            {/* Portal Cards */}
            <section className="max-w-5xl mx-auto w-full px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {portals.map((p) => (
                    <div
                        key={p.id}
                        id={p.id}
                        onClick={() => navigate(p.path)}
                        className={`group cursor-pointer bg-white/[0.03] border ${p.border} rounded-2xl p-7 hover:bg-white/[0.07] transition-all duration-300 hover:shadow-2xl ${p.glow} flex flex-col gap-4`}
                    >
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${p.accent} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 text-white`}>
                            <p.Icon size={28} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">{p.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{p.description}</p>
                        </div>
                        <button
                            className={`mt-auto flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r ${p.accent} px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity w-full`}
                        >
                            {p.cta} <ArrowRight size={16} />
                        </button>
                    </div>
                ))}
            </section>

            {/* Footer */}
            <footer className="mt-auto border-t border-white/5 py-6 text-center text-slate-600 text-sm">
                © {new Date().getFullYear()} SmartResolve · University Help Desk
            </footer>
        </div>
    );
}
