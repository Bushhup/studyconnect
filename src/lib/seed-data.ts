
import { doc, writeBatch, Firestore } from 'firebase/firestore';

/**
 * Seeds the Firestore database with initial high-fidelity institutional data.
 * Provides real, linked data for all portals and ensures admin access.
 */
export async function seedDatabase(db: Firestore) {
  const collegeId = 'study-connect-college';
  const batch = writeBatch(db);

  // 1. College Root
  const collegeRef = doc(db, 'colleges', collegeId);
  batch.set(collegeRef, {
    id: collegeId,
    name: 'StudyConnect Enterprise Institute',
    logoUrl: '/logo.png',
    tagline: 'Connecting Minds, Building Futures',
    overview: 'A premium, multi-disciplinary institutional ecosystem dedicated to research-driven excellence and student-centric academic growth.',
    statisticHighlights: [
      '120+ Programs',
      '5500+ Students',
      '85+ Research Labs',
      '94.2% Placement Rate'
    ],
    updatedAt: new Date().toISOString()
  }, { merge: true });

  // 2. Departments
  const departments = [
    { id: 'dept-eng', name: 'School of Engineering', headOfDept: 'Dr. Sarah Smith', programType: 'UG', totalSemesters: 8 },
    { id: 'dept-art', name: 'Design & Creative Arts', headOfDept: 'Prof. James Wilson', programType: 'UG', totalSemesters: 8 },
    { id: 'dept-sci', name: 'Applied Sciences Hub', headOfDept: 'Dr. Emily Davis', programType: 'UG', totalSemesters: 6 },
    { id: 'dept-bus', name: 'Global Management Studies', headOfDept: 'Dr. Michael Chen', programType: 'PG', totalSemesters: 4 },
  ];
  departments.forEach(dept => {
    batch.set(doc(db, 'colleges', collegeId, 'departments', dept.id), dept, { merge: true });
  });

  // 3. Courses (Syllabus)
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

  // 4. Users (Using Email as ID for predictable rule-based access)
  const users = [
    { id: 'shabu@gmail.com', email: 'shabu@gmail.com', password: 'shabu123', firstName: 'Shabu', lastName: 'Osaid', role: 'admin', status: 'active', mobileNumber: '9344941725' },
    { id: 'shabuddinaw@gmail.com', email: 'shabuddinaw@gmail.com', password: 'shabu05413', firstName: 'Shabu', lastName: 'Osaid', role: 'admin', status: 'active', mobileNumber: '9344941725' },
    { id: 'admin@college.edu', email: 'admin@college.edu', password: 'minister123', firstName: 'Master', lastName: 'Admin', role: 'admin', status: 'active', mobileNumber: '9003341725' },
    { id: 'sarah.smith@college.edu', email: 'sarah.smith@college.edu', password: 'password123', firstName: 'Sarah', lastName: 'Smith', role: 'faculty', departmentId: 'dept-eng', status: 'active', designation: 'Professor', mobileNumber: '9944885566' },
    { id: 'robert.fox@college.edu', email: 'robert.fox@college.edu', password: 'password123', firstName: 'Robert', lastName: 'Fox', role: 'faculty', departmentId: 'dept-eng', status: 'active', designation: 'Associate Professor', mobileNumber: '9911223344' },
    { id: 'alex.j@college.edu', email: 'alex.j@college.edu', password: 'password123', firstName: 'Alex', lastName: 'Johnson', role: 'student', departmentId: 'dept-eng', semester: '5', batchYear: 'Batch-2026', status: 'active', classId: 'class-cse-a', mobileNumber: '9988776655' },
    { id: 'jessica.m@college.edu', email: 'jessica.m@college.edu', password: 'password123', firstName: 'Jessica', lastName: 'Miller', role: 'student', departmentId: 'dept-eng', semester: '5', batchYear: 'Batch-2026', status: 'active', classId: 'class-cse-a', mobileNumber: '9988112233' },
  ];

  users.forEach(user => {
    const userRef = doc(db, 'colleges', collegeId, 'users', user.id.toLowerCase());
    batch.set(userRef, { ...user, createdAt: new Date().toISOString() }, { merge: true });

    // Seed Faculty Profiles
    if (user.role === 'faculty') {
      const profileRef = doc(db, 'colleges', collegeId, 'facultyProfiles', user.id.toLowerCase());
      batch.set(profileRef, {
        userId: user.id.toLowerCase(),
        fullName: `Dr. ${user.firstName} ${user.lastName}`,
        email: user.email,
        employeeId: `FAC-${user.id.split('@')[0].toUpperCase()}`,
        designation: user.designation,
        departmentId: user.departmentId,
        yearsOfExperience: 12,
        employmentType: 'Permanent',
        specialization: 'Information Systems',
        feedbackRating: 4.8,
        publicationsCount: 14,
        bloodGroup: 'O+',
        gender: 'Female',
        aadharNumber: 'XXXX XXXX XXXX',
        mobileNumber: user.mobileNumber
      }, { merge: true });
    }

    // Seed Student Profiles
    if (user.role === 'student') {
      const profileRef = doc(db, 'colleges', collegeId, 'studentProfiles', user.id.toLowerCase());
      batch.set(profileRef, {
        userId: user.id.toLowerCase(),
        fullName: `${user.firstName} ${user.lastName}`,
        studentEmail: user.email,
        studentMobileNo: user.mobileNumber,
        gender: 'Male',
        dob: '2004-05-15',
        aadharNumber: 'XXXX XXXX XXXX',
        bloodGroup: 'B+',
        nationality: 'Indian',
        religion: 'Universal',
        community: 'OC',
        address: 'Institutional Hostels, Block B, Room 402',
        pincode: '600001',
        fatherName: 'Mr. Johnson',
        fatherOccupation: 'Government Services',
        motherName: 'Mrs. Johnson',
        motherOccupation: 'Home Maker',
        quota: 'Government',
        dateOfAdmission: new Date().toISOString()
      }, { merge: true });
    }
  });

  // 5. Classes (Sections)
  const classes = [
    { 
      id: 'class-cse-a', name: 'B.Tech CSE - Section A', departmentId: 'dept-eng', 
      facultyId: 'sarah.smith@college.edu', semester: '5', 
      studentIds: ['alex.j@college.edu', 'jessica.m@college.edu'],
      subjectHandlers: { 'course-ai402': 'sarah.smith@college.edu', 'course-cs101': 'robert.fox@college.edu' },
      timetable: {
        'Monday': { '09:00 AM - 10:00 AM': 'course-ai402', '10:00 AM - 11:00 AM': 'course-cs101' },
        'Wednesday': { '09:00 AM - 10:00 AM': 'course-cs101' }
      }
    },
    { 
      id: 'class-cse-b', name: 'B.Tech CSE - Section B', departmentId: 'dept-eng', 
      facultyId: 'robert.fox@college.edu', semester: '5', studentIds: [],
      subjectHandlers: { 'course-ai402': 'sarah.smith@college.edu' }
    }
  ];
  classes.forEach(cls => {
    batch.set(doc(db, 'colleges', collegeId, 'classes', cls.id), cls, { merge: true });
  });

  // 6. Academic Records (Simulated Performance)
  const records = [
    { id: 'rec-1', studentId: 'alex.j@college.edu', subjectId: 'course-ai402', attendance: 96, marks: { cat1: 45, cat2: 48, final: 92 } },
    { id: 'rec-2', studentId: 'jessica.m@college.edu', subjectId: 'course-ai402', attendance: 92, marks: { cat1: 42, cat2: 44, final: 88 } },
  ];
  records.forEach(rec => {
    batch.set(doc(db, 'colleges', collegeId, 'academicRecords', rec.id), rec, { merge: true });
  });

  await batch.commit();
}
