import { rateLimit } from '@/lib/rate-limit';
import { success, error } from '@/lib/response';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) return error('Phone/email and password are required', 400);
    if (!rateLimit(`login-pw:${identifier}`, 5, 60 * 1000)) return error('Too many login attempts. Please try again later.', 429);

    const { adminDb, adminAuth } = await import('@/lib/firebase-admin');
    if (!adminDb || !adminAuth) return error('Service unavailable', 503);

    let userDoc = null;
    let phone = null;
    const isPhone = /^[6-9]\d{9}$/.test(identifier);

    if (isPhone) {
      phone = identifier;
      userDoc = await Promise.race([
        adminDb.collection('userdata').doc(identifier).get(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
      ]);
    } else {
      const snapshot = await adminDb.collection('userdata')
        .where('email', '==', identifier.toLowerCase().trim())
        .limit(1)
        .get();
      if (!snapshot.empty) {
        userDoc = snapshot.docs[0];
        phone = userDoc.data().phone || userDoc.id;
      }
    }

    if (!userDoc || !userDoc.exists) return error('Invalid credentials', 401);

    const data = userDoc.data();
    if (!data.password) return error('Password not set. Please use OTP login or contact admin.', 401);

    let passwordValid = false;
    if (data.password.startsWith('$2b$') || data.password.startsWith('$2a$')) {
      passwordValid = await bcrypt.compare(password, data.password);
    } else {
      passwordValid = data.password === password;
    }

    if (!passwordValid) return error('Invalid credentials', 401);
    if (data.status === 'pending') return error('Your account is pending admin approval. Please contact an administrator.', 403);

    const role = (data.role || 'USER').toUpperCase();
    const userId = data.id || phone;

    let authUser;
    try {
      authUser = await adminAuth.getUserByPhoneNumber('+91' + phone);
    } catch {
      return error('Account not fully set up. Please use OTP login.', 400);
    }

    await adminAuth.setCustomUserClaims(authUser.uid, { role, userId });
    const customToken = await adminAuth.createCustomToken(authUser.uid, { role, userId });

    return success({
      message: 'Login successful',
      customToken,
      user: { id: userId, name: data.name || '', phone, role, allowedScreens: data.allowedScreens || null },
    });
  } catch (err) {
    console.error('Password login error:', err);
    return error('Internal server error', 500);
  }
}
