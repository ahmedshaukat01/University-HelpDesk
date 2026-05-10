// src/pages/StudentRegister.js
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function StudentRegister() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [error, setError]             = useState('');
    const [loading, setLoading]         = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', password: '', phone: '', departmentId: ''
    });

    useEffect(() => {
        axios.get('/api/departments')
            .then(res => setDepartments(res.data))
            .catch(() => setError('Could not load departments.'));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post('/api/register/student', {
                name:         form.name,
                email:        form.email,
                password:     form.password,
                phone:        form.phone,
                departmentId: form.departmentId ? parseInt(form.departmentId) : null
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full bg-white/[0.05] border border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-4 py-3 outline-none transition-all text-white placeholder-slate-600";

    return (
        <div className="min-h-screen bg-sr-dark flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md my-8">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors"
                >
                    ← Back to Home
                </button>

                <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
                            🎓
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white leading-tight">Create Account</h2>
                            <p className="text-sm text-slate-400">Student registration</p>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-300">Full Name</label>
                            <input id="reg-name" className={inputClass} name="name" type="text"
                                placeholder="Ali Hassan" value={form.name} onChange={handleChange} required />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-300">Email</label>
                            <input id="reg-email" className={inputClass} name="email" type="email"
                                placeholder="ali@university.edu" value={form.email} onChange={handleChange} required />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-300">Password</label>
                            <input id="reg-password" className={inputClass} name="password" type="password"
                                placeholder="Min 8 characters" value={form.password} onChange={handleChange} required />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-300">Phone</label>
                            <input id="reg-phone" className={inputClass} name="phone" type="text"
                                placeholder="03001234567" value={form.phone} onChange={handleChange} required />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-300">
                                Department <span className="font-normal text-slate-500">(optional)</span>
                            </label>
                            <select
                                id="reg-department"
                                className="w-full bg-white/[0.05] border border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-4 py-3 outline-none transition-all text-white appearance-none"
                                name="departmentId" value={form.departmentId} onChange={handleChange}
                            >
                                <option value="" className="bg-gray-900">-- Select department --</option>
                                {departments.map(d => (
                                    <option key={d.departmentId} value={d.departmentId} className="bg-gray-900">
                                        {d.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            id="reg-submit-btn"
                            type="submit"
                            className="mt-2 w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 text-white shadow-lg shadow-violet-500/25 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Create Account →'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}