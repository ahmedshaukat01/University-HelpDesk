import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        <div style={styles.page}>
            <div style={styles.navbar}>
                <span style={styles.logo} onClick={() => navigate('/admin/dashboard')}>SmartResolve Admin</span>
                <button style={styles.backBtn} onClick={() => navigate('/admin/dashboard')}>Back to Dashboard</button>
            </div>

            <div style={styles.content}>
                <div style={styles.header}>
                    <h2 style={styles.heading}>Reopen Requests</h2>
                    <p style={styles.sub}>Review and approve/reject student requests to reopen resolved complaints.</p>
                </div>

                {loading ? (
                    <div style={styles.loading}>Loading requests...</div>
                ) : error ? (
                    <div style={styles.error}>{error}</div>
                ) : requests.length === 0 ? (
                    <div style={styles.empty}>
                        <p>No pending reopen requests.</p>
                    </div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Student</th>
                                    <th style={styles.th}>Complaint Title</th>
                                    <th style={styles.th}>Reason for Reopen</th>
                                    <th style={styles.th}>Requested At</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req.complaint_id} style={styles.tableRow}>
                                        <td style={styles.td}>#{req.complaint_id}</td>
                                        <td style={styles.td}>{req.student_name}</td>
                                        <td style={{...styles.td, fontWeight: '500'}}>{req.title}</td>
                                        <td style={styles.td}>{req.reason}</td>
                                        <td style={styles.td}>{new Date(req.requested_at).toLocaleString()}</td>
                                        <td style={{...styles.td, display: 'flex', gap: '8px'}}>
                                            <button 
                                                style={styles.approveBtn}
                                                onClick={() => handleAction(req.complaint_id, 'Approve')}
                                                disabled={processingId === req.complaint_id}
                                            >
                                                {processingId === req.complaint_id ? '...' : 'Approve'}
                                            </button>
                                            <button 
                                                style={styles.rejectBtn}
                                                onClick={() => handleAction(req.complaint_id, 'Reject')}
                                                disabled={processingId === req.complaint_id}
                                            >
                                                {processingId === req.complaint_id ? '...' : 'Reject'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', fontFamily: "'Inter', sans-serif" },
    navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#1e293b', borderBottom: '1px solid #334155' },
    logo: { fontSize: '18px', fontWeight: '700', color: '#f59e0b', cursor: 'pointer' },
    backBtn: { padding: '8px 16px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
    content: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '2rem' },
    heading: { fontSize: '24px', fontWeight: '600', margin: '0 0 6px' },
    sub: { color: '#94a3b8', fontSize: '14px', margin: 0 },
    loading: { textAlign: 'center', padding: '3rem', color: '#94a3b8' },
    error: { padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' },
    empty: { textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', color: '#94a3b8' },
    tableContainer: { backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    tableHeader: { backgroundColor: '#0f172a' },
    th: { padding: '1rem', fontSize: '13px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tableRow: { borderBottom: '1px solid #334155', transition: 'background-color 0.2s' },
    td: { padding: '1rem', fontSize: '14px', color: '#f1f5f9' },
    approveBtn: { padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    rejectBtn: { padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }
};
