import { doc, writeBatch, Firestore } from 'firebase/firestore';

/**
 * Seeds the Firestore database with initial sample data.
 * Provides real, linked data for all portals.
 */
export async function seedDatabase(db: Firestore) {
  const collegeId = 'study-connect-college';
  const batch = writeBatch(db);

  // 1. College Root
  const collegeRef = doc(db, 'colleges', collegeId);
  batch.set(collegeRef, {
    id: collegeId,
    name: 'StudyConnect University',
    logoUrl: '/logo.png',
    tagline: 'Connecting Minds, Building Futures',
    overview: 'A leading institutional hub for academic excellence and innovation.'
  }, { merge: true });

  // 2. Departments
  const departments = [
    { id: 'dept-eng', name: 'Engineering & Technology', headOfDept: 'Dr. Sarah Smith', programType: 'UG', totalSemesters: 8 },
    { id: 'dept-art', name: 'Arts & Design', headOfDept: 'Prof. James Wilson', programType: 'UG', totalSemesters: 8 },
    { id: 'dept-sci', name: 'Applied Sciences', headOfDept: 'Dr. Emily Davis', programType: 'UG', totalSemesters: 6 },
  ];
  departments.forEach(dept => {
    batch.set(doc(db, 'colleges', collegeId, 'departments', dept.id), dept, { merge: true });
  });

  // 3. Courses
  const courses = [
    { id: 'course-cs101', code: 'CS101', name: 'Intro to Computer Science', departmentId: 'dept-eng', credits: 4 },
    { id: 'course-ai402', code: 'AI402', name: 'Machine Learning Systems', departmentId: 'dept-eng', credits: 4 },
    { id: 'course-ds201', code: 'DS201', name: 'Data Structures & Algorithms', departmentId: 'dept-eng', credits: 3 },
    { id: 'course-ux101', code: 'UX101', name: 'User Experience Principles', departmentId: 'dept-art', credits: 3 },
  ];
  courses.forEach(course => {
    batch.set(doc(db, 'colleges', collegeId, 'courses', course.id), course, { merge: true });
  });

  // 4. Users (Linked via Emails) - Critical for login
  const initialUsers = [
    { 
      id: 'shabuddinaw@gmail.com', email: 'shabuddinaw@gmail.com', 
      firstName: 'Shabuddin', lastName: 'A', role: 'admin', status: 'active',
      createdAt: new Date().toISOString()
    },
    { 
      id: 'admin@college.edu', email: 'admin@college.edu', 
      firstName: 'System', lastName: 'Admin', role: 'admin', status: 'active',
      createdAt: new Date().toISOString()
    },
    { 
      id: 'sarah.smith@college.edu', email: 'sarah.smith@college.edu', 
      firstName: 'Sarah', lastName: 'Smith', role: 'faculty', 
      departmentId: 'dept-eng', status: 'active'
    },
    { 
      id: 'alex.j@college.edu', email: 'alex.j@college.edu', 
      firstName: 'Alex', lastName: 'Johnson', role: 'student', 
      departmentId: 'dept-eng', semester: '5', batchYear: 'Batch-2026', status: 'active'
    },
  ];
  initialUsers.forEach(user => {
    batch.set(doc(db, 'colleges', collegeId, 'users', user.id), user, { merge: true });
  });

  // 5. Classes
  const classes = [
    { 
      id: 'class-cse-a', name: 'CSE - Section A', departmentId: 'dept-eng', 
      facultyId: 'sarah.smith@college.edu', semester: '5', studentIds: ['alex.j@college.edu'],
      subjectHandlers: { 'course-ai402': 'sarah.smith@college.edu' }
    }
  ];
  classes.forEach(cls => {
    batch.set(doc(db, 'colleges', collegeId, 'classes', cls.id), cls, { merge: true });
  });

  await batch.commit();
}