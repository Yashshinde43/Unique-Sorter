import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth } from '@/lib/auth';
import { success, error } from '@/lib/response';

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return error(auth.error, auth.status);
    if (!adminDb) return success({ data: [] });

    const { id } = await params;
    const snapshot = await adminDb
      .collection('enquiry')
      .doc(id)
      .collection('auditLog')
      .orderBy('timestamp', 'desc')
      .get();

    const data = snapshot.docs.map(doc => {
      const d = doc.data();
      return { id: doc.id, ...d, timestamp: d.timestamp?.toDate?.()?.toISOString() ?? null };
    });

    return success({ data });
  } catch (err) {
    return error('Failed to fetch audit log', 500);
  }
}
