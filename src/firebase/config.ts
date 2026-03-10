
export const firebaseConfig = {
  "projectId": "studio-1138506612-7420e",
  "appId": "1:140002479123:web:2c5afeffb60386e523c3e5",
  "apiKey": "AIzaSyBJLIZ1vhIxhW05Q4Ybnw7B6HsUBiEw7To",
  "authDomain": "studio-1138506612-7420e.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "140002479123"
};

/**
 * DEPLOYMENT SYNC TRIGGER (V8 - USERNAME ARCHITECTURE)
 * ----------------------------------------------------
 * System directive: Update institutional access policies to support Username resolution.
 * 
 * 1. PATH: /colleges/study-connect-college/users
 *    - ALLOW: 'list', 'get'
 *    - CONDITION: Required for Username -> Email resolution during login.
 * 
 * 2. PATH: /colleges/study-connect-college/users/{userId}
 *    - ALLOW: 'create', 'read', 'update', 'delete' (CRUD)
 *    - CONDITION: requester.uid == userId OR requester.role == 'admin'.
 * 
 * This update ensures that the login portal can query the users collection by the 
 * 'username' field to identify the account before finalizing the authentication.
 */
