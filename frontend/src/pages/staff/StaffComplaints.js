import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Landmark, ClipboardList, Clock, Users, Building, Mail, CheckCircle, XCircle } from '../../components/Icons';

const PRIORITY_COLORS = {
  High: 'bg-red-500/20 text-red-400 border border-red-500/30',
  Medium: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  Low: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
};

const STATUS_COLORS = {
  Pending: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'In-Progress': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Resolved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  Reopened: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

export default function StaffComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [historyModal, setHistoryModal] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await axios.get('/api/staff/complaints', { params, withCredentials: true });
      setComplaints(res.data);
    } catch (err) {
      setError('Failed to load assigned complaints. ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleLogout = async () => {
    await axios.post('/api/logout', {}, { withCredentials: true });
    navigate('/login');
  };

  const [updatingId, setUpdatingId] = useState(null);
  const [updateMsg, setUpdateMsg] = useState({});

  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      await axios.patch(`/api/staff/complaints/${complaintId}/status`,
        { status: newStatus }, { withCredentials: true });
      setComplaints(prev => prev.map(c =>
        c.complaint_id === complaintId ? { ...c, status: newStatus } : c));
      setUpdateMsg(prev => ({ ...prev, [complaintId]: 'ok' }));
      setTimeout(() => setUpdateMsg(prev => { const n = { ...prev }; delete n[complaintId]; return n; }), 2000);
    } catch {
      setUpdateMsg(prev => ({ ...prev, [complaintId]: 'err' }));
      setTimeout(() => setUpdateMsg(prev => { const n = { ...prev }; delete n[complaintId]; return n; }), 2000);
    } finally {
      setUpdatingId(null);
    }
  };

  const openHistory = async (complaint) => {
    setHistoryModal({ complaintId: complaint.complaint_id, title: complaint.title, history: [] });
    setHistoryLoading(true);
    try {
      const res = await axios.get(`/api/staff/complaints/${complaint.complaint_id}/history`,
        { withCredentials: true });
      setHistoryModal(prev => prev ? { ...prev, history: res.data } : null);
    } catch {
      setHistoryModal(prev => prev ? { ...prev, error: 'Failed to load history.' } : null);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sr-dark">
      {/* Navbar */}
      <nav className="bg-white/[0.03] backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={async () => {
                      await axios.post('/api/logout', {}, { withCredentials: true });
                      navigate('/');
                  }}>
                      <span className="text-xl">🏛️</span>
                      <span className="text-lg font-bold text-white tracking-tight">Smart<span className="text-emerald-400">Resolve</span></span>
                  </div>
                  <div className="hidden md:flex gap-2">
                    <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/10 transition-colors" onClick={() => navigate('/staff/dashboard')}>Dashboard</button>
                    <button className="px-4 py-2 rounded-lg text-sm font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">Assigned Complaints</button>
                  </div>
                  <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 text-sm font-medium rounded-full border border-emerald-500/20">Staff</span>
                      <button onClick={handleLogout} className="text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">Logout</button>
                  </div>
              </div>
          </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Assigned Complaints</h1>
            <p className="text-slate-400 text-sm">View the complaints currently assigned to you for resolution.</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
            <span className="text-emerald-300 text-sm font-semibold">{complaints.length} assigned</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.06]">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-400">Status Filter:</label>
            <select
              className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none text-white min-w-[150px]"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="" className="bg-gray-900">All Statuses</option>
              <option value="Pending" className="bg-gray-900">Pending</option>
              <option value="In-Progress" className="bg-gray-900">In-Progress</option>
              <option value="Resolved" className="bg-gray-900">Resolved</option>
              <option value="Rejected" className="bg-gray-900">Rejected</option>
              <option value="Reopened" className="bg-gray-900">Reopened</option>
            </select>
          </div>
          <button
            className="text-sm text-slate-400 hover:text-red-400 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            onClick={() => setFilterStatus('')}
          >
            Clear Filters
          </button>
        </div>

        {/* Error */}
        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{error}</div>}

        {/* List / Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-4">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Loading assigned complaints…</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white/[0.03] rounded-3xl border border-white/[0.06]">
            <ClipboardList size={64} className="text-slate-700 mb-6" />
            <p className="text-slate-500 font-medium">You have no assigned complaints for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {complaints.map(c => (
              <ComplaintCard 
                key={c.complaint_id} 
                c={c} 
                updatingId={updatingId}
                updateMsg={updateMsg}
                onStatusChange={handleStatusChange} 
                onHistory={openHistory}
              />
            ))}
          </div>
        )}
      </main>

      {/* History Modal */}
      {historyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sr-surface border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start p-6 border-b border-white/[0.06] rounded-t-3xl">
              <div>
                <h2 className="text-xl font-bold text-white">Complaint History</h2>
                <p className="text-sm text-slate-400 mt-1">{historyModal.title}</p>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 transition-colors"
                onClick={() => setHistoryModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {historyLoading ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm">Loading history…</p>
                </div>
              ) : historyModal.error ? (
                <p className="text-red-400 text-center py-6">{historyModal.error}</p>
              ) : historyModal.history.length === 0 ? (
                <p className="text-slate-500 text-center py-6">No history entries yet.</p>
              ) : (
                <div className="space-y-0">
                  {historyModal.history.map((h, i) => (
                    <div key={h.history_id ?? i} className="flex gap-4 relative pb-8 last:pb-0">
                      {i !== historyModal.history.length - 1 && (
                        <div className="absolute top-6 left-[11px] bottom-0 w-0.5 bg-emerald-500/20" />
                      )}
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex-shrink-0 z-10 flex items-center justify-center mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">{h.action_type}</span>
                          <span className="text-xs text-slate-500 font-medium">{h.change_time ? new Date(h.change_time).toLocaleString() : '—'}</span>
                        </div>
                        {(h.old_status || h.new_status) && (
                          <div className="text-sm font-medium mb-2 flex items-center gap-2">
                            {h.old_status && <span className="text-slate-500 line-through">{h.old_status}</span>}
                            {h.old_status && h.new_status && <span className="text-slate-600">→</span>}
                            {h.new_status && <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{h.new_status}</span>}
                          </div>
                        )}
                        {h.remarks && <p className="text-sm text-slate-400 mb-3 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">{h.remarks}</p>}
                        <p className="text-xs text-slate-500 font-medium">By: <span className="text-slate-300">{h.changed_by_name || 'Unknown'}</span> <span className="text-slate-600">({h.changed_by_role || '—'})</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Complaint Card Component ──────────────────────────────────────────────────
function ComplaintCard({ c, updatingId, updateMsg, onStatusChange, onHistory }) {
  const priClass = PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.Medium;
  const stClass = STATUS_COLORS[c.status] || STATUS_COLORS.Pending;
  const msg = updateMsg[c.complaint_id];

  return (
    <div className="bg-white/[0.03] border border-emerald-500/20 rounded-3xl p-6 transition-all hover:bg-white/[0.06] hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 flex flex-col h-full">
      {/* Top row */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">#{c.complaint_id}</span>
            {c.is_new === 1 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">NEW</span>}
        </div>

        <div className="flex items-center gap-2">
          {msg === 'ok' && <span className="text-xs font-bold text-emerald-400 animate-pulse">✓</span>}
          {msg === 'err' && <span className="text-xs font-bold text-red-400 animate-pulse">✗</span>}
          <select
            className={`text-xs font-bold border outline-none rounded-full px-3 py-1 cursor-pointer appearance-none text-center ${stClass}`}
            value={c.status}
            disabled={updatingId === c.complaint_id}
            onChange={e => onStatusChange(c.complaint_id, e.target.value)}
          >
            <option value="Pending" className="bg-gray-900">Pending</option>
            <option value="In-Progress" className="bg-gray-900">In-Progress</option>
            <option value="Resolved" className="bg-gray-900">Resolved</option>
            <option value="Rejected" className="bg-gray-900">Rejected</option>
            <option value="Reopened" className="bg-gray-900">Reopened</option>
          </select>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 leading-tight">{c.title || 'Untitled'}</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs font-semibold text-slate-400 bg-white/[0.05] px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
          <ClipboardList size={14} /> {c.category_name || 'Uncategorised'}
        </span>
        <span className="text-xs font-semibold text-slate-400 bg-white/[0.05] px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
          <Building size={14} /> {c.department_name || '—'}
        </span>
      </div>

      {c.description && (
        <p className="text-sm text-slate-400 mb-5 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06] leading-relaxed flex-1">
          {c.description}
        </p>
      )}

      <div className="mt-auto">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4">
            <div className="flex justify-between items-center text-xs font-medium text-slate-400 mb-2">
                <span className="flex items-center gap-1.5"><Users size={14} /> {c.student_name || 'Student'}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} /> Assigned: {c.assignment_date ? new Date(c.assignment_date).toLocaleDateString() : '—'}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5 truncate"><Mail size={14} /> {c.student_email}</span>
                {c.deadline && <span className="flex items-center gap-1.5 text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-md"><Clock size={14} /> {new Date(c.deadline).toLocaleDateString()}</span>}
            </div>
        </div>

        <div className="flex items-center justify-between pt-2">
            <span className={`text-xs font-bold rounded-lg px-2.5 py-1.5 ${priClass}`}>
                Priority: {c.priority}
            </span>
            <button
                className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                onClick={() => onHistory(c)}
            >
                <Clock size={14} /> History
            </button>
        </div>
      </div>
    </div>
  );
}

