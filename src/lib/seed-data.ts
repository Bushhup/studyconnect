import { doc, writeBatch, Firestore } from 'firebase/firestore';

/**
 * Seeds the Firestore database with initial sample data.
 * Follows the schema defined in docs/backend.json
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
    { id: 'dept-eng', name: 'Engineering', headOfDept: 'Dr. Sarah Smith' },
    { id: 'dept-art', name: 'Arts & Design', headOfDept: 'Prof. James Wilson' },
    { id: 'dept-sci', name: 'Applied Sciences', headOfDept: 'Dr. Emily Davis' },
    { id: 'dept-bus', name: 'Business & Management', headOfDept: 'Mr. Robert Brown' },
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
    { id: 'class-csa', name: 'Computer Science - Section A', departmentId: 'dept-eng', facultyId: 'faculty-1' },
    { id: 'class-uxb', name: 'UI/UX Design - Section B', departmentId: 'dept-art', facultyId: 'faculty-2' },
    { id: 'class-phys1', name: 'Physics Lab - Group 1', departmentId: 'dept-sci', facultyId: 'faculty-1' },
  ];
  classes.forEach(cls => {
    const ref = doc(db, 'colleges', collegeId, 'classes', cls.id);
    batch.set(ref, cls);
  });

  // 5. Initial Users (Faculty)
  const initialUsers = [
    { 
      id: 'faculty-1', 
      collegeId, 
      email: 'sarah.smith@college.edu', 
      firstName: 'Sarah', 
      lastName: 'Smith', 
      role: 'faculty', 
      departmentId: 'dept-eng', 
      status: 'active' 
    },
    { 
      id: 'faculty-2', 
      collegeId, 
      email: 'james.wilson@college.edu', 
      firstName: 'James', 
      lastName: 'Wilson', 
      role: 'faculty', 
      departmentId: 'dept-art', 
      status: 'active' 
    },
  ];
  initialUsers.forEach(user => {
    const ref = doc(db, 'colleges', collegeId, 'users', user.id);
    batch.set(ref, user);
  });

  await batch.commit();
}
