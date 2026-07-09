import { isValidPhone } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';
import { success, error } from '@/lib/response';

export async function POST(request) {
  try {
    const { phone } = await request.json();

    if (!phone) return error('Phone number is required', 400);
    if (!isValidPhone(phone)) return error('Invalid phone number format', 400);
    if (!rateLimit(`verify-cred:${phone}`, 10, 60 * 1000)) return error('Too many attempts. Please try again later.', 429);

    const { adminDb } = await import('@/lib/firebase-admin');
    if (!adminDb) return error('Service unavailable', 503);

    const userDoc = await Promise.race([
      adminDb.collection('userdata').doc(phone).get(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]);

    if (!userDoc.exists) return error('This phone number is not registered. Please register first.', 404);

    const data = userDoc.data();
    return success({
      message: 'Phone number verified. OTP will be sent.',
      verified: true,
      user: { name: data.name || '', phone: data.phone || phone, role: (data.role || 'USER').toUpperCase() },
    });
  } catch (err) {
    console.error('Verify credentials error:', err);
    return error('Internal server error', 500);
  }
}
