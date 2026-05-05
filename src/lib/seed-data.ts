
import { doc, writeBatch, Firestore } from 'firebase/firestore';

/**
 * High-Fidelity Academic Seeding Engine
 * Generates a complete institutional hierarchy.
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
    statisticHighlights: ['120+ Programs', '5500+ Students', '94.2% Placement Rate'],
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

  // 3. Specific Test Accounts (Student/Faculty)
  const testUsers = [
    { email: 'fareedu46@gmail.com', fName: 'Fareed', lName: 'U', role: 'student', dept: 'dept-cse' },
    { email: 'sarah.smith@college.edu', fName: 'Sarah', lName: 'Smith', role: 'faculty', dept: 'dept-cse' },
    { email: 'shahabuddinosaid@gmail.com', fName: 'Shahabuddin', lName: 'Osaid', role: 'faculty', dept: 'dept-cse' }
  ];

  for (const u of testUsers) {
    const ref = doc(db, 'colleges', collegeId, 'users', u.email.toLowerCase());
    batch.set(ref, {
      id: u.email.toLowerCase(),
      email: u.email.toLowerCase(),
      firstName: u.fName,
      lastName: u.lName,
      role: u.role,
      departmentId: u.dept,
      password: 'password123',
      status: 'active',
      createdAt: new Date().toISOString()
    }, { merge: true });
    await checkBatch();
  }

  // 4. Department Definitions
  const DEPARTMENTS = [
    { id: 'dept-cse', name: 'Computer Science and Engineering', type: 'UG', sems: 8 },
    { id: 'dept-ece', name: 'Electronics and Communication', type: 'UG', sems: 8 },
    { id: 'dept-mba', name: 'School of Business Management', type: 'PG', sems: 4 },
  ];

  for (const dept of DEPARTMENTS) {
    const deptRef = doc(db, 'colleges', collegeId, 'departments', dept.id);
    batch.set(deptRef, {
      id: dept.id,
      name: dept.name,
      headOfDept: `Dr. ${dept.id.split('-')[1].toUpperCase()} Lead`,
      programType: dept.type,
      totalSemesters: dept.sems,
      createdAt: new Date().toISOString()
    }, { merge: true });
    await checkBatch();
  }

  await batch.commit();
}
