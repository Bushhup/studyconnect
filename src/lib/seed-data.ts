
import { doc, writeBatch, Firestore } from 'firebase/firestore';

/**
 * Seeds the Firestore database with initial sample data.
 * Follows the schema defined in docs/backend.json
 * Uses Email IDs as document IDs for predictable security rules.
 */
export async function seedDatabase(db: Firestore) {
  const collegeId = 'study-connect-college';
  const batch = writeBatch(db);

  // 1. College Root Document
  const collegeRef = doc(db, 'colleges', collegeId);
  batch.set(collegeRef, {
    id: collegeId,
    name: 'StudyConnect University',
    logoUrl: '/logo.png',
    tagline: 'Connecting Minds, Building Futures'
  });

  // 2. Departments
  const departments = [
    { id: 'dept-eng', name: 'Engineering', headOfDept: 'Dr. Sarah Smith', programType: 'UG', totalSemesters: 8 },
    { id: 'dept-art', name: 'Arts & Design', headOfDept: 'Prof. James Wilson', programType: 'UG', totalSemesters: 8 },
    { id: 'dept-sci', name: 'Applied Sciences', headOfDept: 'Dr. Emily Davis', programType: 'UG', totalSemesters: 6 },
    { id: 'dept-bus', name: 'Business & Management', headOfDept: 'Mr. Robert Brown', programType: 'PG', totalSemesters: 4 },
  ];
  departments.forEach(dept => {
    const ref = doc(db, 'colleges', collegeId, 'departments', dept.id);
    batch.set(ref, dept);
  });

  // 3. Courses
  const courses = [
    { id: 'course-cs101', code: 'CS101', name: 'Intro to Computer Science', departmentId: 'dept-eng', credits: 4 },
    { id: 'course-ai402', code: 'AI402', name: 'Machine Learning Systems', departmentId: 'dept-eng', credits: 4 },
    { id: 'course-ux201', code: 'UX201', name: 'User Experience Design', departmentId: 'dept-art', credits: 3 },
    { id: 'course-phys102', code: 'PHY102', name: 'Applied Physics Lab', departmentId: 'dept-sci', credits: 2 },
  ];
  courses.forEach(course => {
    const ref = doc(db, 'colleges', collegeId, 'courses', course.id);
    batch.set(ref, course);
  });

  // 4. Classes (Sections)
  const classes = [
    { id: 'class-csa', name: 'Computer Science - Section A', departmentId: 'dept-eng', facultyId: 'sarah.smith@college.edu', semester: '5' },
    { id: 'class-uxb', name: 'UI/UX Design - Section B', departmentId: 'dept-art', facultyId: 'james.wilson@college.edu', semester: '3' },
  ];
  classes.forEach(cls => {
    const ref = doc(db, 'colleges', collegeId, 'classes', cls.id);
    batch.set(ref, cls);
  });

  // 5. Initial Users (Admin, Faculty, Student)
  // CRITICAL: Document ID is the Email Address
  const initialUsers = [
    { 
      id: 'shabuddinaw@gmail.com', 
      email: 'shabuddinaw@gmail.com', 
      firstName: 'Shabuddin', 
      lastName: 'A', 
      password: 'shabu05413',
      role: 'admin', 
      status: 'active',
      createdAt: new Date().toISOString()
    },
    { 
      id: 'admin@college.edu', 
      email: 'admin@college.edu', 
      firstName: 'System', 
      lastName: 'Administrator', 
      password: 'minister123',
      role: 'admin', 
      status: 'active',
      createdAt: new Date().toISOString()
    },
    { 
      id: 'sarah.smith@college.edu', 
      email: 'sarah.smith@college.edu', 
      firstName: 'Sarah', 
      lastName: 'Smith', 
      role: 'faculty', 
      departmentId: 'dept-eng', 
      status: 'active',
      createdAt: new Date().toISOString()
    },
    { 
      id: 'james.wilson@college.edu', 
      email: 'james.wilson@college.edu', 
      firstName: 'James', 
      lastName: 'Wilson', 
      role: 'faculty', 
      departmentId: 'dept-art', 
      status: 'active',
      createdAt: new Date().toISOString()
    },
    { 
      id: 'alex.j@college.edu', 
      email: 'alex.j@college.edu', 
      firstName: 'Alex', 
      lastName: 'Johnson', 
      role: 'student', 
      departmentId: 'dept-eng', 
      semester: '5',
      batchYear: 'Batch-2026',
      password: 'password123',
      status: 'active',
      createdAt: new Date().toISOString()
    },
  ];
  initialUsers.forEach(user => {
    const ref = doc(db, 'colleges', collegeId, 'users', user.id);
    batch.set(ref, user);
  });

  await batch.commit();
}
