import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAuth, verifyAdmin } from '@/lib/auth';
import { success, error } from '@/lib/response';

const FIELD_LABELS = {
  customerName: 'Customer Name',
  millName: 'Mill / Company Name',
  mobile: 'Mobile No.',
  email: 'Email Address',
  gst: 'GST No.',
  source: 'Lead Source',
  location: 'City / Location',
  state: 'State',
  address: 'Full Address',
  hasRequirement: 'Requirement Type',
  futureNote: 'Future Note',
  followUpDate: 'Follow-up Date',
  probableMonth: 'Probable Month of Order',
  orderChances: '% Chances of Order',
  items: 'Items / Products',
};

function serialize(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'Yes — Immediate' : 'No — Future';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function diffFields(oldData, newData) {
  const changed = [];
  for (const field of Object.keys(FIELD_LABELS)) {
    if (serialize(oldData[field]) !== serialize(newData[field])) {
      changed.push(FIELD_LABELS[field]);
    }
  }
  return changed;
}

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return error(auth.error, auth.status);
    if (!adminDb) return error('Database not configured', 503);

    const { id } = await params;
    const doc = await adminDb.collection('enquiry').doc(id).get();
    if (!doc.exists) return error('Not found', 404);

    const d = doc.data();

    if (auth.user.role !== 'ADMIN' && d.createdBy !== auth.user.uid) {
      return error('Forbidden — you can only view your own enquiries', 403);
    }

    return success({ data: { id: doc.id, ...d, createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null } });
  } catch (err) {
    return error('Internal server error', 500);
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return error(auth.error, auth.status);
    if (!adminDb) return error('Database not configured', 503);

    const { id } = await params;
    const body = await request.json();
    const { id: _id, createdAt, _editedBy, ...fields } = body;

    const docRef = adminDb.collection('enquiry').doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return error('Not found', 404);

    if (auth.user.role !== 'ADMIN' && snap.data().createdBy !== auth.user.uid) {
      return error('Forbidden — you can only edit your own enquiries', 403);
    }

    const changes = diffFields(snap.data(), fields);

    const batch = adminDb.batch();
    batch.update(docRef, fields);

    if (changes.length > 0) {
      const logRef = docRef.collection('auditLog').doc();
      batch.set(logRef, { fields: changes, timestamp: FieldValue.serverTimestamp() });
    }

    await batch.commit();
    return success({ changesCount: changes.length });
  } catch (err) {
    console.error('Error updating enquiry:', err);
    return error('Internal server error', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAdmin(request);
    if (auth.error) return error(auth.error, auth.status);
    if (!adminDb) return error('Database not configured', 503);

    const { id } = await params;
    await adminDb.collection('enquiry').doc(id).delete();
    return success({});
  } catch (err) {
    return error('Internal server error', 500);
  }
}
