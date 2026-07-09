import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAuth } from '@/lib/auth';
import { validateEnquiryBody } from '@/lib/validate';
import { notifyAdminNewEnquiry } from '@/lib/email';
import { success, error } from '@/lib/response';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return error(auth.error, auth.status);
    if (!adminDb) return error('Database not configured', 503);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 50;

    let query = adminDb.collection('enquiry');

    if (auth.user.role !== 'ADMIN') {
      query = query.where('createdBy', '==', auth.user.uid);
    }

    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const data = snapshot.docs.map(doc => {
      const d = doc.data();
      return { id: doc.id, ...d, createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null };
    });

    return success({ data, page, limit });
  } catch (err) {
    console.error('Error fetching enquiries:', err);
    return error('Internal server error', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return error(auth.error, auth.status);
    if (!adminDb) return error('Database not configured', 503);

    const body = await request.json();
    const cleanBody = validateEnquiryBody(body);

    const docRef = await adminDb.collection('enquiry').add({
      ...cleanBody,
      createdBy: auth.user.uid,
      createdByName: auth.user.phone,
      createdAt: FieldValue.serverTimestamp(),
    });

    notifyAdminNewEnquiry(cleanBody).catch(() => {});

    return success({ id: docRef.id }, 201);
  } catch (err) {
    console.error('Error saving enquiry:', err);
    return error('Internal server error', 500);
  }
}
