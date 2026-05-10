import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { ClipboardList, Star } from '../../components/Icons';

export default function MyComplaints() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [reopenId, setReopenId] = useState(null);
    const [reopenRemarks, setReopenRemarks] = useState('');
    const [reopenLoading, setReopenLoading] = useState(false);

    const [feedbackId, setFeedbackId] = useState(null);
    const [rating, setRating] = useState(5);
    const [comments, setComments] = useState('');
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await axios.get('/api/student/complaints', { withCredentials: true });
            setComplaints(res.data);
        } catch (err) {
            console.error('Error fetching complaints:', err);
            setError('Failed to load your complaints');
        } finally {
            setLoading(false);
        }
    };

    const handleReopen = async (e) => {
        e.preventDefault();
        if (!reopenRemarks.trim()) return alert('Please provide a reason');
        setReopenLoading(true);
        try {
            await axios.post(`/api/student/complaints/${reopenId}/reopen`, { remarks: reopenRemarks }, { withCredentials: true });
            alert('Reopen request submitted successfully. Waiting for admin approval.');
            setReopenId(null);
            setReopenRemarks('');
            fetchComplaints();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to reopen complaint');
        } finally {
            setReopenLoading(false);
        }
    };

    const handleFeedback = async (e) => {
        e.preventDefault();
        setFeedbackLoading(true);
        try {
            await axios.post('/api/student/feedback', { 
                complaintId: feedbackId, 
                rating, 
                comments 
            }, { withCredentials: true });
            alert('Feedback submitted successfully. Thank you!');
            setFeedbackId(null);
            setRating(5);
            setComments('');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit feedback');
        } finally {
            setFeedbackLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending':     return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
            case 'In-Progress': return 'bg-violet-500/20 text-violet-300 border border-violet-500/30';
            case 'Resolved':    return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
            case 'Rejected':    return 'bg-red-500/20 text-red-300 border border-red-500/30';
            case 'Reopened':    return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
            case 'Reopen-Requested': return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
            default:            return 'bg-white/[0.05] text-slate-300 border border-white/10';
        }
    };

    return (
        <div className="min-h-screen bg-sr-dark">
            <Navbar role="Student" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">My Complaints</h2>
                    <p className="text-slate-400">Track the status of your submitted issues.</p>
                </div>

                {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{error}</div>}

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-16 gap-4">
                        <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                        <p className="text-slate-400 font-medium">Loading complaints…</p>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-white/[0.03] rounded-3xl border border-white/[0.06]">
                        <ClipboardList size={64} className="text-slate-700 mb-6" />
                        <p className="text-slate-400 font-medium text-lg mb-6">You haven't submitted any complaints yet.</p>
                        <button 
                            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 transition-all"
                            onClick={() => navigate('/student/submit-complaint')}
                        >
                            Submit Your First Complaint
                        </button>
                    </div>
                ) : (
                    <div className="bg-white/[0.03] border border-violet-500/20 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.04] border-b border-white/[0.06]">
                                        <th className="p-4 text-sm font-semibold text-slate-400">ID</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Title</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Department</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Category</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Status</th>
                                        <th className="p-4 text-sm font-semibold text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {complaints.map(complaint => (
                                        <tr key={complaint.complaint_id} className="hover:bg-white/[0.04] transition-colors">
                                            <td className="p-4 text-sm font-bold text-violet-400">#{complaint.complaint_id}</td>
                                            <td className="p-4 text-sm font-bold text-white">{complaint.title}</td>
                                            <td className="p-4 text-sm text-slate-400 font-medium">{complaint.department_name}</td>
                                            <td className="p-4 text-sm text-slate-400">{complaint.category_name || 'N/A'}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusStyle(complaint.status)}`}>
                                                    {complaint.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2 items-center">
                                                    {(complaint.status === 'Resolved' || complaint.status === 'Rejected') && (
                                                        <button 
                                                            className="px-3 py-1.5 border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 rounded-lg text-xs font-semibold transition-colors"
                                                            onClick={() => setReopenId(complaint.complaint_id)}
                                                        >
                                                            Reopen
                                                        </button>
                                                    )}
                                                    {complaint.status === 'Reopen-Requested' && (
                                                        <span className="text-xs font-semibold italic text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">Pending Approval</span>
                                                    )}
                                                    {complaint.status === 'Resolved' && (
                                                        <button 
                                                            className="px-3 py-1.5 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                                                            onClick={() => setFeedbackId(complaint.complaint_id)}
                                                        >
                                                            <Star size={14} className="text-amber-400" fill="currentColor" /> Feedback
                                                        </button>
                                                    )}
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

            {/* Reopen Modal */}
            {reopenId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-sr-surface border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-1">Reopen Complaint #{reopenId}</h3>
                        <p className="text-sm text-slate-400 mb-6">Please provide a reason for reopening this complaint.</p>
                        <form onSubmit={handleReopen} className="flex flex-col gap-4">
                            <textarea 
                                className="w-full bg-white/[0.05] border border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl p-4 outline-none transition-all text-white resize-none min-h-[120px]"
                                value={reopenRemarks}
                                onChange={(e) => setReopenRemarks(e.target.value)}
                                placeholder="Reason for reopening..."
                                required
                            />
                            <div className="flex justify-end gap-3 mt-2">
                                <button type="button" className="px-5 py-2.5 bg-white/[0.05] hover:bg-white/10 text-slate-300 rounded-xl font-medium transition-colors" onClick={() => setReopenId(null)}>Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold shadow-md transition-colors disabled:opacity-70" disabled={reopenLoading}>
                                    {reopenLoading ? 'Reopening...' : 'Confirm Reopen'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {feedbackId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-sr-surface border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-1">Share Your Feedback</h3>
                        <p className="text-sm text-slate-400 mb-6">How would you rate the resolution of complaint #{feedbackId}?</p>
                        <form onSubmit={handleFeedback} className="flex flex-col gap-4">
                            <div className="flex justify-center gap-2 mb-2">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button 
                                        key={num}
                                        type="button"
                                        className={`transition-transform hover:scale-110 focus:outline-none drop-shadow-sm`}
                                        onClick={() => setRating(num)}
                                    >
                                        <Star size={32} fill={num <= rating ? 'currentColor' : 'none'} className={num <= rating ? 'text-amber-400' : 'text-slate-600'} />
                                    </button>
                                ))}
                            </div>
                            <textarea 
                                className="w-full bg-white/[0.05] border border-white/10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl p-4 outline-none transition-all text-white resize-none min-h-[100px]"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Your comments (optional)..."
                            />
                            <div className="flex justify-end gap-3 mt-2">
                                <button type="button" className="px-5 py-2.5 bg-white/[0.05] hover:bg-white/10 text-slate-300 rounded-xl font-medium transition-colors" onClick={() => setFeedbackId(null)}>Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold shadow-md transition-colors disabled:opacity-70" disabled={feedbackLoading}>
                                    {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
