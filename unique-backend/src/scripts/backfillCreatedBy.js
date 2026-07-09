import { adminDb, adminAuth } from '../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

async function backfillCreatedBy() {
  if (!adminDb) {
    console.error('Database not configured. Check firebase-admin credentials.');
    process.exit(1);
  }

  const adminUid = process.env.ADMIN_UID;
  if (!adminUid) {
    console.error('Set ADMIN_UID in .env (the UID of the admin user who should own legacy enquiries)');
    process.exit(1);
  }

  console.log('Fetching all enquiries...');
  const snap = await adminDb.collection('enquiry').get();
  console.log(`Found ${snap.docs.length} enquiries total`);

  let backfilled = 0;
  let skipped = 0;

  for (const doc of snap.docs) {
    const data = doc.data();

    if (data.createdBy) {
      skipped++;
      continue;
    }

    await doc.ref.update({
      createdBy: adminUid,
      createdByName: 'admin (backfilled)',
    });
    backfilled++;
  }

  console.log(`Done: ${backfilled} backfilled, ${skipped} already had createdBy`);
  process.exit(0);
}

backfillCreatedBy().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
