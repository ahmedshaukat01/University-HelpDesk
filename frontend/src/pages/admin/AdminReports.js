import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/admin/reports/departments', { withCredentials: true });
      setReports(res.data);
    } catch (err) {
      setError('Failed to load reports. ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };


    return (
        <div className="min-h-screen bg-sr-dark">
            <Navbar role="Admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Department Reports</h1>
          <p className="text-slate-400">Performance and resolution statistics by department</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{error}</div>}

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-4">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Loading reports…</p>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-amber-500/20 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.04] border-b border-white/[0.06]">
                    <th className="p-4 text-sm font-semibold text-slate-400">Department</th>
                    <th className="p-4 text-sm font-semibold text-slate-400 text-center">Total</th>
                    <th className="p-4 text-sm font-semibold text-slate-400 text-center">Pending</th>
                    <th className="p-4 text-sm font-semibold text-slate-400 text-center">In-Progress</th>
                    <th className="p-4 text-sm font-semibold text-slate-400 text-center">Resolved</th>
                    <th className="p-4 text-sm font-semibold text-slate-400 text-center">Rejected</th>
                    <th className="p-4 text-sm font-semibold text-slate-400 text-center">Reopened</th>
                    <th className="p-4 text-sm font-semibold text-slate-400 text-center">Resolution %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500 text-sm">No data available</td>
                    </tr>
                  ) : (
                    reports.map((r, i) => (
                      <tr key={r.department_id || i} className="hover:bg-white/[0.04] transition-colors">
                        <td className="p-4 text-sm font-semibold text-white">{r.department_name}</td>
                        <td className="p-4 text-sm text-center font-bold text-white">{r.total_complaints}</td>
                        <td className="p-4 text-sm text-center font-medium text-violet-400">{r.pending_complaints}</td>
                        <td className="p-4 text-sm text-center font-medium text-amber-400">{r.in_progress_complaints}</td>
                        <td className="p-4 text-sm text-center font-medium text-emerald-400">{r.resolved_complaints}</td>
                        <td className="p-4 text-sm text-center font-medium text-red-400">{r.rejected_complaints}</td>
                        <td className="p-4 text-sm text-center font-medium text-orange-400">{r.reopened_complaints}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  r.resolution_percentage >= 75 ? 'bg-emerald-500' :
                                  r.resolution_percentage >= 50 ? 'bg-amber-400' : 'bg-red-500'
                                }`}
                                style={{ width: `${r.resolution_percentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-400 min-w-[36px] text-right">{r.resolution_percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
