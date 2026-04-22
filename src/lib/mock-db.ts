/**
 * @fileOverview Centralized Local Mock Database
 * Acts as a replacement for Firestore to "disconnect" from cloud errors.
 */

export const MOCK_COLLEGE = {
  id: 'study-connect-college',
  name: 'StudyConnect University',
  tagline: 'Connecting Minds, Building Futures'
};

export const MOCK_DEPARTMENTS = [
  { id: 'dept-1', name: 'Engineering' },
  { id: 'dept-2', name: 'Arts & Design' },
  { id: 'dept-3', name: 'Management' },
  { id: 'dept-4', name: 'Applied Sciences' },
];

export const MOCK_USERS = [
  {
    id: 'admin-uid',
    uid: 'admin-uid',
    email: 'shabuddinaw@gmail.com',
    password: 'adminpassword123',
    firstName: 'Master',
    lastName: 'Admin',
    role: 'admin',
    status: 'active'
  },
  {
    id: 'faculty-1',
    uid: 'faculty-1',
    email: 'sarah.smith@college.edu',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Smith',
    role: 'faculty',
    departmentId: 'dept-1',
    status: 'active'
  },
  {
    id: 'student-1',
    uid: 'student-1',
    email: 'alex.j@college.edu',
    password: 'password123',
    firstName: 'Alex',
    lastName: 'Johnson',
    role: 'student',
    degreeType: 'UG',
    departmentId: 'CSE',
    status: 'active',
    marks: {
      sem1: { cat1: 45, cat2: 42, model: 88, final: 92 }
    }
  }
];

export const MOCK_CLASSES = [
  { id: 'class-1', name: 'Computer Science - Section A', departmentId: 'dept-1', facultyId: 'faculty-1' },
  { id: 'class-2', name: 'UI/UX Fundamentals', departmentId: 'dept-2', facultyId: 'faculty-1' }
];

export const MOCK_RESOURCES = [
  { id: 'res-1', name: 'Academic Handbook 2024', category: 'Policy Documents', type: 'PDF', size: '2.4 MB', accessLevel: 'Public' },
  { id: 'res-2', name: 'Faculty Leave Form', category: 'Administrative Forms', type: 'Word', size: '0.5 MB', accessLevel: 'Faculty' }
];

export const MOCK_EVENTS = [
  { id: 'event-1', title: 'Tech Symposium', dateTime: new Date().toISOString(), description: 'Annual technology showcase.', location: 'Main Auditorium' }
];

export const MOCK_ACHIEVEMENTS = [
  { id: 'ach-1', title: 'Top Engineering Ranking', year: 2024, description: 'Ranked #1 in national surveys.', category: 'Academic' }
];

// Helper to get local state
export function getLocalData(collectionName: string) {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(`mock_${collectionName}`);
  if (saved) return JSON.parse(saved);
  
  // Initial load
  const initial = {
    users: MOCK_USERS,
    departments: MOCK_DEPARTMENTS,
    classes: MOCK_CLASSES,
    resources: MOCK_RESOURCES,
    events: MOCK_EVENTS,
    achievements: MOCK_ACHIEVEMENTS
  }[collectionName] || [];
  
  localStorage.setItem(`mock_${collectionName}`, JSON.stringify(initial));
  return initial;
}

export function setLocalData(collectionName: string, data: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`mock_${collectionName}`, JSON.stringify(data));
  // Dispatch a custom event to notify listeners
  window.dispatchEvent(new Event('mock-data-change'));
}
