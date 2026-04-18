import { NextResponse } from 'next/server';
import { createUser, findUserByPhone } from '@/lib/db';
import { syncUserToFirebase } from '@/lib/firebaseSync';

export async function POST(request) {
  try {
    const { name, phone, email, password, role = 'user' } = await request.json();

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

    // Check if user already exists
    const existingUser = findUserByPhone(phone);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this phone number already exists' },
        { status: 409 }
      );
    }

    // Step 1: Create user in backend first
    const user = createUser({
      name,
      phone,
      email,
      password, // In production, hash this password!
      role,
    });

    // Step 2: Sync to Firebase (background process)
    syncUserToFirebase(user).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
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
