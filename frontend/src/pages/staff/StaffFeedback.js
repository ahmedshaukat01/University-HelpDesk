import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ClipboardList } from '../../components/Icons';

export default function StaffFeedback() {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await axios.get('/api/staff/feedback', { withCredentials: true });
                setFeedback(res.data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch feedback.');
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    const renderStars = (rating) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(num => (
                <Star key={num} size={14} fill={num <= rating ? 'currentColor' : 'none'} className={num <= rating ? 'text-amber-400' : 'text-slate-600'} />
            ))}
        </div>
    );

    if (loading) return (
        <div className="min-h-screen bg-sr-dark flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-slate-400 font-medium">Loading feedback...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-sr-dark p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Student Feedback</h1>
                        <p className="text-slate-400 text-sm">Ratings and comments from students you helped.</p>
                    </div>
                    <button
                        id="feedback-back-btn"
                        className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl font-medium transition-colors"
                        onClick={() => navigate('/staff/dashboard')}
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {error && <p className="text-red-400 text-sm mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">{error}</p>}

                {feedback.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-white/[0.03] border border-white/[0.06] rounded-3xl">
                        <ClipboardList size={64} className="text-slate-700 mb-6" />
                        <p className="text-slate-500 font-medium text-lg">No feedback received yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {feedback.map((f) => (
                            <div key={f.feedback_id} className="bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/[0.06] transition-all hover:shadow-lg hover:shadow-emerald-500/10">
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="text-lg font-bold text-white leading-tight">{f.complaint_title}</h3>
                                    <span className="text-sm shrink-0">{renderStars(f.rating)}</span>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex-1">
                                    <p className="text-slate-300 italic text-sm leading-relaxed">"{f.comments}"</p>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/[0.06] mt-auto">
                                    <span className="text-sm font-semibold text-emerald-400">— {f.student_name}</span>
                                    <span className="text-xs font-medium text-slate-500 bg-white/5 px-2 py-1 rounded-md">{new Date(f.feedback_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
