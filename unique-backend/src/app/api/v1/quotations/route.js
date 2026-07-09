import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAuth } from '@/lib/auth';
import { validateQuotationBody } from '@/lib/validate';
import { success, error } from '@/lib/response';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return error(auth.error, auth.status);
    if (!adminDb) return error('Database not configured', 503);

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100);

    const snapshot = await adminDb
      .collection('quotations')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const data = snapshot.docs.map(doc => {
      const d = doc.data();
      return { id: doc.id, ...d, createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null };
    });

    return success({ data, limit });
  } catch (err) {
    return error('Internal server error', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return error(auth.error, auth.status);
    if (!adminDb) return error('Database not configured', 503);

    const body = await request.json();
    const cleanBody = validateQuotationBody(body);

    if (cleanBody.enquiryId && cleanBody.quotationType) {
      const docId = `${cleanBody.enquiryId}_${cleanBody.quotationType}`;
      const docRef = adminDb.collection('quotations').doc(docId);
      const existing = await docRef.get();

      if (existing.exists) {
        return success({ id: docId, duplicate: true });
      }

      await docRef.set({ ...cleanBody, createdAt: FieldValue.serverTimestamp() });
      return success({ id: docId }, 201);
    }

    const docRef = await adminDb.collection('quotations').add({
      ...cleanBody,
      createdAt: FieldValue.serverTimestamp(),
    });

    return success({ id: docRef.id }, 201);
  } catch (err) {
    return error('Internal server error', 500);
  }
}
