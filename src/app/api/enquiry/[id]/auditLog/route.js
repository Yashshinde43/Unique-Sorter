import { adminDb } from '@/lib/firebase-admin';

export async function GET(request, { params }) {
  try {
    if (!adminDb) return Response.json({ success: true, data: [] });
    const { id } = await params;
    const snapshot = await adminDb
      .collection('enquiry')
      .doc(id)
      .collection('auditLog')
      .orderBy('timestamp', 'desc')
      .get();

    const logs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.()?.toISOString() ?? null,
      };
    });

    return Response.json({ success: true, data: logs });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
