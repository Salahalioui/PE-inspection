Below is a draft PRD document that incorporates your updated requirements. We can iterate further on any section as needed.

---

# Product Requirements Document (PRD): PE Inspector Platform

**Version:** 1.1  
**Date:** 2025-03-04  
**Author:** [Your Name]

---

## 1. Introduction

The **PE Inspector Platform** is a web application aimed at streamlining the management and evaluation of physical education teaching in Algeria. The system provides teachers with an easy-to-use interface for managing their personal/professional information, weekly schedules, lesson plans, and absences, while allowing inspectors to review teacher data and submit field visit reports. The application will support both Arabic and French by default.

---

## 2. Objectives & Scope

**Objectives:**
- Centralize teacher information (personal, professional, schedules, lesson plans, absences).
- Automate calculation of progress reports based on lesson completion and absence records.
- Empower inspectors to review teacher data and submit independent field visit reports.
- Support bilingual interfaces (Arabic and French) to meet local needs.
- Utilize free and open-source tools (e.g., Supabase free tier, PostgreSQL, free frameworks).

**Scope:**
- Develop a responsive web application (desktop and mobile).
- Implement role-based access for Teachers and Inspectors.
- Create a modular architecture separating frontend, backend, and database layers.
- Ensure secure communications (HTTPS, JWT-based authentication).

---

## 3. User Personas & Roles

### Teacher
- **Responsibilities:**
  - **Profile Management:** Enter/update personal and professional information.
    - *Personal Info:* Full name, date of birth, etc.
    - *Professional Info:* الوظيفة, المستوى, الاسم و اللقب, مؤسسة العمل, الصفة, الدرجة, تاريخ التعيين, تاريخ الترسيم, الحالة العائلية, الشهادة المحصل عليها.
  - **Weekly Schedule:** Manage a weekly calendar by entering individual schedule entries (day, start/end time, subject/class).
  - **Lesson Plans:** Create, update, and track lesson plans with details like lesson number, objectives, completion status (toggle done/not done), and remarks.
  - **Absence Tracking:** Log absences with predefined motifs (from a lookup table).
  - **Progress Reports:** View aggregated reports calculated from lesson plan completion and absence records.

### Inspector
- **Responsibilities:**
  - **Data Oversight:** Access comprehensive teacher profiles, schedules, lesson plans, and absence records.
  - **Progress Monitoring:** Review dashboards and trend reports based on aggregated data.
  - **Field Visit Reports:** Submit independent evaluations and field visit reports per teacher.

---

## 4. Features & Requirements

### 4.1 Teacher Role Features

- **Account & Profile Management:**
  - User registration and authentication.
  - Fill out two-part profile:
    - **Personnel Info:** Full name, date of birth, etc.
    - **Professional Info:** الوظيفة, المستوى, الاسم و اللقب, مؤسسة العمل, الصفة, الدرجة, تاريخ التعيين, تاريخ الترسيم, الحالة العائلية, الشهادة المحصل عليها.
- **Weekly Schedule:**
  - A dedicated calendar view.
  - Ability to add/edit individual schedule entries (day, start/end time, subject/class).
- **Lesson Plan Tracker:**
  - Form to enter lesson number, objectives, completion status (toggle), and remarks.
  - Option to update previous lesson plans.
- **Absence Logging:**
  - Record absences with a drop-down for absence motifs.
  - Motifs stored in a predefined lookup table.
- **Progress Reports:**
  - Dashboard that aggregates lesson plan completion and absence data to compute progress percentages.

### 4.2 Inspector Role Features

- **Teacher Data Review:**
  - View teacher profiles, schedules, lesson plans, and absence logs.
- **Reporting & Analytics:**
  - Dashboards that show trends in lesson completion and absence frequencies.
- **Field Visit Report Submission:**
  - Structured form for inspectors to submit independent evaluation reports.
  - Ability to add comments and recommendations per teacher.
- **Data Filtering:**
  - Filter teacher data by performance metrics, absence counts, etc.

### 4.3 Multilingual Support

- **Languages:**  
  - The UI must support Arabic and French by default.
  - All textual content (labels, messages, motifs, etc.) will have corresponding translations.

---

## 5. System Architecture & Technology Stack

### Architecture
- **Frontend:**  
  - Single-Page Application (SPA) using frameworks such as React or Vue.js.
  - Responsive design with bilingual UI support.
- **Backend:**  
  - RESTful API endpoints built with Node.js (Express) or Python (Flask).
  - Secure communications over HTTPS.
- **Database:**  
  - PostgreSQL (hosted on Supabase free tier) with a well-normalized schema.
- **Authentication:**  
  - Supabase Auth with JWT for role-based access control.
- **Deployment:**  
  - Free-tier deployment platforms such as Vercel, Netlify, or Heroku.

### Technology Stack
- **Frontend:** HTML, CSS (Tailwind CSS or Bootstrap), JavaScript (React or Vue.js).
- **Backend:** Node.js with Express.js **or** Python with Flask.
- **Database:** PostgreSQL (Supabase free tier).
- **Version Control:** Git (hosted on GitHub/GitLab).

---

## 6. Non-Functional Requirements

- **Performance:**  
  - Fast load times and responsive interactions.
- **Security:**  
  - Role-based access control, secure data storage, HTTPS, and JWT authentication.
- **Scalability:**  
  - Design for easy migration from free-tier to a paid plan if usage grows.
- **Usability:**  
  - Minimalistic, intuitive design with clear labels and bilingual support.
- **Maintainability:**  
  - Modular codebase with clear documentation.

---

## 7. Database Schema

### 7.1 Overview
The database schema is designed to normalize the data related to user accounts, teacher profiles, schedules, lesson plans, absences, and field visit reports. Below is a list of key tables and their relationships:

### 7.2 Tables

1. **Users**
   - **Columns:**  
     - `id` (PK, INT, auto-increment)  
     - `email` (VARCHAR)  
     - `password_hash` (VARCHAR)  
     - `role` (ENUM: 'teacher', 'inspector')  
     - `created_at` (TIMESTAMP)  
     - `updated_at` (TIMESTAMP)

2. **TeacherProfiles**  
   *(Extends the Users table for teachers; one-to-one relationship with Users where role = teacher)*
   - **Columns:**  
     - `id` (PK, INT; also FK referencing Users.id)  
     - **Personnel Info:**  
       - `full_name` (VARCHAR)  
       - `date_of_birth` (DATE)  
       - *(Additional personal fields as needed)*  
     - **Professional Info:**  
       - `job_title` (VARCHAR) – الوظيفة  
       - `level` (VARCHAR) – المستوى  
       - `first_name` (VARCHAR) – الاسم  
       - `last_name` (VARCHAR) – اللقب  
       - `work_institution` (VARCHAR) – مؤسسة العمل  
       - `position` (VARCHAR) – الصفة  
       - `grade` (VARCHAR) – الدرجة  
       - `appointment_date` (DATE) – تاريخ التعيين  
       - `confirmation_date` (DATE) – تاريخ الترسيم  
       - `marital_status` (VARCHAR) – الحالة العائلية  
       - `certificate_obtained` (VARCHAR) – الشهادة المحصل عليها

3. **TeacherWeeklySchedules**
   - **Columns:**  
     - `id` (PK, INT, auto-increment)  
     - `teacher_id` (FK referencing Users.id)  
     - `day_of_week` (ENUM or VARCHAR e.g., 'Monday', 'Tuesday', etc.)  
     - `start_time` (TIME)  
     - `end_time` (TIME)  
     - `subject_class` (VARCHAR)

4. **LessonPlans**
   - **Columns:**  
     - `id` (PK, INT, auto-increment)  
     - `teacher_id` (FK referencing Users.id)  
     - `lesson_number` (INT)  
     - `objectives` (TEXT)  
     - `completion_status` (BOOLEAN)  
     - `remarks` (TEXT)  
     - `created_at` (TIMESTAMP)

5. **Absences**
   - **Columns:**  
     - `id` (PK, INT, auto-increment)  
     - `teacher_id` (FK referencing Users.id)  
     - `absence_date` (DATE)  
     - `absence_motif_id` (FK referencing AbsenceMotifs.id)  
     - `remarks` (TEXT)

6. **AbsenceMotifs**  
   - **Columns:**  
     - `id` (PK, INT, auto-increment)  
     - `motif_label_ar` (VARCHAR) – Arabic label  
     - `motif_label_fr` (VARCHAR) – French label

7. **FieldVisitReports**
   - **Columns:**  
     - `id` (PK, INT, auto-increment)  
     - `teacher_id` (FK referencing Users.id)  
     - `inspector_id` (FK referencing Users.id, where role = inspector)  
     - `visit_date` (DATE)  
     - `report_content` (TEXT)  
     - `additional_comments` (TEXT)

8. **ProgressReports** *(Optional Snapshot Table)*  
   *(If reports are to be stored rather than calculated on the fly)*  
   - **Columns:**  
     - `id` (PK, INT, auto-increment)  
     - `teacher_id` (FK referencing Users.id)  
     - `report_date` (DATE)  
     - `lesson_completion_percentage` (DECIMAL)  
     - `absence_count` (INT)  
     - `aggregated_score` (DECIMAL)  

> **Note:** Progress reports can also be generated dynamically by aggregating data from LessonPlans and Absences.

---

## 8. Development & Deployment Plan

**Phase 1: Planning & Design**  
- Finalize wireframes and database schema design.
- Create detailed UI mockups for bilingual interfaces.

**Phase 2: MVP Development**  
- Develop core backend API endpoints (user management, schedule, lesson plans, absences, reports).
- Build the frontend SPA with bilingual support.
- Implement role-based authentication using Supabase Auth and JWT.

**Phase 3: Testing & Iteration**  
- Perform unit and integration tests.
- Conduct user testing with sample teachers and inspectors.
- Iterate based on feedback.

**Phase 4: Deployment**  
- Deploy frontend and backend on free hosting platforms (e.g., Vercel/Netlify for frontend, Heroku for backend).
- Monitor performance and gather feedback.

**Phase 5: Future Enhancements**  
- Expand reporting features and add further analytics.
- Optimize the UI and database performance as user base grows.

---

## 9. Risks & Mitigations

- **Scalability:**  
  - *Risk:* Free-tier limitations on Supabase.  
  - *Mitigation:* Monitor usage and plan migration if necessary.
- **Role-Based Access Control Complexity:**  
  - *Risk:* Mistakes in differentiating teacher and inspector actions.  
  - *Mitigation:* Thorough testing and use of established frameworks (Supabase Auth, JWT).
- **Multilingual Support:**  
  - *Risk:* Inconsistent translations affecting usability.  
  - *Mitigation:* Use a centralized translation file/resource and have native speakers review UI texts.

---

## 10. Appendix

**References:**  
- Supabase Free Tier Documentation  
- Express.js or Flask Documentation  
- Tailwind CSS / Bootstrap Documentation  
- PostgreSQL Best Practices for Schema Design

