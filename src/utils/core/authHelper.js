import { auth } from '../../firebase/config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';

// Demo user credentials for testing
export const DEMO_USERS = {
  manager: {
    email: 'manager@smartlab.com',
    password: 'manager123',
    role: 'manager',
    displayName: 'Ali Hassan',
    permissions: ['view_dashboard', 'manage_users', 'view_reports', 'manage_inventory']
  },
  technician: {
    email: 'tech@smartlab.com',
    password: 'tech123',
    role: 'technician',
    displayName: 'Fatima Ahmed',
    permissions: ['view_dashboard', 'enter_results', 'view_orders']
  },
  phlebotomist: {
    email: 'phleb@smartlab.com',
    password: 'phleb123',
    role: 'phlebotomist',
    displayName: 'Yusuf Ibrahim',
    permissions: ['view_dashboard', 'collect_samples', 'view_orders']
  }
};

// Function to create a demo user
export const createDemoUser = async (userType) => {
  const userData = DEMO_USERS[userType];
  if (!userData) {
    throw new Error(`Invalid user type: ${userType}`);
  }

  try {
    // First, try to sign in to see if user already exists
    try {
      await signInWithEmailAndPassword(auth, userData.email, userData.password);
      console.log(`✅ User ${userData.email} already exists and credentials are valid`);
      return null;
    } catch (signInError) {
      if (signInError.code === 'auth/user-not-found') {
        // User doesn't exist, create new user
        console.log(`Creating new user: ${userData.email}`);
        
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );

        // Create Firestore user document
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role,
          permissions: userData.permissions,
          department: 'Laboratory',
          isActive: true,
          createdAt: new Date()
        });

        console.log(`✅ Created demo user: ${userData.email}`);
        return userCredential.user;
      } else {
        // User exists but password is wrong - this shouldn't happen with our setup
        console.log(`⚠️ User ${userData.email} exists but password is incorrect`);
        return null;
      }
    }
  } catch (error) {
    console.error(`❌ Error creating user ${userData.email}:`, error);
    throw error;
  }
};

// Function to setup all demo users
export const setupDemoUsers = async () => {
  console.log('🚀 Setting up demo users...');
  
  for (const userType of Object.keys(DEMO_USERS)) {
    try {
      await createDemoUser(userType);
    } catch (error) {
      console.error(`Error creating ${userType} user:`, error);
    }
  }
  
  console.log('✅ Demo users setup complete!');
  console.log('\n📋 Demo Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  Object.entries(DEMO_USERS).forEach(([role, user]) => {
    console.log(`${role.toUpperCase()}:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  Role: ${user.role}`);
    console.log('');
  });
};

// Function to test login
export const testLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Login successful:', userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
};

// Function to test all demo users
export const testAllDemoUsers = async () => {
  console.log('🧪 Testing all demo user logins...');
  
  for (const [role, user] of Object.entries(DEMO_USERS)) {
    try {
      await testLogin(user.email, user.password);
      console.log(`✅ ${role} login test passed`);
    } catch (error) {
      console.error(`❌ ${role} login test failed:`, error.message);
    }
  }
};

// Auto-setup demo users when this module is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  console.log('🔧 Auth helper loaded. Run setupDemoUsers() to create test accounts.');
} 