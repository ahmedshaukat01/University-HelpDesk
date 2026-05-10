// src/pages/AdminLogin.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('/api/admin/login', {
                email:    form.email,
                password: form.password
            }, { withCredentials: true });
            if (res.data.role === 'Admin') navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-sr-dark flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors"
                >
                    ← Back to Home
                </button>

                <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-xl shadow-lg">
                            ⚙️
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white leading-tight">Admin Portal</h2>
                            <p className="text-sm text-slate-400">Restricted access</p>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-300">Email</label>
                            <input
                                id="admin-email"
                                className="w-full bg-white/[0.05] border border-white/10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 outline-none transition-all text-white placeholder-slate-600"
                                name="email" type="email" placeholder="admin@university.edu"
                                value={form.email} onChange={handleChange} required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-300">Password</label>
                            <input
                                id="admin-password"
                                className="w-full bg-white/[0.05] border border-white/10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 outline-none transition-all text-white placeholder-slate-600"
                                name="password" type="password" placeholder="Enter admin password"
                                value={form.password} onChange={handleChange} required
                            />
                        </div>

                        <button
                            id="admin-login-btn"
                            type="submit"
                            className="mt-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white shadow-lg shadow-amber-500/25 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login →'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        <p>
                            Not an admin?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                            >
                                Student / Staff login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}