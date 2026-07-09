import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, verifyAdmin } from '@/lib/auth';
import { success, error } from '@/lib/response';

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return error(auth.error, auth.status);
    if (!adminDb) return error('Database not configured', 503);

    const { id } = await params;
    const doc = await adminDb.collection('quotations').doc(id).get();
    if (!doc.exists) return error('Not found', 404);

    const d = doc.data();
    return success({ data: { id: doc.id, ...d, createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null } });
  } catch (err) {
    return error('Internal server error', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAdmin(request);
    if (auth.error) return error(auth.error, auth.status);
    if (!adminDb) return error('Database not configured', 503);

    const { id } = await params;
    await adminDb.collection('quotations').doc(id).delete();
    return success({});
  } catch (err) {
    return error('Internal server error', 500);
  }
}
