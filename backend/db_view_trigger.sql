-- =============================================
-- SmartResolve: DB View + Trigger Implementation
-- Run this script on your UniversityHelpdeskDB
-- =============================================

USE UniversityHelpdeskDB;
GO

-- =============================================
-- 1. VIEW: v_AdminComplaintOverview
--    Replaces the GetComplaintsForAdmin SP's
--    heavy JOIN logic. The backend will now
--    query this view with simple WHERE clauses.
-- =============================================

IF OBJECT_ID('v_AdminComplaintOverview', 'V') IS NOT NULL
    DROP VIEW v_AdminComplaintOverview;
GO

CREATE VIEW v_AdminComplaintOverview AS
SELECT
    c.complaint_id,
    c.title,
    c.description,
    c.status,
    c.priority,
    c.is_starred,
    c.is_major_incident,
    c.created_at        AS submission_date,   -- alias matches frontend usage
    c.student_id,
    c.department_id,                          -- needed for staff filtering in frontend
    c.category_id,
    c.staff_id,
    c.parent_complaint_id,
    s.name              AS student_name,
    s.email             AS student_email,
    d.department_name,
    cat.category_name,
    st.name             AS assigned_to_staff_name  -- exact alias expected by frontend
FROM Complaints c
LEFT JOIN Students            s   ON c.student_id   = s.student_id
LEFT JOIN Departments         d   ON c.department_id = d.department_id
LEFT JOIN ComplaintCategories cat ON c.category_id  = cat.category_id
LEFT JOIN Staff               st  ON c.staff_id     = st.staff_id;
GO


-- =============================================
-- 2. TRIGGER: trg_AutoNotifyAdminOnReopen
--    Fires after every INSERT into ReopenRequests.
--    Automatically creates a Notification for
--    ALL active Admins — no extra application
--    logic needed.
--
--    IMPORTANT: If your RequestReopenComplaint
--    stored procedure ALSO manually inserts an
--    admin notification, remove that INSERT from
--    the SP to avoid duplicate notifications.
-- =============================================

IF OBJECT_ID('trg_AutoNotifyAdminOnReopen', 'TR') IS NOT NULL
    DROP TRIGGER trg_AutoNotifyAdminOnReopen;
GO

CREATE TRIGGER trg_AutoNotifyAdminOnReopen
ON ReopenRequests
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Insert one notification per Admin for each new reopen request
    INSERT INTO Notifications (user_id, user_role, message, created_at, is_read)
    SELECT
        a.admin_id,
        'Admin',
        'Reopen request submitted for Complaint #'
            + CAST(i.complaint_id AS VARCHAR(10))
            + ' by student: ' + ISNULL(s.name, 'Unknown'),
        GETDATE(),
        0
    FROM inserted i
    JOIN Students s ON i.student_id = s.student_id
    CROSS JOIN Admins a;  -- Notify every admin in the system
END;
GO


-- =============================================
-- Verify both objects were created successfully
-- =============================================
SELECT 
    OBJECT_NAME(object_id) AS ObjectName,
    type_desc              AS ObjectType
FROM sys.objects
WHERE OBJECT_NAME(object_id) IN ('v_AdminComplaintOverview', 'trg_AutoNotifyAdminOnReopen');
GO
