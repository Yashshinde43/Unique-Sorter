import { rateLimit } from '@/lib/rate-limit';
import { success, error } from '@/lib/response';

export async function POST(request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) return error('Firebase ID token is required', 400);
    if (!rateLimit(`verify-token:${idToken.slice(-16)}`, 10, 60 * 1000)) return error('Too many attempts. Please try again later.', 429);

    const { adminAuth, adminDb } = await import('@/lib/firebase-admin');
    if (!adminAuth) return error('Auth service unavailable', 503);

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return error('Invalid or expired token', 401);
    }

    const phone = (decoded.phone_number || '').replace(/^\+91/, '');
    if (!phone) return error('No phone number in token', 400);
    if (!adminDb) return error('Database unavailable', 503);

    const userDoc = await Promise.race([
      adminDb.collection('userdata').doc(phone).get(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]);

    if (!userDoc.exists) return error('This phone number is not registered. Please register first.', 404);

    const data = userDoc.data();
    if (data.status === 'pending') return error('Your account is pending admin approval. Please contact an administrator.', 403);

    const role = (data.role || 'USER').toUpperCase();
    const userId = data.id || phone;

    await adminAuth.setCustomUserClaims(decoded.uid, { role, userId });

    return success({
      message: 'Login successful',
      user: { id: userId, name: data.name || '', phone, role, allowedScreens: data.allowedScreens || null },
    });
  } catch (err) {
    console.error('verify-token error:', err);
    return error('Internal server error', 500);
  }
}
