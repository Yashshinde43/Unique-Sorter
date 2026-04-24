import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET() {
  try {
    if (!adminDb) return Response.json({ success: false, error: 'Database not configured' }, { status: 503 });

    const snapshot = await adminDb
      .collection('enquiry')
      .orderBy('createdAt', 'desc')
      .get();

    const enquiries = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    return Response.json({ success: true, data: enquiries });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!adminDb) return Response.json({ success: false, error: 'Database not configured. Enquiry saved locally only.' }, { status: 503 });

    const body = await request.json();

    const docRef = await adminDb.collection('enquiry').add({
      ...body,
      createdAt: FieldValue.serverTimestamp(),
    });

    return Response.json({ success: true, id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error saving enquiry:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
