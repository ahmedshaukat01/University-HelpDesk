import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminDepartments() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/departments'); // This endpoint is public
            setDepartments(res.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setError('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (dept) => {
        setEditingId(dept.departmentId);
        setEditName(dept.departmentName);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleSaveEdit = async (id) => {
        if (!editName.trim()) {
            alert('Department name cannot be empty');
            return;
        }
        try {
            const res = await axios.patch(`/api/admin/departments/${id}`, { name: editName }, { withCredentials: true });
            if (res.status === 200) {
                setDepartments(departments.map(d => d.departmentId === id ? { ...d, departmentName: editName.trim() } : d));
                setEditingId(null);
            }
        } catch (err) {
            console.error('Error updating department:', err);
            alert(err.response?.data?.error || 'Failed to update department');
        }
    };

    if (loading) return <div style={styles.page}><p>Loading...</p></div>;

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <button style={styles.backBtn} onClick={() => navigate('/admin/dashboard')}>
                    &larr; Back to Dashboard
                </button>
                <h2 style={styles.heading}>Manage Departments</h2>
            </div>
            
            {error && <p style={styles.error}>{error}</p>}
            
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Department Name</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map(dept => (
                            <tr key={dept.departmentId} style={styles.tr}>
                                <td style={styles.td}>{dept.departmentId}</td>
                                <td style={styles.td}>
                                    {editingId === dept.departmentId ? (
                                        <input 
                                            type="text" 
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            style={styles.input}
                                        />
                                    ) : (
                                        dept.departmentName
                                    )}
                                </td>
                                <td style={styles.td}>
                                    {editingId === dept.departmentId ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button style={styles.saveBtn} onClick={() => handleSaveEdit(dept.departmentId)}>Save</button>
                                            <button style={styles.cancelBtn} onClick={handleCancelEdit}>Cancel</button>
                                        </div>
                                    ) : (
                                        <button style={styles.editBtn} onClick={() => handleEditClick(dept)}>Edit</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {departments.length === 0 && <p style={{textAlign: 'center', padding: '1rem', color: '#94a3b8'}}>No departments found.</p>}
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', padding: '2rem' },
    header: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' },
    backBtn: { alignSelf: 'flex-start', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' },
    heading: { margin: 0, fontSize: '24px', fontWeight: '600', color: '#f59e0b' },
    error: { color: '#f87171', backgroundColor: 'rgba(248, 113, 113, 0.1)', padding: '1rem', borderRadius: '8px' },
    tableContainer: { overflowX: 'auto', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '1rem', textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: '600', fontSize: '14px' },
    td: { padding: '1rem', borderBottom: '1px solid #334155', fontSize: '14px' },
    tr: { transition: 'background-color 0.2s' },
    input: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f1f5f9', width: '100%', maxWidth: '300px' },
    editBtn: { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
    saveBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
    cancelBtn: { backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
};
