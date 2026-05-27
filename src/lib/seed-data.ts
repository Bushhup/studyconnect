import { doc, writeBatch, Firestore } from 'firebase/firestore';

/**
 * High-Fidelity Academic Seeding Engine
 * Generates a complete institutional hierarchy with rich data.
 */
export async function seedDatabase(db: Firestore) {
  const collegeId = 'study-connect-college';
  
  const commitBatch = async (batch: any) => {
    await batch.commit();
    return writeBatch(db);
  };

  let batch = writeBatch(db);
  let opCount = 0;

  const checkBatch = async () => {
    opCount++;
    if (opCount >= 450) {
      batch = await commitBatch(batch);
      opCount = 0;
    }
  };

  // 1. Institutional Root
  const collegeRef = doc(db, 'colleges', collegeId);
  batch.set(collegeRef, {
    id: collegeId,
    name: 'StudyConnect Enterprise Institute',
    tagline: 'Connecting Minds, Building Futures',
    statisticHighlights: ['140+ Programs', '6,200+ Students', '96.4% Placement Rate'],
    updatedAt: new Date().toISOString()
  }, { merge: true });
  await checkBatch();

  // 2. Global Admins Registry
  const globalAdmins = [
    { email: 'shabu@gmail.com', fName: 'Shabu', lName: 'Osaid', pass: 'shabu123' },
    { email: 'shabuddinaw@gmail.com', fName: 'Shabuddin', lName: 'A', pass: 'shabu05413' },
    { email: 'admin@college.edu', fName: 'Master', lName: 'Admin', pass: 'minister123' },
    { email: 'usaid@gmail.com', fName: 'Usaid', lName: 'Admin', pass: 'password123' }
  ];

  for (const admin of globalAdmins) {
    const ref = doc(db, 'colleges', collegeId, 'users', admin.email.toLowerCase());
    batch.set(ref, {
      id: admin.email.toLowerCase(),
      email: admin.email.toLowerCase(),
      firstName: admin.fName,
      lastName: admin.lName,
      role: 'admin',
      password: admin.pass,
      status: 'active',
      mobileNumber: '90033 41725',
      createdAt: new Date().toISOString()
    }, { merge: true });
    await checkBatch();
  }

  // 3. Department Definitions (Expanded)
  const DEPARTMENTS = [
    { id: 'dept-cse', name: 'Computer Science and Engineering', type: 'UG', sems: 8, head: 'Dr. Alan Turing' },
    { id: 'dept-ece', name: 'Electronics and Communication', type: 'UG', sems: 8, head: 'Dr. Nikola Tesla' },
    { id: 'dept-mba', name: 'School of Business Management', type: 'PG', sems: 4, head: 'Dr. Peter Drucker' },
    { id: 'dept-bio', name: 'Biotechnology & Life Sciences', type: 'UG', sems: 8, head: 'Dr. Rosalind Franklin' },
    { id: 'dept-arch', name: 'Architecture & Design', type: 'UG', sems: 10, head: 'Ar. Zaha Hadid' },
  ];

  for (const dept of DEPARTMENTS) {
    const deptRef = doc(db, 'colleges', collegeId, 'departments', dept.id);
    batch.set(deptRef, {
      id: dept.id,
      name: dept.name,
      headOfDept: dept.head,
      programType: dept.type,
      totalSemesters: dept.sems,
      createdAt: new Date().toISOString()
    }, { merge: true });
    await checkBatch();
  }

  // 4. Test Student: fareedu46@gmail.com
  const studentRef = doc(db, 'colleges', collegeId, 'users', 'fareedu46@gmail.com');
  batch.set(studentRef, {
    id: 'fareedu46@gmail.com',
    email: 'fareedu46@gmail.com',
    firstName: 'Fareed',
    lastName: 'U',
    role: 'student',
    departmentId: 'dept-cse',
    semester: '5',
    password: 'password123',
    status: 'active',
    createdAt: new Date().toISOString()
  }, { merge: true });
  await checkBatch();

  // 5. Test Faculty: shahabuddinosaid@gmail.com
  const facultyRef = doc(db, 'colleges', collegeId, 'users', 'shahabuddinosaid@gmail.com');
  batch.set(facultyRef, {
    id: 'shahabuddinosaid@gmail.com',
    email: 'shahabuddinosaid@gmail.com',
    firstName: 'Shahabuddin',
    lastName: 'Osaid',
    role: 'faculty',
    departmentId: 'dept-cse',
    password: 'password123',
    status: 'active',
    createdAt: new Date().toISOString()
  }, { merge: true });
  await checkBatch();

  // 6. Enrich Faculty Profile
  const facProfileRef = doc(db, 'colleges', collegeId, 'facultyProfiles', 'shahabuddinosaid@gmail.com');
  batch.set(facProfileRef, {
    fullName: 'Dr. Shahabuddin Osaid',
    email: 'shahabuddinosaid@gmail.com',
    designation: 'Associate Professor',
    specialization: 'Distributed Systems & Cloud Infrastructure',
    yearsOfExperience: 12,
    pgDegree: 'M.Tech Computer Science',
    employmentType: 'Permanent',
    employeeId: 'FAC-OS-2024',
    areasOfInterest: 'Scalable backend architectures, Firebase integration, and AI flows.',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  await checkBatch();

  // 7. Courses Expansion
  const COURSES = [
    { id: 'cs-ml-402', code: 'CS-402', name: 'Machine Learning', dept: 'dept-cse', credits: 4 },
    { id: 'cs-algo-101', code: 'CS-101', name: 'Advanced Algorithms', dept: 'dept-cse', credits: 4 },
    { id: 'cs-cloud-505', code: 'CS-505', name: 'Cloud Infrastructure', dept: 'dept-cse', credits: 3 },
    { id: 'bio-gen-301', code: 'BIO-301', name: 'Genetics & Genomics', dept: 'dept-bio', credits: 4 },
    { id: 'mba-strat-102', code: 'MBA-102', name: 'Strategic Management', dept: 'dept-mba', credits: 3 }
  ];

  for (const course of COURSES) {
    const courseRef = doc(db, 'colleges', collegeId, 'courses', course.id);
    batch.set(courseRef, {
      ...course,
      departmentId: course.dept,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    await checkBatch();
  }

  // 8. Academic Records (Initial Data)
  const courseIds = ['cs-ml-402', 'cs-algo-101', 'cs-cloud-505'];
  for (const cId of courseIds) {
    const recordRef = doc(db, 'colleges', collegeId, 'academicRecords', `rec-fareed-${cId}`);
    batch.set(recordRef, {
      id: `rec-fareed-${cId}`,
      studentId: 'fareedu46@gmail.com',
      subjectId: cId,
      attendance: 92,
      marks: { cat1: 42, cat2: 45, model: 88, final: 0 },
      updatedAt: new Date().toISOString()
    }, { merge: true });
    await checkBatch();
  }

  // 9. Institutional Events
  const EVENTS = [
    { id: 'evt-1', title: 'Global Tech Summit 2025', date: '2025-03-15', category: 'Academic', location: 'Main Auditorium', departmentId: 'dept-cse' },
    { id: 'evt-2', title: 'Annual Cultural Fest', date: '2025-04-20', category: 'Cultural', location: 'Open Air Theatre', departmentId: 'Global' },
    { id: 'evt-3', title: 'Bio-Innovation Workshop', date: '2025-02-10', category: 'Workshop', location: 'Lab 102', departmentId: 'dept-bio' }
  ];

  for (const evt of EVENTS) {
    const ref = doc(db, 'colleges', collegeId, 'events', evt.id);
    batch.set(ref, {
      ...evt,
      description: `Join us for the ${evt.title}. A premier event exploring the latest in ${evt.category} excellence.`,
      createdAt: new Date().toISOString()
    }, { merge: true });
    await checkBatch();
  }

  // 10. Institutional Achievements
  const ACHIEVEMENTS = [
    { id: 'ach-1', title: 'QS World Ranking: Top 200', year: 2024, category: 'Institutional', departmentId: 'Global' },
    { id: 'ach-2', title: 'Best Research Paper: AI in Health', year: 2024, category: 'Research', departmentId: 'dept-cse' },
    { id: 'ach-3', title: 'National Sports Championship', year: 2023, category: 'Sports', departmentId: 'Global' }
  ];

  for (const ach of ACHIEVEMENTS) {
    const ref = doc(db, 'colleges', collegeId, 'achievements', ach.id);
    batch.set(ref, {
      ...ach,
      description: `Recognized globally for our ${ach.category} contribution. Milestone achieved in ${ach.year}.`,
      createdAt: new Date().toISOString()
    }, { merge: true });
    await checkBatch();
  }

  await batch.commit();
}
