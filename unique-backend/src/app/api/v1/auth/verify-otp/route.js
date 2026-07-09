import { rateLimit } from '@/lib/rate-limit';
import { success, error } from '@/lib/response';

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

export async function POST(request) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) return error('Phone and OTP are required', 400);
    if (!rateLimit('verify-otp:' + phone, 5, 60 * 60 * 1000)) return error('Too many attempts. Please request a new OTP.', 429);

    const { adminDb, adminAuth } = await import('@/lib/firebase-admin');
    if (!adminDb || !adminAuth) return error('Service unavailable', 503);

    const otpDoc = await Promise.race([
      adminDb.collection('otps').doc(phone).get(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]);

    if (!otpDoc.exists) return error('OTP not found. Please request a new one.', 400);

    const otpData = otpDoc.data();
    if (new Date(otpData.expiresAt) < new Date()) {
      await adminDb.collection('otps').doc(phone).delete();
      return error('OTP has expired. Please request a new one.', 400);
    }

    const verifyRes = await fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=' + FIREBASE_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionInfo: otpData.sessionInfo, code: otp }),
      }
    );

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.idToken) {
      const msg = verifyData.error?.message || '';
      if (msg.includes('INVALID_CODE')) return error('Invalid OTP. Please try again.', 401);
      if (msg.includes('SESSION_EXPIRED')) return error('OTP has expired. Please request a new one.', 400);
      return error('Verification failed. Please try again.', 401);
    }

    await adminDb.collection('otps').doc(phone).delete().catch(() => {});

    const decoded = await adminAuth.verifyIdToken(verifyData.idToken);
    const cleanPhone = (decoded.phone_number || '+91' + phone).replace(/^\+91/, '');

    const userDoc = await adminDb.collection('userdata').doc(cleanPhone).get();
    if (!userDoc.exists) return error('User not found.', 404);

    const data = userDoc.data();
    if (data.status === 'pending') return error('Your account is pending admin approval.', 403);

    const role = (data.role || 'USER').toUpperCase();
    const userId = data.id || cleanPhone;

    await adminAuth.setCustomUserClaims(decoded.uid, { role, userId });

    const refreshRes = await fetch(
      'https://securetoken.googleapis.com/v1/token?key=' + FIREBASE_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: verifyData.refreshToken }),
      }
    );

    const refreshData = await refreshRes.json();
    if (!refreshRes.ok || !refreshData.id_token) return error('Login failed. Please try again.', 500);

    return success({
      message: 'Login successful',
      idToken: refreshData.id_token,
      refreshToken: refreshData.refresh_token,
      user: { id: userId, name: data.name || '', phone: cleanPhone, role },
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return error('Internal server error', 500);
  }
}
