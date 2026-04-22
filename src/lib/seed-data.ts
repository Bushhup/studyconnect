import { doc, writeBatch, Firestore } from 'firebase/firestore';

/**
 * Seeds the Firestore database with initial sample data.
 * Provides real, linked data for all portals and ensures admin access.
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
    overview: 'A leading institutional hub for academic excellence and innovation.',
    statisticHighlights: [
      '100+ Programs',
      '5000+ Students',
      '85+ Research Labs',
      '94.2% Placement Rate'
    ],
    updatedAt: new Date().toISOString()
  }, { merge: true });

  // 2. Departments
  const departments = [
    { id: 'dept-eng', name: 'School of Engineering', headOfDept: 'Dr. Sarah Smith', programType: 'UG', totalSemesters: 8 },
    { id: 'dept-art', name: 'Arts & Design', headOfDept: 'Prof. James Wilson', programType: 'UG', totalSemesters: 8 },
    { id: 'dept-sci', name: 'Applied Sciences', headOfDept: 'Dr. Emily Davis', programType: 'UG', totalSemesters: 6 },
    { id: 'dept-bus', name: 'Management Studies', headOfDept: 'Dr. Michael Chen', programType: 'PG', totalSemesters: 4 },
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
    { id: 'course-ph101', code: 'PH101', name: 'Applied Physics', departmentId: 'dept-sci', credits: 4 },
  ];
  courses.forEach(course => {
    batch.set(doc(db, 'colleges', collegeId, 'courses', course.id), course, { merge: true });
  });

  // 4. Users (Emails as IDs)
  const initialUsers = [
    { 
      id: 'shabuddinaw@gmail.com', 
      email: 'shabuddinaw@gmail.com', 
      firstName: 'Shabuddin', 
      lastName: 'A', 
      role: 'admin', 
      status: 'active',
      createdAt: new Date().toISOString()
    },
    { 
      id: 'admin@college.edu', 
      email: 'admin@college.edu', 
      firstName: 'System', 
      lastName: 'Admin', 
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
      status: 'active'
    },
    { 
      id: 'james.wilson@college.edu', 
      email: 'james.wilson@college.edu', 
      firstName: 'James', 
      lastName: 'Wilson', 
      role: 'faculty', 
      departmentId: 'dept-art', 
      status: 'active'
    },
    { 
      id: 'emily.davis@college.edu', 
      email: 'emily.davis@college.edu', 
      firstName: 'Emily', 
      lastName: 'Davis', 
      role: 'faculty', 
      departmentId: 'dept-sci', 
      status: 'active'
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
      status: 'active'
    },
  ];
  
  initialUsers.forEach(user => {
    const userRef = doc(db, 'colleges', collegeId, 'users', user.id.toLowerCase());
    batch.set(userRef, user, { merge: true });

    // Seed Faculty Profiles
    if (user.role === 'faculty') {
      const profileRef = doc(db, 'colleges', collegeId, 'facultyProfiles', user.id.toLowerCase());
      batch.set(profileRef, {
        userId: user.id.toLowerCase(),
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        employeeId: `FAC-${user.id.slice(0, 4).toUpperCase()}`,
        designation: user.id.includes('sarah') ? 'Professor' : 'Assistant Professor',
        departmentId: user.departmentId,
        ugDegree: 'B.Tech Computer Science',
        pgDegree: 'M.Tech AI & Robotics',
        phd: 'Yes',
        yearsOfExperience: 12,
        employmentType: 'Permanent',
        specialization: 'Distributed Computing',
        feedbackRating: 4.8,
        publicationsCount: 14
      }, { merge: true });
    }
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
