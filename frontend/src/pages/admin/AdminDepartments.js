import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function AdminDepartments() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    useEffect(() => { fetchDepartments(); }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/departments');
            setDepartments(res.data);
            setError(null);
        } catch (err) {
            setError('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (dept) => { setEditingId(dept.departmentId); setEditName(dept.departmentName); };
    const handleCancelEdit = () => { setEditingId(null); setEditName(''); };

    const handleSaveEdit = async (id) => {
        if (!editName.trim()) { alert('Department name cannot be empty'); return; }
        try {
            await axios.patch(`/api/admin/departments/${id}`, { name: editName }, { withCredentials: true });
            setDepartments(departments.map(d => d.departmentId === id ? { ...d, departmentName: editName.trim() } : d));
            setEditingId(null);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update department');
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
        <div className="min-h-screen bg-sr-dark">
            <Navbar role="Admin" />
            <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-1">Manage Departments</h1>
                    <p className="text-slate-400 text-sm">View and edit department names.</p>
                </div>

                {error && <p className="text-red-400 text-sm mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">{error}</p>}

                <div className="bg-white/[0.03] border border-amber-500/20 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.04] border-b border-white/[0.06]">
                                    <th className="p-4 text-sm font-semibold text-slate-400">ID</th>
                                    <th className="p-4 text-sm font-semibold text-slate-400">Department Name</th>
                                    <th className="p-4 text-sm font-semibold text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {departments.map(dept => (
                                    <tr key={dept.departmentId} className="hover:bg-white/[0.04] transition-colors">
                                        <td className="p-4 text-sm text-slate-400 font-medium">{dept.departmentId}</td>
                                        <td className="p-4">
                                            {editingId === dept.departmentId ? (
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full max-w-sm bg-white/[0.05] border border-white/10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-lg px-3 py-2 outline-none transition-all text-white"
                                                />
                                            ) : (
                                                <span className="text-sm text-white">{dept.departmentName}</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {editingId === dept.departmentId ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                                                        onClick={() => handleSaveEdit(dept.departmentId)}
                                                    >Save</button>
                                                    <button
                                                        className="px-4 py-2 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                                                        onClick={handleCancelEdit}
                                                    >Cancel</button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 rounded-lg text-sm font-medium transition-colors"
                                                    onClick={() => handleEditClick(dept)}
                                                >Edit</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {departments.length === 0 && <p className="text-center p-8 text-slate-500 text-sm">No departments found.</p>}
                </div>
            </div>
        </div>
    );
}
