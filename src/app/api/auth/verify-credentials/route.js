import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isFirebaseConfigured, checkFirestoreAccess } from '@/lib/firebase';

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

    // Step 1: Check Backend FIRST
    const user = db.validateUser(phone, password);
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    // Step 2: Generate OTP and store in Backend FIRST
    const otp = generateOTP();
    db.storeOtp(phone, otp);

    console.log(`OTP stored in Backend for ${phone}: ${otp}`);

    // Step 3: Sync OTP to Firebase (background) - ONLY if configured AND accessible
    if (isFirebaseConfigured) {
      try {
        const { db: firebaseDb } = await import('@/lib/firebase');
        
        // Check if Firestore is actually accessible before trying to write
        const isAccessible = await checkFirestoreAccess();
        
        if (firebaseDb && isAccessible) {
          const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
          await setDoc(doc(firebaseDb, 'otps', phone), {
            phone,
            otp,
            createdAt: serverTimestamp(),
            expiresAt: serverTimestamp(),
            verified: false,
          });
          console.log('OTP synced to Firebase:', phone);
        }
      } catch (firebaseError) {
        console.error('Firebase sync error (non-critical):', firebaseError.message);
      }
    }

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
