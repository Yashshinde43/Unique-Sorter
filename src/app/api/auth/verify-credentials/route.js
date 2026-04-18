import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(request) {
  try {
    const { phone, password } = await request.json();

    // Validate input
    if (!phone || !password) {
      return NextResponse.json(
        { message: 'Phone and password are required' },
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

    // Step 1: Check Firebase for user
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

    // Step 2: Verify password
    if (userData.password !== password) {
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 401 }
      );
    }

    // Step 3: Generate OTP and store in Firebase
    const otp = generateOTP();
    const otpRef = doc(db, 'otps', phone);
    await setDoc(otpRef, {
      phone,
      otp,
      createdAt: serverTimestamp(),
      expiresAt: serverTimestamp(), // Will expire after 5 minutes
      verified: false,
    });

    // TODO: Send OTP via SMS service
    console.log(`OTP for ${phone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      phone,
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
