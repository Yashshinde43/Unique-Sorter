import { verifyAuth } from '@/lib/auth';
import { notifyUserApproved } from '@/lib/email';
import { success, error } from '@/lib/response';

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return error(auth.error, auth.status);

    const { name, phone, email } = await request.json();
    if (!name || !phone) return error('Name and phone required', 400);

    const result = await notifyUserApproved({ name, phone, email });
    return success({ message: result.error || 'Notification sent' });
  } catch (err) {
    console.error('Notify approved error:', err);
    return error('Internal error', 500);
  }
}
