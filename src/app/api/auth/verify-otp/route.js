import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isFirebaseConfigured, db as firebaseDb } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

// Simple JWT token generation
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    phone: user.phone,
    role: (user.role || 'USER').toUpperCase(),
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

/**
 * Fetch user from Firebase Firestore
 * @param {string} phone - User's phone number
 * @returns {Object|null} - User object or null if not found
 */
async function fetchUserFromFirebase(phone) {
  if (!isFirebaseConfigured || !firebaseDb) {
    return null;
  }

  try {
    // Check userdata collection (where registration stores users)
    const userDocRef = doc(firebaseDb, 'userdata', phone);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
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
      return {
        id: userData.id || phone,
        name: userData.name || '',
        phone: userData.phone || phone,
        password: userData.password,
        role: (userData.role || 'USER').toUpperCase(),
        createdAt: userData.createdAt,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching user from Firebase:', error.message);
    return null;
  }
}

export async function POST(request) {
  try {
    const { phone, otp } = await request.json();

    // Validate input
    if (!phone || !otp) {
      return NextResponse.json(
        { message: 'Phone and OTP are required' },
        { status: 400 }
      );
    }

    // Step 1: Check OTP in Backend FIRST
    const otpData = db.getOtp(phone);
    if (!otpData) {
      return NextResponse.json(
        { message: 'OTP expired or not found' },
        { status: 400 }
      );
    }

    // Step 2: Check if OTP expired in Backend
    if (Date.now() > otpData.expiresAt) {
      db.deleteOtp(phone);
      return NextResponse.json(
        { message: 'OTP expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Step 3: Verify OTP in Backend
    if (otpData.otp !== otp) {
      return NextResponse.json(
        { message: 'Invalid OTP' },
        { status: 401 }
      );
    }

    // Step 4: Get user from Firebase FIRST, fallback to Backend
    let user = await fetchUserFromFirebase(phone);
    
    if (!user) {
      // Fallback to backend database
      user = db.findUserByPhone(phone);
    }
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Step 5: Delete used OTP from Backend
    db.deleteOtp(phone);

    // Step 6: Sync to Firebase (delete used OTP)
    if (isFirebaseConfigured && firebaseDb) {
      try {
        await deleteDoc(doc(firebaseDb, 'otps', phone));
        console.log('OTP deleted from Firebase:', phone);
      } catch (firebaseError) {
        console.error('Firebase delete error (non-critical):', firebaseError.message);
      }
    }

    // Step 7: Generate token
    const token = generateToken(user);
    
    // Normalize role to uppercase
    const normalizedRole = (user.role || 'USER').toUpperCase();

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: normalizedRole,
      },
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
