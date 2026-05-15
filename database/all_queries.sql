-- Smart Hostel Management SQL Script
-- USE this file to view and analyze LIVE data from the website.
USE hostel_mgmt;

-- 1. Joins: show complaints with student and worker details.
SELECT
  c.id AS complaint_id,
  c.title,
  c.category,
  c.status,
  c.priority,
  u.name AS student_name,
  wu.name AS worker_name,
  w.department AS worker_department,
  a.assigned_at
FROM complaints c
LEFT JOIN users u ON c.student_id = u.id
LEFT JOIN assignments a ON c.id = a.complaint_id
LEFT JOIN workers w ON a.worker_id = w.id
LEFT JOIN users wu ON w.user_id = wu.id
ORDER BY c.created_at DESC;

-- 2. Functions: aggregate counts and formatted dates.
SELECT
  COUNT(*) AS total_complaints,
  SUM(c.status = 'Pending') AS pending_count,
  SUM(c.status = 'Completed') AS completed_count,
  DATE_FORMAT(MIN(c.created_at), '%Y-%m-%d') AS first_complaint_date
FROM complaints c;

SELECT
  u.name,
  u.email,
  CONCAT(u.name, ' <', u.email, '>') AS contact_info,
  IF(w.id IS NULL, 'No worker profile', 'Worker account') AS worker_status
FROM users u
LEFT JOIN workers w ON w.user_id = u.id
WHERE u.role = 'worker';

-- 3. Operations: counts and completion rates by priority.
SELECT
  c.priority,
  COUNT(*) AS total_count,
  SUM(c.status = 'Completed') AS completed_count,
  ROUND(100 * SUM(c.status = 'Completed') / COUNT(*), 1) AS completion_rate_percent
FROM complaints c
GROUP BY c.priority
ORDER BY FIELD(c.priority, 'High', 'Medium', 'Low');

-- 4. Conditional Queries: status label mapping.
SELECT
  c.id,
  c.title,
  c.status,
  CASE
    WHEN c.status = 'Pending' THEN 'Needs Review'
    WHEN c.status = 'Assigned' THEN 'Ready for Worker'
    WHEN c.status = 'In Progress' THEN 'Work Underway'
    WHEN c.status = 'Completed' THEN 'Closed'
    ELSE 'Unknown'
  END AS status_description
FROM complaints c
WHERE c.status <> 'Completed'
ORDER BY c.created_at DESC;

-- 5. ERD diagram: please visualize these relationships manually.
-- users.id -> complaints.student_id
-- users.id -> workers.user_id
-- complaints.id -> assignments.complaint_id
-- workers.id -> assignments.worker_id

-- 6. Subqueries: student complaint counts and assigned complaints.
SELECT
  u.id,
  u.name,
  u.email,
  (
    SELECT COUNT(*)
    FROM complaints c
    WHERE c.student_id = u.id
  ) AS complaint_count
FROM users u
WHERE u.role = 'student'
ORDER BY complaint_count DESC;

SELECT
  c.id,
  c.title,
  c.status,
  c.room_number,
  u.name AS student_name
FROM complaints c
JOIN users u ON c.student_id = u.id
WHERE c.id IN (
  SELECT complaint_id
  FROM assignments
);

-- 7. Distinct, Order By, Group By, Having.
SELECT DISTINCT category
FROM complaints
ORDER BY category;

SELECT
  status,
  COUNT(*) AS total
FROM complaints
GROUP BY status
ORDER BY FIELD(status, 'Pending', 'Assigned', 'In Progress', 'Completed');

SELECT
  category,
  COUNT(*) AS category_count
FROM complaints
GROUP BY category
HAVING COUNT(*) >= 1
ORDER BY category_count DESC;

SELECT
  w.department,
  COUNT(a.id) AS assigned_work_count
FROM workers w
LEFT JOIN assignments a ON w.id = a.worker_id
GROUP BY w.department
HAVING assigned_work_count >= 0
ORDER BY assigned_work_count DESC;

-- 8. Worker Activity Tracking: Count of workers currently assigned to active tasks.
-- This counts workers who have at least one complaint in 'Assigned' or 'In Progress' status.
SELECT 
  COUNT(DISTINCT worker_id) AS currently_working_workers
FROM assignments a
JOIN complaints c ON a.complaint_id = c.id
WHERE c.status IN ('Assigned', 'In Progress');

-- 9. Workload Detail: See each worker's active task count vs. completed tasks.
-- Helps identify who is overloaded and who is available.
SELECT 
  u.name AS worker_name, 
  w.department,
  SUM(CASE WHEN c.status IN ('Assigned', 'In Progress') THEN 1 ELSE 0 END) AS active_tasks,
  SUM(CASE WHEN c.status = 'Completed' THEN 1 ELSE 0 END) AS tasks_finished_total
FROM workers w
JOIN users u ON w.user_id = u.id
LEFT JOIN assignments a ON w.id = a.worker_id
LEFT JOIN complaints c ON a.complaint_id = c.id
GROUP BY w.id, u.name, w.department
ORDER BY active_tasks DESC;

-- 10. Availability Check: Find workers who are currently FREE.
-- (Workers with zero 'Assigned' or 'In Progress' tasks).
SELECT 
  u.name, 
  w.department, 
  w.phone
FROM workers w
JOIN users u ON w.user_id = u.id
WHERE w.id NOT IN (
  SELECT DISTINCT a.worker_id
  FROM assignments a
  JOIN complaints c ON a.complaint_id = c.id
  WHERE c.status IN ('Assigned', 'In Progress')
);

-- 11. Efficiency Metric: Average time taken by each worker to complete tasks.
-- (Uses DATEDIFF to calculate the gap between assignment and completion).
SELECT 
  u.name, 
  w.department,
  ROUND(AVG(DATEDIFF(a.completion_date, a.assigned_at)), 1) AS avg_days_to_complete
FROM workers w
JOIN users u ON w.user_id = u.id
JOIN assignments a ON w.id = a.worker_id
WHERE a.completion_date IS NOT NULL
GROUP BY w.id, u.name, w.department
ORDER BY avg_days_to_complete ASC;

-- 12. Department Utilization: Compare total staff vs. working staff by department.
SELECT 
  w.department,
  COUNT(DISTINCT w.id) AS total_staff,
  COUNT(DISTINCT CASE WHEN c.status IN ('Assigned', 'In Progress') THEN w.id END) AS currently_busy,
  ROUND(100 * COUNT(DISTINCT CASE WHEN c.status IN ('Assigned', 'In Progress') THEN w.id END) / COUNT(DISTINCT w.id), 1) AS utilization_rate_percent
FROM workers w
LEFT JOIN assignments a ON w.id = a.worker_id
LEFT JOIN complaints c ON a.complaint_id = c.id
GROUP BY w.department;

-- 13. Worker Directory & Statistics: Full profile details and workload summary.
-- This gives you a "bird's eye view" of all registered maintenance staff.
SELECT 
  w.id AS worker_id,
  u.name,
  u.email,
  w.department,
  w.phone,
  u.created_at AS joined_date,
  (SELECT COUNT(*) FROM assignments a WHERE a.worker_id = w.id) AS total_tasks_assigned,
  (SELECT COUNT(*) 
   FROM assignments a 
   JOIN complaints c ON a.complaint_id = c.id 
   WHERE a.worker_id = w.id AND c.status = 'Completed') AS tasks_completed
FROM workers w
JOIN users u ON w.user_id = u.id
ORDER BY w.department;

-- 14. Administrative: Reset Student Password
-- This query resets the password for 'student@hostel.com' back to the default 'Student@123'.
-- Replace the hash below if you generate a new one using bcrypt.
UPDATE users 
SET password = '$2a$10$.J6uIfSd1.og7.Sc2A7.b.RQierWfabx0kMilH10uSFranf67VlNK' 
WHERE email = 'student@hostel.com';
