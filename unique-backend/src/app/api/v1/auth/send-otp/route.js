import { isValidPhone } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';
import { success, error } from '@/lib/response';

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

export async function POST(request) {
  try {
    const { phone, checkOnly } = await request.json();

    if (!phone) return error('Phone number is required', 400);
    if (!isValidPhone(phone)) return error('Invalid phone number format', 400);
    if (!rateLimit('otp:' + phone, 5, 60 * 60 * 1000)) return error('Too many OTP requests. Please try again later.', 429);

    const { adminDb } = await import('@/lib/firebase-admin');
    if (!adminDb) return error('Service unavailable', 503);

    const userDoc = await Promise.race([
      adminDb.collection('userdata').doc(phone).get(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]);

    if (!userDoc.exists) return error('This phone number is not registered. Please register first.', 404);

    const userName = userDoc.data().name || '';

    if (checkOnly) {
      return success({ message: 'User verified', userName });
    }

    const firebaseRes = await fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=' + FIREBASE_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '+91' + phone, recaptchaToken: '' }),
      }
    );

    const firebaseData = await firebaseRes.json();
    if (!firebaseRes.ok || !firebaseData.sessionInfo) {
      console.error('Firebase SMS error:', firebaseData);
      return error('Failed to send OTP. Please try again.', 500);
    }

    await adminDb.collection('otps').doc(phone).set({
      sessionInfo: firebaseData.sessionInfo,
      phone,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    return success({ message: 'OTP sent to +91' + phone, userName });
  } catch (err) {
    console.error('Send OTP error:', err);
    return error('Internal server error', 500);
  }
}
