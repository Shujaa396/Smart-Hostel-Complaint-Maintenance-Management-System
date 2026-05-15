-- ONLY run the DROP line if you want to WIPE ALL DATA and start fresh.
-- DROP DATABASE IF EXISTS hostel_mgmt;
CREATE DATABASE IF NOT EXISTS hostel_mgmt CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE hostel_mgmt;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student','admin','worker') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaints (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  status ENUM('Pending','Assigned','In Progress','Completed') NOT NULL DEFAULT 'Pending',
  priority ENUM('Low','Medium','High') NOT NULL DEFAULT 'Medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS workers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  department VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assignments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  complaint_id INT UNSIGNED NOT NULL,
  worker_id INT UNSIGNED NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completion_date DATETIME NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed initial data using INSERT IGNORE to prevent errors if records already exist.
INSERT IGNORE INTO users (id, name, email, password, role) VALUES
  (1, 'Admin User', 'admin@hostel.com', '$2a$10$ta6fzib1ly/KUVmq2dA68uSesOTQqn3iNoegZsvKmOrplLABQp38u', 'admin'),
  (2, 'Worker One', 'worker@hostel.com', '$2a$10$HAZxVTvEOHsjeeN/c6CIW.rs7Q8vC7yF36yAYBR02ALW8dMuTc12a', 'worker'),
  (3, 'Worker Two', 'worker2@hostel.com', '$2a$10$HAZxVTvEOHsjeeN/c6CIW.rs7Q8vC7yF36yAYBR02ALW8dMuTc12a', 'worker'),
  (4, 'Worker Three', 'worker3@hostel.com', '$2a$10$HAZxVTvEOHsjeeN/c6CIW.rs7Q8vC7yF36yAYBR02ALW8dMuTc12a', 'worker'),
  (5, 'Student User', 'student@hostel.com', '$2a$10$.J6uIfSd1.og7.Sc2A7.b.RQierWfabx0kMilH10uSFranf67VlNK', 'student');

INSERT IGNORE INTO workers (id, user_id, department, phone) VALUES
  (1, 2, 'Electrical', '+1234567890'),
  (2, 3, 'Plumbing', '+1234567891'),
  (3, 4, 'Cleaning', '+1234567892');

INSERT IGNORE INTO complaints (id, student_id, title, category, description, room_number, status, priority) VALUES
  (1, 5, 'Leaking ceiling in room', 'Cleaning', 'Water dripping from the ceiling in room D-101. Needs urgent attention.', 'D-101', 'Assigned', 'High'),
  (2, 5, 'No internet in mess', 'Internet', 'WiFi connection is not available in the mess hall since morning.', 'D-101', 'Pending', 'Medium'),
  (3, 5, 'Broken desk chair', 'Furniture', 'The chair in my hostel room has broken legs and is unsafe to use.', 'D-101', 'In Progress', 'Low');

INSERT IGNORE INTO assignments (id, complaint_id, worker_id) VALUES
  (1, 1, 1);

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
