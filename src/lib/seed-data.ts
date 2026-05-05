
import { doc, writeBatch, Firestore } from 'firebase/firestore';

/**
 * High-Fidelity Academic Seeding Engine
 * Generates a complete institutional hierarchy following specific UG/PG rules.
 */
export async function seedDatabase(db: Firestore) {
  const collegeId = 'study-connect-college';
  
  // Helper to commit batches in chunks of 450 (Firestore limit is 500)
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
    { email: 'shahabuddinosaid@gmail.com', fName: 'Shahabuddin', lName: 'Osaid', pass: 'shabu123' },
    { email: 'shabuddinaw@gmail.com', fName: 'Shabuddin', lName: 'A', pass: 'shabu05413' },
    { email: 'admin@college.edu', fName: 'Master', lName: 'Admin', pass: 'minister123' },
    { email: 'fareedu46@gmail.com', fName: 'Fareed', lName: 'U', pass: 'password123' }
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

  // 3. Department Definitions
  const DEPARTMENTS = [
    { id: 'dept-cse', name: 'Computer Science and Engineering', type: 'UG', sems: 8, sections: ['A'] },
    { id: 'dept-ece', name: 'Electronics and Communication', type: 'UG', sems: 8, sections: ['A'] },
    { id: 'dept-mba', name: 'School of Business Management', type: 'PG', sems: 4, sections: ['A'] },
  ];

  // Iterate Departments
  for (const dept of DEPARTMENTS) {
    const deptRef = doc(db, 'colleges', collegeId, 'departments', dept.id);
    const hodName = `Dr. ${dept.id.split('-')[1].toUpperCase()} Head`;
    const hodEmail = `hod.${dept.id.split('-')[1]}@college.edu`;

    batch.set(deptRef, {
      id: dept.id,
      name: dept.name,
      headOfDept: hodName,
      programType: dept.type,
      totalSemesters: dept.sems,
      createdAt: new Date().toISOString()
    }, { merge: true });
    await checkBatch();

    // Create HOD Identity
    const hodUserRef = doc(db, 'colleges', collegeId, 'users', hodEmail);
    batch.set(hodUserRef, {
      id: hodEmail,
      email: hodEmail,
      firstName: hodName.split(' ')[0],
      lastName: hodName.split(' ').slice(1).join(' '),
      role: 'hod',
      departmentId: dept.id,
      password: 'password123',
      status: 'active',
      mobileNumber: `98400 ${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString()
    }, { merge: true });
    await checkBatch();

    // Create Faculty (3 per dept for fast seeding)
    for (let f = 1; f <= 3; f++) {
      const fEmail = `faculty${f}.${dept.id.split('-')[1]}@college.edu`;
      const fUserRef = doc(db, 'colleges', collegeId, 'users', fEmail);
      batch.set(fUserRef, {
        id: fEmail,
        email: fEmail,
        firstName: `Faculty_${f}`,
        lastName: dept.id.split('-')[1].toUpperCase(),
        role: 'faculty',
        departmentId: dept.id,
        password: 'password123',
        status: 'active',
        designation: f === 1 ? 'Professor' : 'Assistant Professor',
        mobileNumber: `99440 ${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: new Date().toISOString()
      }, { merge: true });
      await checkBatch();
      
      const fProfRef = doc(db, 'colleges', collegeId, 'facultyProfiles', fEmail);
      batch.set(fProfRef, {
        userId: fEmail,
        fullName: `Dr. Faculty_${f} ${dept.id.split('-')[1].toUpperCase()}`,
        email: fEmail,
        employeeId: `FAC-${dept.id.split('-')[1].toUpperCase()}-${f}`,
        designation: f === 1 ? 'Professor' : 'Assistant Professor',
        departmentId: dept.id,
        yearsOfExperience: 5 + f,
        employmentType: 'Permanent'
      }, { merge: true });
      await checkBatch();
    }

    // Create Classes and Students (Limited for stability)
    for (let sem = 1; sem <= Math.min(2, dept.sems); sem++) { // Only seed first 2 sems for fast bootstrap
      for (const sec of dept.sections) {
        const classId = `class-${dept.id.split('-')[1]}-s${sem}-${sec.toLowerCase()}`;
        const className = `${dept.name} - Sem ${sem} (Sec ${sec})`;
        
        const classRef = doc(db, 'colleges', collegeId, 'classes', classId);
        
        const studentIds: string[] = [];
        for (let s = 1; s <= 5; s++) { // 5 students per section
          const sEmail = `s${s}.${classId}@college.edu`;
          studentIds.push(sEmail);

          const sUserRef = doc(db, 'colleges', collegeId, 'users', sEmail);
          batch.set(sUserRef, {
            id: sEmail,
            email: sEmail,
            firstName: `Student_${s}`,
            lastName: `Batch_${sem}${sec}`,
            role: 'student',
            departmentId: dept.id,
            classId: classId,
            semester: sem.toString(),
            password: 'password123',
            status: 'active',
            createdAt: new Date().toISOString()
          }, { merge: true });
          await checkBatch();

          const sBioRef = doc(db, 'colleges', collegeId, 'studentProfiles', sEmail);
          batch.set(sBioRef, {
            userId: sEmail,
            fullName: `Student_${s} Batch_${sem}${sec}`,
            studentEmail: sEmail,
            gender: s % 2 === 0 ? 'Female' : 'Male',
            dateOfAdmission: new Date().toISOString(),
            nationality: 'Indian'
          }, { merge: true });
          await checkBatch();
        }

        batch.set(classRef, {
          id: classId,
          name: className,
          departmentId: dept.id,
          semester: sem.toString(),
          studentIds: studentIds,
          facultyId: `faculty1.${dept.id.split('-')[1]}@college.edu`,
          createdAt: new Date().toISOString()
        }, { merge: true });
        await checkBatch();
      }
    }
  }

  await batch.commit();
}
