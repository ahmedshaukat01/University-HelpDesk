require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {
    getDepartments,
    registerStudent,
    loginUser,
    adminLogin,
    getComplaintsForAdmin,
    getDepartmentWiseReport,
    updateDepartmentName,
    getUsersAdmin,
    addUserAdmin,
    deactivateUserAdmin,
    activateUserAdmin,
    getAdminProfile,
    updateAdminProfile,
    updateComplaintPriority,
    updateComplaintStatus,
    getComplaintHistory,
    getAssignedComplaintsForStaff,
    updateStaffComplaintStatus,
    getStaffProfile,
    updateStaffProfile,
    getStaffFeedback,
    getStaffNotifications,
    markNotificationAsRead,
    assignComplaintToStaff,
    getStaffByDepartment,
    submitFeedback,
    getStaffAnalytics,
    getComplaintCategories,
    submitComplaint,
    getStudentComplaints,
    reopenComplaint,
    getStudentNotifications,
    getStudentProfile,
    updateStudentProfile,
    getAdminNotifications,
    getReopenRequests,
    handleReopenRequest,
    toggleComplaintStar,
    markAsMajorIncident,
    clusterComplaint
} = require('./db');

const app = express();
const PORT = 5000;

app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// ── Auth middleware ──────────────────────────────────────────────────────────
const requireAuth = (roles = []) => (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (roles.length && !roles.includes(decoded.role))
            return res.status(403).json({ error: 'Forbidden' });
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// =============================================
// AUTH & SHARED ROUTES
// =============================================

app.post("/api/register/student", async (req, res) => {
    const { name, email, password, phone, departmentId } = req.body;
    if (!name || !email || !password || !phone) return res.status(400).json({ error: "Missing required fields" });
    try {
        const result = await registerStudent({ name, email, password, phone, departmentId });
        const { ResultCode, ResultMessage, NewStudentId } = result[0];
        if (ResultCode === 0) return res.status(201).json({ message: ResultMessage, studentId: NewStudentId });
        return res.status(400).json({ error: ResultMessage });
    } catch (error) {
        console.error("Error registering student:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/departments", async (req, res) => {
    try {
        const result = await getDepartments();
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching departments:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    try {
        const result = await loginUser(email);
        if (!result || result.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
        
        const { ResultCode, UserId, Role, PasswordHash, Name, DepartmentId } = result[0];
        if (ResultCode !== 0) return res.status(401).json({ error: 'Invalid email or password' });

        // Compare password with plain text
        if (password !== PasswordHash) return res.status(401).json({ error: 'Invalid email or password' });
        
        const token = jwt.sign(
            { userId: UserId, role: Role, name: Name, departmentId: DepartmentId },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 8 * 60 * 60 * 1000
        });
        return res.status(200).json({ message: 'Login successful', role: Role, name: Name });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
});

// =============================================
// ADMIN ROUTES
// =============================================

app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    try {
        const result = await adminLogin(email);
        if (!result || result.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

        const { ResultCode, AdminId, PasswordHash, Name } = result[0];
        if (ResultCode !== 0) return res.status(401).json({ error: 'Invalid email or password' });

        // Compare password with plain text
        if (password !== PasswordHash) return res.status(401).json({ error: 'Invalid email or password' });
        
        const token = jwt.sign({ userId: AdminId, role: 'Admin', name: Name }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000 });
        return res.status(200).json({ message: 'Admin login successful', role: 'Admin', name: Name });
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/admin/complaints', requireAuth(['Admin']), async (req, res) => {
    const { filter = 'all', departmentId, priority } = req.query;
    try {
        const result = await getComplaintsForAdmin({ filter, departmentId, priority });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/admin/complaints/:id/priority', requireAuth(['Admin']), async (req, res) => {
    const { id } = req.params;
    const { priority } = req.body;
    const adminId = req.user.userId;
    if (!priority) return res.status(400).json({ error: 'Priority is required' });
    try {
        const result = await updateComplaintPriority(id, priority, adminId);
        const { ResultCode, ResultMessage } = result[0] ?? {};
        if (ResultCode === 0) return res.status(200).json({ message: ResultMessage });
        return res.status(400).json({ error: ResultMessage });
    } catch (error) {
        console.error('Error updating priority:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/admin/complaints/:id/status', requireAuth(['Admin']), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.userId;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    try {
        const result = await updateComplaintStatus(id, status, adminId);
        const { ResultCode, ResultMessage } = result[0] ?? {};
        if (ResultCode === 0) return res.status(200).json({ message: ResultMessage });
        return res.status(400).json({ error: ResultMessage });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/admin/complaints/:id/history', requireAuth(['Admin', 'Staff']), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await getComplaintHistory(id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/admin/reports/departments', requireAuth(['Admin']), async (req, res) => {
    try {
        const result = await getDepartmentWiseReport();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching department reports:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/admin/departments/:id', requireAuth(['Admin']), async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ error: 'Department name is required' });
    try {
        const result = await updateDepartmentName(id, name.trim());
        const { ResultCode, ResultMessage } = result[0] ?? {};
        if (ResultCode === 0) return res.status(200).json({ message: ResultMessage });
        return res.status(400).json({ error: ResultMessage });
    } catch (error) {
        console.error('Error updating department name:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/admin/users', requireAuth(['Admin']), async (req, res) => {
    try {
        const result = await getUsersAdmin();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/admin/users', requireAuth(['Admin']), async (req, res) => {
    const { role, name, email, password, phone, departmentId } = req.body;
    if (!role || !name || !email || !password) return res.status(400).json({ error: 'Required fields missing' });
    try {
        const result = await addUserAdmin({ role, name, email, password, phone, departmentId });
        const { ResultCode, ResultMessage } = result[0] ?? {};
        if (ResultCode === 0) return res.status(201).json({ message: ResultMessage });
        return res.status(400).json({ error: ResultMessage });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/admin/users/:id', requireAuth(['Admin']), async (req, res) => {
    const { id } = req.params;
    const { role } = req.query;
    if (!role) return res.status(400).json({ error: 'Role is required' });
    try {
        const result = await deactivateUserAdmin(id, role);
        const { ResultCode, ResultMessage } = result[0] ?? {};
        if (ResultCode === 0) return res.status(200).json({ message: ResultMessage });
        return res.status(400).json({ error: ResultMessage });
    } catch (error) {
        console.error('Error deactivating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/admin/users/:id/activate', requireAuth(['Admin']), async (req, res) => {
    const { id } = req.params;
    const { role } = req.query;
    if (!role) return res.status(400).json({ error: 'Role is required' });
    try {
        const result = await activateUserAdmin(id, role);
        const { ResultCode, ResultMessage } = result[0] ?? {};
        if (ResultCode === 0) return res.status(200).json({ message: ResultMessage });
        return res.status(400).json({ error: ResultMessage });
    } catch (error) {
        console.error('Error activating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/admin/staff', requireAuth(['Admin']), async (req, res) => {
    const { departmentId } = req.query;
    if (!departmentId) return res.status(400).json({ error: 'departmentId is required' });
    try {
        const result = await getStaffByDepartment(departmentId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/admin/complaints/:id/assign', requireAuth(['Admin']), async (req, res) => {
    const { id } = req.params;
    const { staffId } = req.body;
    const adminId = req.user.userId;
    if (!staffId) return res.status(400).json({ error: 'staffId is required' });
    try {
        await assignComplaintToStaff(id, staffId, adminId);
        res.status(200).json({ message: 'Complaint assigned successfully' });
    } catch (error) {
        console.error('Error assigning complaint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/admin/profile', requireAuth(['Admin']), async (req, res) => {
    try {
        const result = await getAdminProfile(req.user.userId);
        if (result && result.length > 0) res.status(200).json(result[0]);
        else res.status(404).json({ error: 'Profile not found' });
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/admin/profile', requireAuth(['Admin']), async (req, res) => {
    const { name, phone, password } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
    try {
        const result = await updateAdminProfile(req.user.userId, name, phone, password);
        const { ResultCode, ResultMessage } = result[0] ?? {};
        if (ResultCode === 0) return res.status(200).json({ message: ResultMessage });
        return res.status(400).json({ error: ResultMessage });
    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/admin/notifications', requireAuth(['Admin']), async (req, res) => {
    try {
        const result = await getAdminNotifications(req.user.userId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching admin notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/admin/reopen-requests', requireAuth(['Admin']), async (req, res) => {
    try {
        const result = await getReopenRequests();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching reopen requests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/admin/reopen-requests/:id/handle', requireAuth(['Admin']), async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;
    const adminId = req.user.userId;
    if (!action) return res.status(400).json({ error: 'Action is required' });
    try {
        const result = await handleReopenRequest(id, adminId, action);
        const { ResultCode, ResultMessage } = result[0] ?? {};
        if (ResultCode === 0) return res.status(200).json({ message: ResultMessage });
        return res.status(400).json({ error: ResultMessage });
    } catch (error) {
        console.error('Error handling reopen request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/admin/complaints/:id/star', requireAuth(['Admin']), async (req, res) => {
    const { id } = req.params;
    try {
        await toggleComplaintStar(id);
        res.status(200).json({ message: 'Star toggled' });
    } catch (error) {
        console.error('Error toggling star:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/admin/complaints/:id/major-incident', requireAuth(['Admin']), async (req, res) => {
    const { id } = req.params;
    try {
        await markAsMajorIncident(id);
        res.status(200).json({ message: 'Marked as Major Incident' });
    } catch (error) {
        console.error('Error marking as major incident:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/admin/complaints/:id/cluster', requireAuth(['Admin']), async (req, res) => {
    const { id } = req.params;
    const { parentId } = req.body;
    if (!parentId) return res.status(400).json({ error: 'parentId is required' });
    try {
        const result = await clusterComplaint(id, parentId);
        if (result[0]?.ResultCode === 0) res.status(200).json({ message: 'Complaint clustered' });
        else res.status(400).json({ error: 'Failed to cluster. Parent must be a Major Incident.' });
    } catch (error) {
        console.error('Error clustering complaint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/admin/notifications/:id/read', requireAuth(['Admin']), async (req, res) => {
    const { id } = req.params;
    try {
        await markNotificationAsRead(id);
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking as read:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// =============================================
// STAFF ROUTES
// =============================================

app.get('/api/staff/complaints', requireAuth(['Staff']), async (req, res) => {
    const { status } = req.query;
    try {
        const result = await getAssignedComplaintsForStaff(req.user.userId, status);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching staff complaints:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/staff/complaints/:id/status', requireAuth(['Staff']), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const staffId = req.user.userId;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    try {
        const result = await updateStaffComplaintStatus(id, status, staffId);
        const { ResultCode, ResultMessage } = result[0] ?? {};
        if (ResultCode === 0) return res.status(200).json({ message: ResultMessage });
        return res.status(400).json({ error: ResultMessage });
    } catch (error) {
        console.error('Error updating staff status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/staff/profile', requireAuth(['Staff']), async (req, res) => {
    try {
        const result = await getStaffProfile(req.user.userId);
        if (result && result.length > 0) res.status(200).json(result[0]);
        else res.status(404).json({ error: 'Profile not found' });
    } catch (error) {
        console.error('Error fetching staff profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/staff/profile', requireAuth(['Staff']), async (req, res) => {
    const { name, phone, password } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
    try {
        const result = await updateStaffProfile(req.user.userId, name, phone, password);
        const { ResultCode, ResultMessage } = result[0] ?? {};
        if (ResultCode === 0) return res.status(200).json({ message: ResultMessage });
        return res.status(400).json({ error: ResultMessage });
    } catch (error) {
        console.error('Error updating staff profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/staff/feedback', requireAuth(['Staff']), async (req, res) => {
    try {
        const result = await getStaffFeedback(req.user.userId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/staff/notifications', requireAuth(['Staff']), async (req, res) => {
    try {
        const result = await getStaffNotifications(req.user.userId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/staff/notifications/:id/read', requireAuth(['Staff']), async (req, res) => {
    const { id } = req.params;
    try {
        await markNotificationAsRead(id);
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking as read:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/staff/analytics', requireAuth(['Staff']), async (req, res) => {
    try {
        const result = await getStaffAnalytics(req.user.userId);
        res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error fetching staff analytics:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// =============================================
// STUDENT ROUTES
// =============================================

app.get('/api/categories', async (req, res) => {
    const { departmentId } = req.query;
    try {
        const result = await getComplaintCategories(departmentId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/student/complaints', requireAuth(['Student']), async (req, res) => {
    const { departmentId, categoryId, title, description, priority } = req.body;
    const studentId = req.user.userId;
    if (!departmentId || !title || !description) return res.status(400).json({ error: 'Required fields missing' });
    try {
        const result = await submitComplaint({ studentId, departmentId, categoryId, title, description, priority });
        const { ResultCode, ResultMessage, NewComplaintId } = result[0] ?? {};
        if (ResultCode === 0) return res.status(201).json({ message: ResultMessage, complaintId: NewComplaintId });
        return res.status(400).json({ error: ResultMessage });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/student/complaints', requireAuth(['Student']), async (req, res) => {
    const studentId = req.user.userId;
    try {
        const result = await getStudentComplaints(studentId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching student complaints:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/student/complaints/:id/reopen', requireAuth(['Student']), async (req, res) => {
    const { id } = req.params;
    const { remarks } = req.body;
    const studentId = req.user.userId;
    if (!remarks) return res.status(400).json({ error: 'Remarks (reason) is required' });
    try {
        const result = await reopenComplaint(id, studentId, remarks);
        const { ResultCode, ResultMessage } = result[0] ?? {};
        if (ResultCode === 0) return res.status(200).json({ message: ResultMessage });
        return res.status(400).json({ error: ResultMessage });
    } catch (error) {
        console.error('Error reopening complaint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/student/feedback', requireAuth(['Student']), async (req, res) => {
    const { complaintId, rating, comments } = req.body;
    const studentId = req.user.userId;
    if (!complaintId || !rating) return res.status(400).json({ error: 'Required fields missing' });
    try {
        await submitFeedback(complaintId, studentId, rating, comments);
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/student/notifications', requireAuth(['Student']), async (req, res) => {
    try {
        const result = await getStudentNotifications(req.user.userId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching student notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/student/notifications/:id/read', requireAuth(['Student']), async (req, res) => {
    const { id } = req.params;
    try {
        await markNotificationAsRead(id);
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking as read:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/student/profile', requireAuth(['Student']), async (req, res) => {
    try {
        const result = await getStudentProfile(req.user.userId);
        if (result.length === 0) return res.status(404).json({ error: 'Profile not found' });
        res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/student/profile', requireAuth(['Student']), async (req, res) => {
    const { name, phoneNumber, password } = req.body;
    const studentId = req.user.userId;
    if (!name || !phoneNumber) return res.status(400).json({ error: 'Name and Phone Number are required' });
    try {
        await updateStudentProfile({ studentId, name, phoneNumber, passwordHash: password });
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating student profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});