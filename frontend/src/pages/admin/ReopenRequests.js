import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Landmark, CheckCircle } from '../../components/Icons';

export default function ReopenRequests() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await axios.get('/api/admin/reopen-requests', { withCredentials: true });
            setRequests(res.data);
        } catch (err) {
            console.error('Error fetching reopen requests:', err);
            setError('Failed to load reopen requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this reopen request?`)) return;
        
        setProcessingId(id);
        try {
            await axios.post(`/api/admin/reopen-requests/${id}/handle`, { action }, { withCredentials: true });
            alert(`Request ${action}d successfully`);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to process request');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-sr-dark">
            <Navbar role="Admin" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Reopen Requests</h1>
                    <p className="text-slate-400">Review and approve/reject student requests to reopen resolved complaints.</p>
                </div>

                {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{error}</div>}

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-16 gap-4">
                        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                        <p className="text-slate-400 font-medium">Loading requests…</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-white/[0.03] rounded-3xl border border-white/[0.06]">
                        <CheckCircle size={48} className="text-emerald-500/50 mb-4" />
                        <p className="text-slate-400 font-medium text-lg">No pending reopen requests.</p>
                    </div>
                ) : (
                    <div className="bg-white/[0.03] border border-amber-500/20 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.04] border-b border-white/[0.06]">
                                        <th className="p-4 text-sm font-semibold text-slate-400">ID</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Student</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Complaint Title</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Reason for Reopen</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Requested At</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {requests.map(req => (
                                        <tr key={req.complaint_id} className="hover:bg-white/[0.04] transition-colors">
                                            <td className="p-4 text-sm font-bold text-amber-400">#{req.complaint_id}</td>
                                            <td className="p-4 text-sm text-slate-300 font-medium">{req.student_name}</td>
                                            <td className="p-4 text-sm text-white font-bold">{req.title}</td>
                                            <td className="p-4 text-sm text-slate-400 max-w-xs">{req.reason}</td>
                                            <td className="p-4 text-sm text-slate-500">{new Date(req.requested_at).toLocaleString()}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button 
                                                        className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-50"
                                                        onClick={() => handleAction(req.complaint_id, 'Approve')}
                                                        disabled={processingId === req.complaint_id}
                                                    >
                                                        {processingId === req.complaint_id ? '...' : 'Approve'}
                                                    </button>
                                                    <button 
                                                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-50"
                                                        onClick={() => handleAction(req.complaint_id, 'Reject')}
                                                        disabled={processingId === req.complaint_id}
                                                    >
                                                        {processingId === req.complaint_id ? '...' : 'Reject'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
