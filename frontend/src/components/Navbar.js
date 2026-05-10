import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Landmark, Bell, LogOut, Menu, X, Settings, ClipboardList, PlusCircle, BarChart, Users, Building } from './Icons';

export default function Navbar({ role }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const endpoint = role === 'Admin' ? '/api/admin/notifications' : 
                           role === 'Staff' ? '/api/staff/notifications' : 
                           '/api/student/notifications';
            const res = await axios.get(endpoint, { withCredentials: true });
            setNotifications(res.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    }, [role]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAsRead = async (id) => {
        try {
            const endpoint = role === 'Admin' ? `/api/admin/notifications/${id}/read` : 
                           role === 'Staff' ? `/api/staff/notifications/${id}/read` : 
                           `/api/student/notifications/${id}/read`;
            await axios.patch(endpoint, {}, { withCredentials: true });
            setNotifications(notifications.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleLogout = async () => {
        await axios.post('/api/logout', {}, { withCredentials: true });
        navigate(role === 'Admin' ? '/admin/login' : '/login');
    };

    const getLinks = () => {
        if (role === 'Student') {
            return [
                { name: 'Dashboard', path: '/student/dashboard', icon: Landmark },
                { name: 'Submit Complaint', path: '/student/submit-complaint', icon: PlusCircle },
                { name: 'My Complaints', path: '/student/my-complaints', icon: ClipboardList },
                { name: 'Profile', path: '/student/profile', icon: Settings },
            ];
        } else if (role === 'Staff') {
            return [
                { name: 'Dashboard', path: '/staff/dashboard', icon: Landmark },
                { name: 'Assigned', path: '/staff/complaints', icon: ClipboardList },
                { name: 'Feedback', path: '/staff/feedback', icon: BarChart },
                { name: 'Profile', path: '/staff/profile', icon: Settings },
            ];
        } else if (role === 'Admin') {
            return [
                { name: 'Dashboard', path: '/admin/dashboard', icon: Landmark },
                { name: 'Complaints', path: '/admin/complaints', icon: ClipboardList },
                { name: 'Users', path: '/admin/users', icon: Users },
                { name: 'Reports', path: '/admin/reports', icon: BarChart },
                { name: 'Departments', path: '/admin/departments', icon: Building },
                { name: 'Reopen', path: '/admin/reopen-requests', icon: PlusCircle },
                { name: 'Profile', path: '/admin/profile', icon: Settings },
            ];
        }
        return [];
    };

    const links = getLinks();
    const roleColors = {
        Student: 'violet',
        Staff: 'emerald',
        Admin: 'amber'
    };
    const accent = roleColors[role] || 'violet';

    return (
        <nav className="bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Section */}
                    <div 
                        className="flex-shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all text-white"
                        onClick={() => navigate(role === 'Admin' ? '/admin/dashboard' : role === 'Staff' ? '/staff/dashboard' : '/student/dashboard')}
                    >
                        <Landmark size={24} className={`text-${accent}-400`} />
                        <span className="text-lg font-bold tracking-tight">
                            Smart<span className={`text-${accent}-400`}>Resolve</span>
                        </span>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden lg:flex items-center gap-1 ml-6">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                        isActive 
                                        ? `bg-${accent}-500/10 text-${accent}-400` 
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    setMobileMenuOpen(false);
                                }}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors relative text-slate-400 hover:text-white"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-[#0a0a0c]">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-[#121217] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeSlideIn">
                                    <div className="px-4 py-3 border-b border-white/[0.06] flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                                        <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-slate-300 transition-colors">✕</button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <div className="text-3xl mb-2 opacity-20">🔔</div>
                                                <p className="text-sm text-slate-500">No notifications yet</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-white/[0.04]">
                                                {notifications.map(n => (
                                                    <div
                                                        key={n.notification_id}
                                                        onClick={() => !n.is_read && handleMarkAsRead(n.notification_id)}
                                                        className={`p-4 transition-colors cursor-pointer ${n.is_read ? 'hover:bg-white/5' : `bg-${accent}-500/10 hover:bg-${accent}-500/15 border-l-4 border-${accent}-500`}`}
                                                    >
                                                        <p className={`text-sm mb-1 ${n.is_read ? 'text-slate-400' : 'text-white font-medium'}`}>{n.message}</p>
                                                        <p className="text-[10px] uppercase tracking-wider text-slate-600">{new Date(n.created_at).toLocaleString()}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Role Badge & Logout */}
                        <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-white/10">
                            <span className={`px-2.5 py-1 bg-${accent}-500/10 text-${accent}-300 text-[10px] font-black uppercase tracking-widest rounded-lg border border-${accent}-500/20`}>
                                {role}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => {
                                setMobileMenuOpen(!mobileMenuOpen);
                                setShowNotifications(false);
                            }}
                            className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-[#0f0f13] border-b border-white/10 animate-fadeSlideIn">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                                        isActive 
                                        ? `bg-${accent}-500/20 text-${accent}-400` 
                                        : 'text-slate-400 hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={20} />
                                    {link.name}
                                </Link>
                            );
                        })}
                        <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-center px-4">
                             <span className={`px-3 py-1 bg-${accent}-500/10 text-${accent}-300 text-xs font-bold uppercase tracking-widest rounded-lg`}>
                                {role}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-red-400 bg-red-500/10 rounded-xl font-bold"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
