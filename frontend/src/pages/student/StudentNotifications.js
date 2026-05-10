import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';

export default function StudentNotifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchNotifications(); }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/student/notifications', { withCredentials: true });
            setNotifications(res.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.patch(`/api/student/notifications/${id}/read`, {}, { withCredentials: true });
            setNotifications(notifications.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const getTypeStyle = (type) => {
        switch (type) {
            case 'Submitted':    return { border: 'border-l-violet-500', badge: 'text-violet-300 bg-violet-500/20' };
            case 'Assigned':     return { border: 'border-l-amber-500',  badge: 'text-amber-300 bg-amber-500/20' };
            case 'StatusUpdate': return { border: 'border-l-emerald-500', badge: 'text-emerald-300 bg-emerald-500/20' };
            case 'Feedback':     return { border: 'border-l-cyan-500',   badge: 'text-cyan-300 bg-cyan-500/20' };
            case 'Overdue':      return { border: 'border-l-red-500',    badge: 'text-red-300 bg-red-500/20' };
            default:             return { border: 'border-l-slate-500',  badge: 'text-slate-300 bg-slate-500/20' };
        }
    };

    return (
        <div className="min-h-screen bg-sr-dark">
            <Navbar role="Student" />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
                    <p className="text-slate-400">Stay updated on your complaint statuses and actions.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-16 gap-4">
                        <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                        <p className="text-slate-400 font-medium">Loading notifications…</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-white/[0.03] rounded-3xl border border-white/[0.06]">
                        <span className="text-6xl mb-4">🔔</span>
                        <p className="text-slate-500 font-medium text-lg">No notifications yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {notifications.map(n => {
                            const styles = getTypeStyle(n.notification_type);
                            return (
                                <div
                                    key={n.notification_id}
                                    id={`notif-${n.notification_id}`}
                                    className={`relative p-5 rounded-2xl cursor-pointer transition-all border-l-4 ${styles.border} ${
                                        n.is_read
                                            ? 'bg-white/[0.02] border border-white/[0.04] opacity-60 hover:opacity-100 hover:bg-white/[0.04]'
                                            : 'bg-white/[0.05] border border-white/[0.08] shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                                    }`}
                                    onClick={() => !n.is_read && markAsRead(n.notification_id)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${styles.badge}`}>
                                            {n.notification_type}
                                        </span>
                                        <span className="text-xs font-medium text-slate-500">{new Date(n.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${n.is_read ? 'text-slate-500' : 'text-white font-medium'}`}>
                                        {n.message}
                                    </p>
                                    {!n.is_read && (
                                        <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-violet-500 rounded-full animate-pulse" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
