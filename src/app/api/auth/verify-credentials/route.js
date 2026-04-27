import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isFirebaseConfigured, db as firebaseDb } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Fetch user from Firebase Firestore
 * @param {string} phone - User's phone number
 * @returns {Object|null} - User object or null if not found
 */
async function fetchUserFromFirebase(phone) {
  if (!isFirebaseConfigured || !firebaseDb) {
    console.log('Firebase not configured, skipping Firebase lookup');
    return null;
  }

  try {
    // Check userdata collection (where registration stores users)
    const userDocRef = doc(firebaseDb, 'userdata', phone);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User found in Firebase userdata:', phone);
      return {
        id: userData.id || phone,
        name: userData.name || '',
        phone: userData.phone || phone,
        password: userData.password,
        role: (userData.role || 'USER').toUpperCase(),
        createdAt: userData.createdAt,
      };
    }

    // Also check users collection as fallback
    const usersDocRef = doc(firebaseDb, 'users', phone);
    const usersDoc = await getDoc(usersDocRef);

    if (usersDoc.exists()) {
      const userData = usersDoc.data();
      console.log('User found in Firebase users:', phone);
      return {
        id: userData.id || phone,
        name: userData.name || '',
        phone: userData.phone || phone,
        password: userData.password,
        role: (userData.role || 'USER').toUpperCase(),
        createdAt: userData.createdAt,
      };
    }

    console.log('User not found in Firebase:', phone);
    return null;
  } catch (error) {
    console.error('Error fetching user from Firebase:', error.message);
    return null;
  }
}

/**
 * Sync user to backend in-memory database
 * @param {Object} user - User object
 */
function syncUserToBackend(user) {
  const existingUser = db.findUserByPhone(user.phone);
  if (!existingUser) {
    db.users.push({
      ...user,
      createdAt: user.createdAt || new Date().toISOString(),
    });
    console.log('User synced to backend:', user.phone);
  }
}

export async function POST(request) {
  try {
    const { phone, password, role } = await request.json();

    // Validate input
    if (!phone || !password || !role) {
      return NextResponse.json(
        { message: 'Phone, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate phone format (Indian)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['ADMIN', 'USER'];
    if (!validRoles.includes(role.toUpperCase())) {
      return NextResponse.json(
        { message: 'Invalid role selected' },
        { status: 400 }
      );
    }

    let user = null;

    // Step 1: Try to fetch user from Firebase FIRST (primary source)
    const firebaseUser = await fetchUserFromFirebase(phone);
    if (firebaseUser) {
      user = firebaseUser;
      // Sync to backend for OTP management
      syncUserToBackend(user);
    }

    // Step 2: If not found in Firebase, fallback to backend database
    if (!user) {
      console.log('Falling back to backend database for user:', phone);
      user = db.findUserByPhone(phone);
    }

    // Step 3: If user still not found, return error
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    // Step 4: Validate password
    if (user.password !== password) {
      return NextResponse.json(
        { message: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    // Step 5: Validate role - check if user's role matches selected role
    const userRole = (user.role || 'USER').toUpperCase();
    const selectedRole = role.toUpperCase();

    if (userRole !== selectedRole) {
      return NextResponse.json(
        { message: 'You are not assigned this role' },
        { status: 403 }
      );
    }

    // Step 6: Generate OTP and store in Backend
    const otp = generateOTP();
    db.storeOtp(phone, otp);

    console.log(`OTP stored for ${phone}: ${otp}`);

    // Step 7: Also store OTP in Firebase for persistence
    if (isFirebaseConfigured && firebaseDb) {
      try {
        await setDoc(doc(firebaseDb, 'otps', phone), {
          phone,
          otp,
          role: userRole,
          createdAt: serverTimestamp(),
          expiresAt: serverTimestamp(),
          verified: false,
        });
        console.log('OTP synced to Firebase:', phone);
      } catch (firebaseError) {
        console.error('Firebase OTP sync error (non-critical):', firebaseError.message);
      }
    }

    // TODO: Send OTP via SMS service
    console.log(`OTP for ${phone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      phone,
      role: userRole,
      // Remove this in production - only for testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });

  } catch (error) {
    console.error('Verify credentials error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
