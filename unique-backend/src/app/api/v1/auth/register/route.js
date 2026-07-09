import { rateLimit } from '@/lib/rate-limit';
import { isValidPhone } from '@/lib/validate';
import { notifyAdminNewRegistration } from '@/lib/email';
import { success, error } from '@/lib/response';

export async function POST(request) {
  try {
    const { name, phone, role = 'user' } = await request.json();

    if (!name || !phone) return error('Name and phone are required', 400);
    if (!isValidPhone(phone)) return error('Invalid phone number format', 400);
    if (!rateLimit(`register:${phone}`, 3, 60 * 60 * 1000)) return error('Too many registration attempts. Please try again later.', 429);
    if (role.toLowerCase() === 'admin') return error('Admin registration is not allowed. Contact an existing admin.', 403);

    const { adminDb, adminAuth } = await import('@/lib/firebase-admin');
    if (!adminDb || !adminAuth) return error('Service unavailable', 503);

    const existing = await adminDb.collection('userdata').doc(phone).get();
    if (existing.exists) return error('This phone number is already registered', 409);

    try {
      await adminAuth.createUser({ phoneNumber: '+91' + phone });
    } catch (err) {
      if (err.code !== 'auth/phone-number-already-exists') {
        console.error('Firebase Auth createUser error:', err.message);
        return error('Registration failed. Please try again.', 500);
      }
    }

    const authUser = await adminAuth.getUserByPhoneNumber('+91' + phone);
    await adminAuth.setCustomUserClaims(authUser.uid, { role: 'USER', userId: phone });

    await adminDb.collection('userdata').doc(phone).set({
      id: phone,
      name,
      phone,
      role: 'USER',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    notifyAdminNewRegistration({ name, phone, role: 'USER' }).catch(() => {});

    return success({
      message: 'Registration request submitted. An admin must approve your account before you can login.',
      user: { id: phone, name, phone, role: 'USER', status: 'pending' },
    }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return error('Internal server error', 500);
  }
}
