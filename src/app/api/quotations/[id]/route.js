import { adminDb } from '@/lib/firebase-admin';

export async function GET(_, { params }) {
  try {
    const doc = await adminDb.collection('quotations').doc(params.id).get();
    if (!doc.exists) {
      return Response.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    const data = doc.data();
    return Response.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      },
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    await adminDb.collection('quotations').doc(params.id).delete();
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
