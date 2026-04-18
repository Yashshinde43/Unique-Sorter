import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isFirebaseConfigured, checkFirestoreAccess } from '@/lib/firebase';

export async function POST(request) {
  try {
    const { name, phone, password, role = 'user' } = await request.json();

    // Validate input
    if (!name || !phone || !password) {
      return NextResponse.json(
        { message: 'Name, phone, and password are required' },
        { status: 400 }
      );
    }

    // Validate phone format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Step 1: Check Backend FIRST
    const existingUser = db.findUserByPhone(phone);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this phone number already exists' },
        { status: 409 }
      );
    }

    // Step 2: Create user in Backend FIRST
    const user = db.createUser({
      name,
      phone,
      password,
      role,
    });

    // Step 3: Sync to Firebase (background) - ONLY if configured AND accessible
    if (isFirebaseConfigured) {
      try {
        const { db: firebaseDb } = await import('@/lib/firebase');
        
        // Check if Firestore is actually accessible before trying to write
        const isAccessible = await checkFirestoreAccess();
        
        if (firebaseDb && isAccessible) {
          const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
          // Store user data in 'userdata' collection with phone as document ID
          // Include password for authentication
          await setDoc(doc(firebaseDb, 'userdata', user.phone), {
            id: user.id,
            name: user.name,
            phone: user.phone,
            password: user.password,
            role: user.role,
            createdAt: user.createdAt,
            syncedAt: serverTimestamp(),
          });
          console.log('User synced to Firebase userdata:', user.phone);
        } else if (!isAccessible) {
          console.log('Firestore database not accessible. User stored in backend only.');
          console.log('To enable Firebase sync, create the Firestore database in Firebase Console:');
          console.log('https://console.firebase.google.com/ -> Firestore Database -> Create database');
        }
      } catch (firebaseError) {
        console.error('Firebase sync error (non-critical):', firebaseError.message);
        // Continue - user is already stored in backend
      }
    } else {
      console.log('Firebase not configured. User stored in backend only.');
    }

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET all users (for debugging)
export async function GET() {
  return NextResponse.json({
    users: db.users.map(u => ({ id: u.id, name: u.name, phone: u.phone, role: u.role })),
  });
}
