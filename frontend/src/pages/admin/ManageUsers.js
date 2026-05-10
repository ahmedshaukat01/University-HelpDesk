import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ManageUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [activeTab, setActiveTab] = useState('Student');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        role: 'Student', name: '', email: '', password: '', phone: '', departmentId: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/users', { withCredentials: true });
            setUsers(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await axios.get('/api/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error('Failed to fetch departments', err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    const filteredUsers = users.filter(u => u.role === activeTab);

    const handleDeactivate = async (id, role) => {
        if (!window.confirm(`Are you sure you want to deactivate this ${role}?`)) return;
        try {
            await axios.delete(`/api/admin/users/${id}?role=${role}`, { withCredentials: true });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to deactivate user');
        }
    };

    const handleActivate = async (id, role) => {
        if (!window.confirm(`Are you sure you want to activate this ${role}?`)) return;
        try {
            await axios.patch(`/api/admin/users/${id}/activate?role=${role}`, {}, { withCredentials: true });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to activate user');
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);
        try {
            await axios.post('/api/admin/users', formData, { withCredentials: true });
            setShowAddForm(false);
            setFormData({ role: activeTab, name: '', email: '', password: '', phone: '', departmentId: '' });
            fetchUsers();
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.error || 'Failed to add user');
        } finally {
            setFormLoading(false);
        }
    };

    const inputClass = "w-full bg-white/[0.05] border border-white/10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-2.5 outline-none transition-all text-white placeholder-slate-500";

    return (
        <div className="min-h-screen bg-sr-dark p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-1">Manage Users</h2>
                        <p className="text-slate-400">View and manage system users</p>
                    </div>
                    <button 
                        className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-sm font-medium transition-colors"
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        ← Dashboard
                    </button>
                </div>

                {error && <p className="text-red-400 text-sm mb-6 bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>}

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                    <button 
                        className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === 'Student' ? 'bg-amber-500 text-white shadow-md' : 'bg-white/[0.03] text-slate-400 hover:bg-white/10 border border-white/5'}`}
                        onClick={() => { setActiveTab('Student'); setShowAddForm(false); setFormData(prev => ({...prev, role: 'Student'})); }}
                    >
                        Students
                    </button>
                    <button 
                        className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === 'Staff' ? 'bg-amber-500 text-white shadow-md' : 'bg-white/[0.03] text-slate-400 hover:bg-white/10 border border-white/5'}`}
                        onClick={() => { setActiveTab('Staff'); setShowAddForm(false); setFormData(prev => ({...prev, role: 'Staff'})); }}
                    >
                        Staff
                    </button>
                </div>

                {/* Action Bar */}
                <div className="flex justify-end mb-6">
                    <button 
                        className={`px-6 py-2 rounded-xl font-medium text-white shadow-md transition-colors ${showAddForm ? 'bg-white/10 hover:bg-white/20' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            setFormData(prev => ({ ...prev, role: activeTab }));
                        }}
                    >
                        {showAddForm ? 'Cancel' : `+ Add ${activeTab}`}
                    </button>
                </div>

                {/* Add Form */}
                {showAddForm && (
                    <div className="bg-white/[0.03] border border-amber-500/20 shadow-lg rounded-2xl p-6 mb-8 transition-all">
                        <h3 className="text-xl font-bold text-white mb-4">Add New {activeTab}</h3>
                        {formError && <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{formError}</p>}
                        
                        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className={inputClass} />
                            <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className={inputClass} />
                            <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className={inputClass} />
                            <input type="text" placeholder="Phone (11 digits)" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
                            <select value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} required={activeTab === 'Staff'} className={`${inputClass} appearance-none`}>
                                <option value="" className="bg-gray-900">{activeTab === 'Staff' ? 'Select Department (Required)' : 'Select Department (Optional)'}</option>
                                {departments.map(d => <option key={d.departmentId} value={d.departmentId} className="bg-gray-900">{d.departmentName}</option>)}
                            </select>
                            <button type="submit" disabled={formLoading} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-white shadow-md rounded-xl font-semibold transition-all duration-300 disabled:opacity-70">
                                {formLoading ? 'Adding...' : 'Add User'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-400 font-medium">Loading users...</p>
                    </div>
                ) : (
                    <div className="bg-white/[0.03] border border-amber-500/20 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.04] border-b border-white/[0.06]">
                                        <th className="p-4 text-sm font-semibold text-slate-400">Name</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Email</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Department</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Phone</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Status</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-slate-500 text-sm">No users found.</td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-white/[0.04] transition-colors">
                                                <td className="p-4 text-sm font-medium text-white">{user.name}</td>
                                                <td className="p-4 text-sm text-slate-400">{user.email}</td>
                                                <td className="p-4 text-sm text-slate-400">{user.department_name || 'N/A'}</td>
                                                <td className="p-4 text-sm text-slate-400">{user.phone || 'N/A'}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                                        {user.is_active ? 'Active' : 'Deactivated'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {user.is_active ? (
                                                        <button 
                                                            className="px-4 py-1.5 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors"
                                                            onClick={() => handleDeactivate(user.id, user.role)}
                                                        >
                                                            Deactivate
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            className="px-4 py-1.5 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium transition-colors"
                                                            onClick={() => handleActivate(user.id, user.role)}
                                                        >
                                                            Activate
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
