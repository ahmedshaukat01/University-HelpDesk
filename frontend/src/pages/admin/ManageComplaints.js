import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Landmark, ClipboardList, BarChart, Settings, PlusCircle, Star, Zap, Clock, Users, Building, Wrench, XCircle, CheckCircle } from '../../components/Icons';

const PRIORITY_COLORS = {
  High: 'bg-red-500/20 text-red-400 border border-red-500/30',
  Medium: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  Low: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
};

const STATUS_COLORS = {
  Pending: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'In-Progress': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  Reopened: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export default function ManageComplaints() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');        // 'all' | 'unassigned' | 'assigned' | 'starred'
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [majorIncidents, setMajorIncidents] = useState([]);

  // Filters for Assigned tab
  const [filterDept, setFilterDept] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // History modal
  const [historyModal, setHistoryModal] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Priority update feedback
  const [updatingId, setUpdatingId] = useState(null);
  const [updateMsg, setUpdateMsg] = useState({});

  // Staff members for assignment
  const [allStaff, setAllStaff] = useState([]);

  const fetchAllStaff = async () => {
    try {
      const res = await axios.get('/api/admin/users', { withCredentials: true });
      const staffOnly = res.data.filter(u => u.role === 'Staff' && u.is_active);
      setAllStaff(staffOnly);
    } catch (err) {
      console.error('Error fetching staff list:', err);
    }
  };

  const fetchMajorIncidents = async () => {
    try {
      const res = await axios.get('/api/admin/complaints', { params: { filter: 'all' }, withCredentials: true });
      setMajorIncidents(res.data.filter(c => c.is_major_incident));
    } catch (err) {
      console.error('Error fetching major incidents:', err);
    }
  };

  const handleAssign = async (complaintId, staffId) => {
    setUpdatingId(complaintId);
    try {
      await axios.patch(`/api/admin/complaints/${complaintId}/assign`, { staffId }, { withCredentials: true });
      setUpdateMsg(prev => ({ ...prev, [complaintId]: 'ok' }));
      fetchComplaints(); // refresh to move to assigned tab
    } catch {
      setUpdateMsg(prev => ({ ...prev, [complaintId]: 'err' }));
    } finally {
      setUpdatingId(null);
    }
  };

  // Fetch complaints
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      const effectiveFilter = activeTab === 'starred' ? 'all' : activeTab;

      if (effectiveFilter === 'unassigned') params.filter = 'unassigned';
      else if (effectiveFilter === 'assigned') {
        params.filter = 'assigned';
        if (filterDept) params.departmentId = filterDept;
        if (filterPriority) params.priority = filterPriority;
      }

      const res = await axios.get('/api/admin/complaints', { params, withCredentials: true });
      
      if (activeTab === 'starred') {
        setComplaints(res.data.filter(c => c.is_starred || c.is_major_incident));
      } else {
        setComplaints(res.data);
      }
    } catch (err) {
      setError('Failed to load complaints. ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterDept, filterPriority]);

  useEffect(() => {
    axios.get('/api/departments', { withCredentials: true })
      .then(r => setDepartments(r.data))
      .catch(() => { });
  }, []);

  useEffect(() => {
    fetchComplaints();
    fetchAllStaff();
    fetchMajorIncidents();
  }, [fetchComplaints]);

  // Update complain priority
  const handlePriorityChange = async (complaintId, newPriority) => {
    setUpdatingId(complaintId);
    try {
      await axios.patch(`/api/admin/complaints/${complaintId}/priority`,
        { priority: newPriority }, { withCredentials: true });
      setComplaints(prev => prev.map(c =>
        c.complaint_id === complaintId ? { ...c, priority: newPriority } : c));
      setUpdateMsg(prev => ({ ...prev, [complaintId]: 'ok' }));
      setTimeout(() => setUpdateMsg(prev => { const n = { ...prev }; delete n[complaintId]; return n; }), 2000);
    } catch {
      setUpdateMsg(prev => ({ ...prev, [complaintId]: 'err' }));
      setTimeout(() => setUpdateMsg(prev => { const n = { ...prev }; delete n[complaintId]; return n; }), 2000);
    } finally {
      setUpdatingId(null);
    }
  };

  // Update complain status
  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      await axios.patch(`/api/admin/complaints/${complaintId}/status`,
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

  // Open complaint history 
  const openHistory = async (complaint) => {
    setHistoryModal({ complaintId: complaint.complaint_id, title: complaint.title, history: [] });
    setHistoryLoading(true);
    try {
      const res = await axios.get(`/api/admin/complaints/${complaint.complaint_id}/history`,
        { withCredentials: true });
      setHistoryModal(prev => prev ? { ...prev, history: res.data } : null);
    } catch {
      setHistoryModal(prev => prev ? { ...prev, error: 'Failed to load history.' } : null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleToggleStar = async (complaintId) => {
    try {
      await axios.patch(`/api/admin/complaints/${complaintId}/star`, {}, { withCredentials: true });
      if (activeTab === 'starred') {
        setComplaints(prev => prev.filter(c => c.complaint_id !== complaintId));
      } else {
        setComplaints(prev => prev.map(c =>
          c.complaint_id === complaintId ? { ...c, is_starred: !c.is_starred } : c
        ));
      }
    } catch (err) {
      console.error('Error toggling star:', err);
    }
  };

  const handleMarkMajor = async (complaintId) => {
    try {
      await axios.patch(`/api/admin/complaints/${complaintId}/major-incident`, {}, { withCredentials: true });
      setComplaints(prev => prev.map(c =>
        c.complaint_id === complaintId ? { ...c, is_major_incident: true } : c
      ));
      fetchMajorIncidents(); // Refresh the list for dropdowns
      alert('Marked as Major Incident (STAR)');
    } catch (err) {
      alert('Failed to mark as major incident');
    }
  };

  const handleCluster = async (childId, parentId) => {
    if (!parentId) return;
    try {
      await axios.patch(`/api/admin/complaints/${childId}/cluster`, { parentId }, { withCredentials: true });
      setComplaints(prev => prev.map(c =>
        c.complaint_id === childId ? { ...c, parent_complaint_id: parentId, status: 'In-Progress' } : c
      ));
      alert('Complaint clustered successfully');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cluster complaint');
    }
  };

  const handleLogout = async () => {
    await axios.post('/api/logout', {}, { withCredentials: true });
    navigate('/admin/login');
  };

  return (
        <div className="min-h-screen bg-sr-dark">
            <Navbar role="Admin" />

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Manage Complaints</h1>
            <p className="text-slate-400 text-sm">Review, prioritise, and track all student complaints</p>
          </div>
          <div className="bg-white/[0.05] border border-white/10 px-4 py-1.5 rounded-full shadow-sm">
            <span className="text-amber-400 text-sm font-semibold">{complaints.length} shown</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { id: 'all', label: 'All', Icon: ClipboardList },
            { id: 'unassigned', label: 'Unassigned', Icon: XCircle },
            { id: 'assigned', label: 'Assigned', Icon: CheckCircle },
            { id: 'starred', label: 'Watchlist', Icon: Star }
          ].map(tab => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm ${
                activeTab === tab.id 
                  ? 'bg-amber-500 text-white shadow-md transform scale-105' 
                  : 'bg-white/[0.03] text-slate-400 hover:bg-white/10 border border-white/5'
              }`}
              onClick={() => { setActiveTab(tab.id); setFilterDept(''); setFilterPriority(''); }}
            >
              <tab.Icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Assigned Filters */}
        {activeTab === 'assigned' && (
          <div className="flex flex-wrap items-center gap-4 mb-6 bg-white/[0.03] backdrop-blur-md p-4 rounded-2xl border border-white/[0.06] shadow-sm">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-400">Department</label>
              <select 
                className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none text-white min-w-[150px]"
                value={filterDept} 
                onChange={e => setFilterDept(e.target.value)}
              >
                <option value="" className="bg-gray-900">All Departments</option>
                {departments.map(d => (
                  <option key={d.departmentId} value={d.departmentId} className="bg-gray-900">{d.departmentName}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-400">Priority</label>
              <select 
                className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none text-white min-w-[150px]"
                value={filterPriority} 
                onChange={e => setFilterPriority(e.target.value)}
              >
                <option value="" className="bg-gray-900">All Priorities</option>
                <option value="High" className="bg-gray-900">High</option>
                <option value="Medium" className="bg-gray-900">Medium</option>
                <option value="Low" className="bg-gray-900">Low</option>
              </select>
            </div>

            <button 
              className="text-sm text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              onClick={() => { setFilterDept(''); setFilterPriority(''); }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Error */}
        {error && <div className="mb-6 p-4 bg-red-50/80 border border-red-100 text-red-600 rounded-xl text-sm">{error}</div>}

        {/* List / Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-4">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Loading complaints…</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white/[0.03] backdrop-blur-sm rounded-3xl border border-white/[0.06]">
            <ClipboardList size={64} className="text-slate-700 mb-6" />
            <p className="text-slate-400 font-medium">No complaints found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {complaints.map(c => (
              <ComplaintCard
                key={c.complaint_id}
                c={c}
                updatingId={updatingId}
                updateMsg={updateMsg}
                onPriorityChange={handlePriorityChange}
                onStatusChange={handleStatusChange}
                onHistory={openHistory}
                allStaff={allStaff}
                onAssign={handleAssign}
                onToggleStar={handleToggleStar}
                onMarkMajor={handleMarkMajor}
                onCluster={handleCluster}
                majorIncidents={majorIncidents}
              />
            ))}
          </div>
        )}
      </main>

      {/* History Modal */}
      {historyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sr-surface border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start p-6 border-b border-white/10 bg-white/[0.02] rounded-t-3xl">
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

            <div className="p-6 overflow-y-auto flex-1 bg-white">
              {historyLoading ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm">Loading history…</p>
                </div>
              ) : historyModal.error ? (
                <p className="text-red-400 text-center py-6">{historyModal.error}</p>
              ) : historyModal.history.length === 0 ? (
                <p className="text-slate-400 text-center py-6">No history entries yet.</p>
              ) : (
                <div className="space-y-0">
                  {historyModal.history.map((h, i) => (
                    <div key={h.history_id ?? i} className="flex gap-4 relative pb-8 last:pb-0">
                      {/* Line connecting dots */}
                      {i !== historyModal.history.length - 1 && (
                        <div className="absolute top-6 left-[11px] bottom-0 w-0.5 bg-white/10" />
                      )}
                      
                      <div className="w-6 h-6 rounded-full bg-white/10 border-4 border-sr-surface shadow-sm flex-shrink-0 z-10 flex items-center justify-center mt-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                      </div>
                      
                      <div className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/10 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">{h.action_type}</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {h.change_time ? new Date(h.change_time).toLocaleString() : '—'}
                          </span>
                        </div>
                        
                        {(h.old_status || h.new_status) && (
                          <div className="text-sm font-medium mb-2 flex items-center gap-2">
                            {h.old_status && <span className="text-slate-500 line-through">{h.old_status}</span>}
                            {h.old_status && h.new_status && <span className="text-slate-500">→</span>}
                            {h.new_status && <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{h.new_status}</span>}
                          </div>
                        )}
                        
                        {h.remarks && <p className="text-sm text-slate-300 mb-3 bg-white/[0.03] p-3 rounded-xl border border-white/5">{h.remarks}</p>}
                        
                        <p className="text-xs text-slate-500 font-medium">
                          By: <span className="text-slate-300">{h.changed_by_name || 'Unknown'}</span> <span className="text-slate-500">({h.changed_by_role || '—'})</span>
                        </p>
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
function ComplaintCard({
  c,
  updatingId,
  updateMsg,
  onPriorityChange,
  onStatusChange,
  onHistory,
  allStaff,
  onAssign,
  onToggleStar,
  onMarkMajor,
  onCluster,
  majorIncidents
}) {
  const priClass = PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.Medium;
  const stClass = STATUS_COLORS[c.status] || STATUS_COLORS.Pending;
  const msg = updateMsg[c.complaint_id];

  // Filter staff for THIS complaint's department
  const deptStaff = allStaff.filter(s => Number(s.department_id) === Number(c.department_id));

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-lg rounded-3xl p-6 transition-all hover:shadow-xl hover:-translate-y-1 relative group">
      {/* Top row */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">#{c.complaint_id}</span>
          <button
            className={`transition-transform hover:scale-110 focus:outline-none ${c.is_starred ? 'text-amber-400 drop-shadow-sm' : 'text-slate-500 hover:text-amber-300'}`}
            onClick={() => onToggleStar(c.complaint_id)}
          >
            <Star size={20} fill={c.is_starred ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {c.is_major_incident && <Zap size={18} className="text-amber-400 fill-amber-400 animate-pulse" />}
          <select
            className={`text-xs font-bold border outline-none rounded-full px-3 py-1 cursor-pointer appearance-none text-center shadow-sm ${stClass}`}
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

      {/* Title & category */}
      <h3 className="text-lg font-bold text-white mb-2 leading-tight">{c.title || 'Untitled'}</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs font-semibold text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
          <ClipboardList size={14} /> {c.category_name || 'Uncategorised'}
        </span>
        <span className="text-xs font-semibold text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
          <Building size={14} /> {c.department_name || '—'}
        </span>
      </div>

      {/* Description snippet */}
      {c.description && (
        <p className="text-sm text-slate-400 mb-5 bg-white/[0.05] p-3 rounded-xl border border-white/10 leading-relaxed">
          {c.description.length > 120 ? c.description.slice(0, 120) + '…' : c.description}
        </p>
      )}

      {/* Student & date */}
      <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-5 px-1">
        <span className="flex items-center gap-1.5"><Users size={14} /> {c.student_name || 'Student'}</span>
        <span className="flex items-center gap-1.5"><Clock size={14} /> {c.submission_date ? new Date(c.submission_date).toLocaleDateString() : '—'}</span>
      </div>

      {/* Assigned to / Assignment Control */}
      <div className="mb-5">
        {c.assigned_to_staff_name ? (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center gap-2">
            <Wrench size={16} className="text-blue-400" />
            <p className="text-sm text-blue-300">Assigned to: <strong className="font-bold">{c.assigned_to_staff_name}</strong></p>
          </div>
        ) : c.parent_complaint_id ? (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 flex items-center gap-2">
            <PlusCircle size={16} className="text-purple-400" />
            <p className="text-sm text-purple-300 font-semibold">Clustered with STAR #{c.parent_complaint_id}</p>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-2 block">Unassigned - Assign to:</span>
            <select
              className="w-full bg-white/5 border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm"
              onChange={(e) => onAssign(c.complaint_id, e.target.value)}
              disabled={updatingId === c.complaint_id}
              value=""
            >
              <option value="" disabled className="bg-gray-900">Select Staff...</option>
              {deptStaff.length > 0 ? (
                deptStaff.map(s => (
                  <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>
                ))
              ) : (
                <option disabled className="bg-gray-900">No staff in this department</option>
              )}
            </select>
          </div>
        )}
      </div>

      {/* STAR Clustering Controls */}
      {!c.is_major_incident && !c.parent_complaint_id && (
        <div className="flex gap-2 mb-5">
          <button 
            className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold py-2 rounded-xl transition-colors shadow-sm"
            onClick={() => onMarkMajor(c.complaint_id)}
          >
            Mark as STAR
          </button>
          <select
            className="flex-1 bg-white/5 border border-white/10 text-slate-400 text-xs rounded-xl px-2 py-2 outline-none shadow-sm"
            onChange={(e) => onCluster(c.complaint_id, e.target.value)}
            value=""
          >
            <option value="" disabled className="bg-gray-900">Cluster with...</option>
            {majorIncidents.filter(m => m.complaint_id !== c.complaint_id).map(m => (
              <option key={m.complaint_id} value={m.complaint_id} className="bg-gray-900">STAR #{m.complaint_id}: {m.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Bottom controls: Priority & History */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <select
            className={`text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer shadow-sm ${priClass}`}
            value={c.priority}
            disabled={updatingId === c.complaint_id}
            onChange={e => onPriorityChange(c.complaint_id, e.target.value)}
          >
            <option value="High" className="bg-gray-900">High</option>
            <option value="Medium" className="bg-gray-900">Medium</option>
            <option value="Low" className="bg-gray-900">Low</option>
          </select>
          {msg === 'ok' && <span className="text-xs font-bold text-emerald-400 animate-pulse">✓</span>}
          {msg === 'err' && <span className="text-xs font-bold text-red-400 animate-pulse">✗</span>}
        </div>

        <button 
          className="text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          onClick={() => onHistory(c)}
        >
          <Clock size={14} /> History
        </button>
      </div>
    </div>
  );
}
