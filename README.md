<h1 align="center">CHERASRIANS ATHLETE PRO</h1>

<p align="center">
  <strong>A Modern Sports Management System</strong>
  <br/>
  <em>Empowering Athletes, Elevating Performance, Inspiring Excellence</em>
</p>

<!-- <p align="center">
  <img src="https://img.shields.io/github/last-commit/YOUR-USERNAME/YOUR-REPO?style=for-the-badge&color=0A84FF" />
  <img src="https://img.shields.io/github/languages/top/YOUR-USERNAME/YOUR-REPO?style=for-the-badge&color=FFB800" />
  <img src="https://img.shields.io/github/languages/count/YOUR-USERNAME/YOUR-REPO?style=for-the-badge&color=00C853" />
</p> -->

---

# 🛠 Tech Stack

<div align="center">

### **Backend**
<img src="https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white"/>
<img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
<img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white"/>
<img src="https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white"/>

### **Frontend**
<img src="https://img.shields.io/badge/React-087EA4?style=for-the-badge&logo=react&logoColor=white"/>
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/React%20Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white"/>
<img src="https://img.shields.io/badge/Bootstrap-7A00FF?style=for-the-badge&logo=bootstrap&logoColor=white"/>
<img src="https://img.shields.io/badge/Chart.js-F5788D?style=for-the-badge&logo=chart.js&logoColor=white"/>

### **Other Tools**
<img src="https://img.shields.io/badge/npm-CB0000?style=for-the-badge&logo=npm&logoColor=white"/>
<img src="https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white"/>
<img src="https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white"/>
<img src="https://img.shields.io/badge/.ENV-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black"/>

</div>

---

# 📘 Table of Contents
- [Overview](#overview)
- [Core Features](#core-features)
- [Project Structure](#project-structure)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

# 📝 Overview

**CherasRians Athlete Pro** is an enterprise-grade **Sports Management System (Sport CMS)** crafted for academic institutions, academies, and performance centers.  
It consolidates all operational workflows into a single digital platform, providing:

- Streamlined athlete management  
- Efficient coach and EXCO workflows  
- Real-time attendance, scheduling, and match performance tracking  
- Centralized communication and booking management  
- Equipment and facility usage accountability  

The system delivers a **clean, modern UI** and a **scalable backend architecture**, enabling reliable daily operations for sports units of any size.

---

# ⭐ Core Features

### 🔐 Authentication & Access Control
- Secure registration & login  
- JWT authorization  
- Role-based access (Coach / EXCO / Player)

### 🧑‍🏫 Coach Operations
- Manage athletes & categories  
- Create training sessions  
- Submit facility bookings  
- File disciplinary reports  

### 🧑‍🎓 Athlete Management
- Player profiles & status control  
- Sport assignment  
- Team grouping & position roles  

### 🏟 Facility Ecosystem
- Facility catalog & availability  
- Booking workflow with EXCO approval  
- Conflict detection  
- Maintenance reporting

### 📆 Scheduling & Attendance
- Session creation  
- Automated attendance sheet  
- Attendance states (Present, Absent, Late, Injured, Excused)

### 🏋️ Equipment Inventory
- Real-time stock availability  
- Multi-item request workflow  
- Approval levels (Full / Partial / Reject)  
- Damage reporting + review process

### ⚽ Match & Result Tracking
- Friendly & official match records  
- Score submissions  
- Team historical performance dashboards  

### 📣 Announcement Module
- EXCO announcements  
- Role-based filtering  

### 🔔 Notifications
- Booking updates  
- Equipment approval  
- Disciplinary status  
- Session reminders  

---

# 📁 Project Structure
CherasRians-Athlete-Pro/
│
├── frontend/ # React + Vite Client
│ ├── src/
│ ├── public/
│ └── vite.config.js
│
├── backend/ # Node.js + Express + MongoDB API
│ ├── controllers/
│ ├── routes/
│ ├── models/
│ ├── middlewares/
│ ├── utils/
│ └── server.js
│
└── README.md

---

# ⚙️ Installation

## Backend Setup
```bash
cd backend
npm install
PORT=4000
npm run dev


cd frontend
npm install
npm run dev

---




