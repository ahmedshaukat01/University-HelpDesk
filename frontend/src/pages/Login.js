// src/pages/Login.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const navigate = useNavigate();

    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm]       = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('/api/login', {
                email:    form.email,
                password: form.password
            }, { withCredentials: true });

            const { role } = res.data;
            if (role === 'Student')     navigate('/student/dashboard');
            else if (role === 'Staff')  navigate('/staff/dashboard');

        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-sr-dark flex items-center justify-center p-4">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Back to home */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors"
                >
                    ← Back to Home
                </button>

                <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">🏛️</span>
                        <div>
                            <h2 className="text-2xl font-bold text-white leading-tight">Welcome back</h2>
                            <p className="text-sm text-slate-400">Student &amp; Staff login</p>
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
                                id="login-email"
                                className="w-full bg-white/[0.05] border border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-4 py-3 outline-none transition-all text-white placeholder-slate-600"
                                name="email" type="email" placeholder="ali@university.edu"
                                value={form.email} onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-300">Password</label>
                            <input
                                id="login-password"
                                className="w-full bg-white/[0.05] border border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-4 py-3 outline-none transition-all text-white placeholder-slate-600"
                                name="password" type="password" placeholder="Enter your password"
                                value={form.password} onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            id="login-submit-btn"
                            type="submit"
                            className="mt-2 w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 text-white shadow-lg shadow-violet-500/25 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login →'}
                        </button>
                    </form>

                    <div className="mt-6 flex flex-col items-center gap-2 text-sm text-slate-500">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                                Register
                            </Link>
                        </p>
                        <p>
                            Admin?{' '}
                            <Link to="/admin/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                                Admin login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}