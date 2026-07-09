import { verifyAuth } from '@/lib/auth';
import { success, error } from '@/lib/response';

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return error(auth.error, auth.status);

    const { phone } = await params;
    const { adminDb } = await import('@/lib/firebase-admin');
    if (!adminDb) return error('Service unavailable', 503);

    const doc = await adminDb.collection('userdata').doc(phone).get();
    if (!doc.exists) return error('User not found', 404);

    return success({ data: doc.data() });
  } catch (err) {
    console.error('Profile GET error:', err);
    return error('Internal error', 500);
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return error(auth.error, auth.status);

    const { phone } = await params;

    const callerPhone = auth.user.userId || auth.user.phone;
    if (callerPhone !== phone) return error('Forbidden', 403);

    const body = await request.json();
    const updates = {};
    if (body.name && typeof body.name === 'string' && body.name.trim().length > 0 && body.name.trim().length <= 100) {
      updates.name = body.name.trim();
    }

    if (Object.keys(updates).length === 0) return error('No valid fields to update', 400);

    const { adminDb } = await import('@/lib/firebase-admin');
    if (!adminDb) return error('Service unavailable', 503);

    await adminDb.collection('userdata').doc(phone).update(updates);
    return success({});
  } catch (err) {
    console.error('Profile PATCH error:', err);
    return error('Internal error', 500);
  }
}
