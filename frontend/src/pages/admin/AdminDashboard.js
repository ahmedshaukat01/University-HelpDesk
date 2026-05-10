import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Landmark, Bell, ClipboardList, BarChart, Settings, PlusCircle, Users, Building } from '../../components/Icons';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => { fetchNotifications(); }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/admin/notifications', { withCredentials: true });
            setNotifications(res.data);
        } catch (err) { console.error('Error fetching notifications:', err); }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAsRead = async (id) => {
        try {
            await axios.patch(`/api/admin/notifications/${id}/read`, {}, { withCredentials: true });
            setNotifications(notifications.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
        } catch (err) { console.error('Error marking as read:', err); }
    };

    const handleLogout = async () => {
        await axios.post('/api/logout', {}, { withCredentials: true });
        navigate('/admin/login');
    };

    const cards = [
        { id: 'admin-card-complaints', path: '/admin/manage-complaints', Icon: ClipboardList, title: 'Manage Complaints', desc: 'View, assign & prioritise issues', accent: 'from-violet-500 to-purple-600', border: 'border-violet-500/30', glow: 'shadow-violet-500/20' },
        { id: 'admin-card-reports', path: '/admin/reports', Icon: BarChart, title: 'Generate Reports', desc: 'View department analytics & stats', accent: 'from-emerald-500 to-teal-600', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
        { id: 'admin-card-departments', path: '/admin/departments', Icon: Building, title: 'Manage Departments', desc: 'View and edit department names', accent: 'from-cyan-500 to-sky-600', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20' },
        { id: 'admin-card-users', path: '/admin/users', Icon: Users, title: 'Manage Users', desc: 'Add, view and deactivate users', accent: 'from-amber-500 to-orange-500', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
        { id: 'admin-card-reopen', path: '/admin/reopen-requests', Icon: PlusCircle, title: 'Reopen Requests', desc: 'Review student reopen requests', accent: 'from-rose-500 to-pink-600', border: 'border-rose-500/30', glow: 'shadow-rose-500/20' },
        { id: 'admin-card-profile', path: '/admin/profile', Icon: Settings, title: 'Personal Info', desc: 'Update your profile details', accent: 'from-slate-400 to-slate-600', border: 'border-slate-500/30', glow: 'shadow-slate-500/20' },
    ];

    return (
        <div className="min-h-screen bg-sr-dark">
            <nav className="bg-white/[0.03] backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity text-white" onClick={async () => {
                            await axios.post('/api/logout', {}, { withCredentials: true });
                            navigate('/');
                        }}>
                            <Landmark size={24} />
                            <span className="text-lg font-bold tracking-tight">Smart<span className="text-amber-400">Resolve</span></span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button id="admin-notif-btn" onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-full hover:bg-white/10 transition-colors relative text-slate-400 hover:text-white">
                                    <Bell size={20} />
                                    {unreadCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">{unreadCount}</span>}
                                </button>
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-sr-surface border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeSlideIn">
                                        <div className="px-4 py-3 border-b border-white/[0.06] flex justify-between items-center">
                                            <h3 className="text-sm font-semibold text-white">Notifications</h3>
                                            <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-slate-300">✕</button>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-6 text-center text-sm text-slate-500">No notifications yet</div>
                                            ) : (
                                                <div className="divide-y divide-white/[0.04]">
                                                    {notifications.map(n => (
                                                        <div key={n.notification_id} onClick={() => !n.is_read && handleMarkAsRead(n.notification_id)}
                                                            className={`p-4 cursor-pointer transition-colors ${n.is_read ? 'hover:bg-white/5' : 'bg-amber-500/10 border-l-4 border-amber-500'}`}>
                                                            <p className={`text-sm mb-1 ${n.is_read ? 'text-slate-400' : 'text-white font-medium'}`}>{n.message}</p>
                                                            <p className="text-xs text-slate-600">{new Date(n.created_at).toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-300 text-sm font-medium rounded-full border border-amber-500/20">Admin</span>
                            <button id="admin-logout-btn" onClick={handleLogout} className="text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

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