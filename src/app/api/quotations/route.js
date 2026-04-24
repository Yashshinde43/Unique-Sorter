import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET() {
  try {
    if (!adminDb) return Response.json({ success: false, error: 'Database not configured' }, { status: 503 });
    const snapshot = await adminDb
      .collection('quotations')
      .orderBy('createdAt', 'desc')
      .get();

    const quotations = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    return Response.json({ success: true, data: quotations });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!adminDb) return Response.json({ success: false, error: 'Database not configured' }, { status: 503 });
    const body = await request.json();

    // Use deterministic doc ID when coming from an enquiry to prevent duplicates
    if (body.enquiryId && body.quotationType) {
      const docId = `${body.enquiryId}_${body.quotationType}`;
      const docRef = adminDb.collection('quotations').doc(docId);
      const existing = await docRef.get();

      if (existing.exists) {
        // Already saved — return the existing ID without writing again
        return Response.json({ success: true, id: docId, duplicate: true });
      }

      await docRef.set({
        ...body,
        createdAt: FieldValue.serverTimestamp(),
      });

      return Response.json({ success: true, id: docId }, { status: 201 });
    }

    // Manual quotation — use auto-generated ID
    const docRef = await adminDb.collection('quotations').add({
      ...body,
      createdAt: FieldValue.serverTimestamp(),
    });

    return Response.json({ success: true, id: docRef.id }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
