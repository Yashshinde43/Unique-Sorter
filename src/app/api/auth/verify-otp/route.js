import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// Simple JWT token generation
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    phone: user.phone,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

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

    // Step 1: Get OTP from Firebase
    const otpRef = doc(db, 'otps', phone);
    const otpDoc = await getDoc(otpRef);

    if (!otpDoc.exists()) {
      return NextResponse.json(
        { message: 'OTP expired or not found' },
        { status: 400 }
      );
    }

    const otpData = otpDoc.data();

    // Step 2: Check if OTP expired (5 minutes)
    const createdAt = otpData.createdAt?.toMillis() || Date.now();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - createdAt > fiveMinutes) {
      await deleteDoc(otpRef); // Clean up expired OTP
      return NextResponse.json(
        { message: 'OTP expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Step 3: Verify OTP
    if (otpData.otp !== otp) {
      return NextResponse.json(
        { message: 'Invalid OTP' },
        { status: 401 }
      );
    }

    // Step 4: Get user data from Firebase
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Step 5: Delete used OTP
    await deleteDoc(otpRef);

    // Step 6: Generate token
    const token = generateToken({ id: userDoc.id, ...userData });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: userDoc.id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        role: userData.role || 'user',
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
