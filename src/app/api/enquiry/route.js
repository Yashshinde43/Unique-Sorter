import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET() {
  try {
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
    const body = await request.json();

    console.log('=== NEW ENQUIRY RECEIVED ===');
    console.log(JSON.stringify(body, null, 2));
    console.log('============================');

    const docRef = await adminDb.collection('enquiry').add({
      ...body,
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log('Enquiry saved to Firestore with ID:', docRef.id);

    return Response.json({ success: true, id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error saving enquiry:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
