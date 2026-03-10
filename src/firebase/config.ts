
export const firebaseConfig = {
  "projectId": "studio-1138506612-7420e",
  "appId": "1:140002479123:web:2c5afeffb60386e523c3e5",
  "apiKey": "AIzaSyBJLIZ1vhIxhW05Q4Ybnw7B6HsUBiEw7To",
  "authDomain": "studio-1138506612-7420e.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "140002479123"
};

/**
 * DEPLOYMENT SYNC TRIGGER (V9 - UNKNOWN USERNAME RESOLUTION)
 * -----------------------------------------------------------
 * System directive: Update institutional access policies to support unauthenticated Username resolution.
 * 
 * 1. PATH: /colleges/study-connect-college/users
 *    - ALLOW: 'list' (Query with Username filter)
 *    - CONDITION: Required for Username -> Email resolution BEFORE login (Unauthenticated).
 * 
 * 2. PATH: /colleges/study-connect-college/users/{userId}
 *    - ALLOW: 'get'
 *    - CONDITION: Allowed for unauthenticated requests during the identity resolution phase.
 * 
 * 3. PATH: /colleges/study-connect-college/users/{userId}
 *    - ALLOW: 'create', 'update', 'delete'
 *    - CONDITION: requester.uid == userId OR requester.role == 'admin'.
 */
