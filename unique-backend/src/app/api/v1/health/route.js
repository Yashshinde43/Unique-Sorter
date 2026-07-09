import { success } from '@/lib/response';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  return success({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    firebase: !!(adminDb && adminAuth),
  });
}
