import { adminDb } from '@/lib/firebase-admin';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection('enquiry').doc(id).get();
    if (!doc.exists) return Response.json({ success: false, error: 'Not found' }, { status: 404 });
    const data = doc.data();
    return Response.json({ success: true, data: { id: doc.id, ...data, createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null } });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { id: _id, createdAt, ...fields } = body;
    await adminDb.collection('enquiry').doc(id).update(fields);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await adminDb.collection('enquiry').doc(id).delete();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
