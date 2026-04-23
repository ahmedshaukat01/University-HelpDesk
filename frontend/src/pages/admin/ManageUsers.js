import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ManageUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [activeTab, setActiveTab] = useState('Student'); // 'Student' or 'Staff'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        role: 'Student',
        name: '',
        email: '',
        password: '',
        phone: '',
        departmentId: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/users', { withCredentials: true });
            setUsers(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await axios.get('/api/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error('Failed to fetch departments', err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    const filteredUsers = users.filter(u => u.role === activeTab);

    const handleDeactivate = async (id, role) => {
        if (!window.confirm(`Are you sure you want to deactivate this ${role}?`)) return;
        try {
            await axios.delete(`/api/admin/users/${id}?role=${role}`, { withCredentials: true });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to deactivate user');
        }
    };

    const handleActivate = async (id, role) => {
        if (!window.confirm(`Are you sure you want to activate this ${role}?`)) return;
        try {
            await axios.patch(`/api/admin/users/${id}/activate?role=${role}`, {}, { withCredentials: true });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to activate user');
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);
        try {
            await axios.post('/api/admin/users', formData, { withCredentials: true });
            setShowAddForm(false);
            setFormData({ role: activeTab, name: '', email: '', password: '', phone: '', departmentId: '' });
            fetchUsers();
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.error || 'Failed to add user');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h2 style={styles.heading}>Manage Users</h2>
                <button style={styles.backBtn} onClick={() => navigate('/admin/dashboard')}>
                    Back to Dashboard
                </button>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.tabsContainer}>
                <button 
                    style={activeTab === 'Student' ? styles.activeTab : styles.tab} 
                    onClick={() => { setActiveTab('Student'); setShowAddForm(false); setFormData(prev => ({...prev, role: 'Student'})); }}
                >
                    Students
                </button>
                <button 
                    style={activeTab === 'Staff' ? styles.activeTab : styles.tab} 
                    onClick={() => { setActiveTab('Staff'); setShowAddForm(false); setFormData(prev => ({...prev, role: 'Staff'})); }}
                >
                    Staff
                </button>
            </div>

            <div style={styles.actionsBar}>
                <button style={styles.addBtn} onClick={() => {
                    setShowAddForm(!showAddForm);
                    setFormData(prev => ({ ...prev, role: activeTab }));
                }}>
                    {showAddForm ? 'Cancel' : `+ Add ${activeTab}`}
                </button>
            </div>

            {showAddForm && (
                <div style={styles.formCard}>
                    <h3 style={styles.formTitle}>Add New {activeTab}</h3>
                    {formError && <p style={styles.error}>{formError}</p>}
                    <form onSubmit={handleAddSubmit} style={styles.form}>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            style={styles.input}
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            style={styles.input}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            style={styles.input}
                        />
                        <input
                            type="text"
                            placeholder="Phone (11 digits)"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            style={styles.input}
                        />
                        <select
                            value={formData.departmentId}
                            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                            required={activeTab === 'Staff'}
                            style={styles.input}
                        >
                            <option value="">{activeTab === 'Staff' ? 'Select Department (Required)' : 'Select Department (Optional)'}</option>
                            {departments.map(d => (
                                <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                            ))}
                        </select>
                        <button type="submit" style={styles.submitBtn} disabled={formLoading}>
                            {formLoading ? 'Adding...' : 'Add User'}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <p>Loading users...</p>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Department</th>
                                <th style={styles.th}>Phone</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} style={styles.tr}>
                                        <td style={styles.td}>{user.name}</td>
                                        <td style={styles.td}>{user.email}</td>
                                        <td style={styles.td}>{user.department_name || 'N/A'}</td>
                                        <td style={styles.td}>{user.phone || 'N/A'}</td>
                                        <td style={styles.td}>
                                            <span style={user.is_active ? styles.statusActive : styles.statusInactive}>
                                                {user.is_active ? 'Active' : 'Deactivated'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {user.is_active ? (
                                                <button 
                                                    style={styles.deactivateBtn} 
                                                    onClick={() => handleDeactivate(user.id, user.role)}
                                                >
                                                    Deactivate
                                                </button>
                                            ) : (
                                                <button 
                                                    style={styles.activateBtn} 
                                                    onClick={() => handleActivate(user.id, user.role)}
                                                >
                                                    Activate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', padding: '2rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    heading: { fontSize: '24px', fontWeight: '600', margin: 0 },
    backBtn: { padding: '8px 16px', backgroundColor: '#334155', color: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    error: { color: '#f87171', backgroundColor: '#450a0a', padding: '10px', borderRadius: '8px', marginBottom: '1rem' },
    tabsContainer: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' },
    tab: { padding: '8px 24px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer' },
    activeTab: { padding: '8px 24px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    actionsBar: { display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' },
    addBtn: { padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
    formCard: { backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', marginBottom: '2rem' },
    formTitle: { margin: '0 0 1rem 0' },
    form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
    input: { padding: '10px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#f1f5f9' },
    submitBtn: { padding: '10px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    tableContainer: { overflowX: 'auto', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '1rem', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: '500' },
    tr: { borderBottom: '1px solid #334155' },
    td: { padding: '1rem' },
    statusActive: { padding: '4px 8px', backgroundColor: '#064e3b', color: '#34d399', borderRadius: '4px', fontSize: '12px' },
    statusInactive: { padding: '4px 8px', backgroundColor: '#450a0a', color: '#f87171', borderRadius: '4px', fontSize: '12px' },
    deactivateBtn: { padding: '6px 12px', backgroundColor: 'transparent', color: '#f87171', border: '1px solid #f87171', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    activateBtn: { padding: '6px 12px', backgroundColor: 'transparent', color: '#34d399', border: '1px solid #34d399', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    deactivatedText: { color: '#64748b', fontSize: '12px', fontStyle: 'italic' }
};
