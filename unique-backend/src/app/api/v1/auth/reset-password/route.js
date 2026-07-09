import { rateLimit } from '@/lib/rate-limit';
import { success, error } from '@/lib/response';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { phone, newPassword } = await request.json();

    if (!phone || !newPassword) return error('Phone and new password are required', 400);
    if (newPassword.length < 6) return error('Password must be at least 6 characters', 400);
    if (!rateLimit(`reset-pw:${phone}`, 3, 60 * 60 * 1000)) return error('Too many reset attempts. Try again later.', 429);

    const { adminDb } = await import('@/lib/firebase-admin');
    if (!adminDb) return error('Service unavailable', 503);

    const userDoc = await adminDb.collection('userdata').doc(phone).get();
    if (!userDoc.exists) return error('User not found', 404);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await adminDb.collection('userdata').doc(phone).update({ password: hashedPassword });

    return success({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    return error('Internal server error', 500);
  }
}
