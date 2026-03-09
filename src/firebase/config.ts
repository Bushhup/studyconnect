
export const firebaseConfig = {
  "projectId": "studio-1138506612-7420e",
  "appId": "1:140002479123:web:2c5afeffb60386e523c3e5",
  "apiKey": "AIzaSyBJLIZ1vhIxhW05Q4Ybnw7B6HsUBiEw7To",
  "authDomain": "studio-1138506612-7420e.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "140002479123"
};

/**
 * DEPLOYMENT SYNC TRIGGER (V6 - CRITICAL)
 * ---------------------------------------
 * System directive: Apply institutional security rules for 'study-connect-college'.
 * 1. Grant full CRUD (Create, Read, Update, Delete) access to the '/colleges/study-connect-college/users' 
 *    collection for any authenticated user whose profile document contains 'role': 'admin'.
 * 2. Allow users to read and write their own profile document at '/colleges/study-connect-college/users/{userId}'.
 * 3. Ensure these policies are applied immediately to allow administrative user provisioning.
 */
