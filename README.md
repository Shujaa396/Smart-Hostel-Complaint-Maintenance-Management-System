# Smart Hostel Complaint & Maintenance Management System

A modern full-stack hostel complaint management system built with Node.js, Express, EJS, Bootstrap, and MySQL.

## 🛠️ Tech Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

---

## Features

- Register, Login, Logout
- Role-based access: Student, Admin, Worker
- Student complaint CRUD operations
- Admin complaint management, worker management, assignment, status updates
- Worker dashboard with assigned complaints and progress updates
- Responsive UI with dashboard cards, status badges, and filters
- Secure session authentication and bcrypt password hashing

## Screenshots

Be sure to check the application interface below:

![Login Page](SCREENSHOTS/Screenshot_15-5-2026_95047_localhost.jpeg)
![Admin Dashboard](SCREENSHOTS/Screenshot_15-5-2026_95157_localhost.jpeg)
![Student Dashboard](SCREENSHOTS/Screenshot_15-5-2026_9532_localhost.jpeg)
![Dashboard](SCREENSHOTS/Screenshot_15-5-2026_95146_localhost.jpeg)
![Student Dashboard](SCREENSHOTS/Screenshot_15-5-2026_95219_localhost.jpeg)

![Student Dashboard](SCREENSHOTS/Screenshot_15-5-2026_95231_localhost.jpeg)

![Student Dashboard](SCREENSHOTS/Screenshot_15-5-2026_95335_localhost.jpeg)

![Complaint Management](SCREENSHOTS/Screenshot_15-5-2026_95358_localhost.jpeg)
![System Dashboard](SCREENSHOTS/Screenshot%202026-05-15%20095424.png)
![Feature 1](SCREENSHOTS/Screenshot%20%28141%29.png)
![Feature 2](SCREENSHOTS/Screenshot%20%28140%29.png)
![Feature 3](SCREENSHOTS/Screenshot%20%28139%29.png)
![Feature 4](SCREENSHOTS/Screenshot%20%28138%29.png)
![Feature 5](SCREENSHOTS/Screenshot%20%28137%29.png)
![Feature 6](SCREENSHOTS/Screenshot%20%28136%29.png)
![Feature 7](SCREENSHOTS/Screenshot%20%28135%29.png)
![Feature 8](SCREENSHOTS/Screenshot%20%28134%29.png)


## Project Structure

- `app.js` - main server entry point
- `config/db.js` - MySQL connection pool
- `routes/` - Express routers
- `controllers/` - route handler logic
- `models/` - database queries and CRUD helpers
- `middleware/` - authentication and authorization
- `views/` - EJS templates
- `public/` - CSS and JavaScript assets
- `database/schema.sql` - SQL database schema and sample seed data

## Required Packages

- express
- express-session
- connect-flash
- ejs
- mysql2
- bcryptjs

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Create the MySQL database and tables using MySQL Workbench or command line.

- Open `database/schema.sql` in MySQL Workbench and execute it.
- Or run the SQL directly with a MySQL client.

> Note: `database/schema.sql` is intended for initial setup. Avoid rerunning it after you have added or updated data to prevent duplicate sample inserts and preserve your changes.

3. Update database credentials in `config/db.js` if necessary.

```js
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'your_mysql_password',
  database: process.env.DB_NAME || 'hostel_mgmt',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

If your MySQL root user requires a password, set `DB_PASSWORD` in your environment or replace the empty string with your root password.

4. Start the app:

```bash
npm start
```

5. Open the application in your browser:

```bash
http://localhost:3000
```

## Example Credentials

- Admin: `admin@hostel.com` / `Admin@123`
- Worker: `worker@hostel.com` / `Worker@123`
- Student: `student@hostel.com` / `Student@123`

## Notes

- Use the admin dashboard to add more workers and assign them to complaints.
- Students can create complaints and track status changes.
- Workers can view and update assigned complaints.

- ## License

This project is Created by Syed Shujaa Hussain.
