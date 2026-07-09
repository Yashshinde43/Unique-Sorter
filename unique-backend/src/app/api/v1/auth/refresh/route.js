import { rateLimit } from '@/lib/rate-limit';
import { success, error } from '@/lib/response';

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

export async function POST(request) {
  try {
    const { refreshToken } = await request.json();
    if (!refreshToken) return error('Refresh token required', 400);
    if (!rateLimit(`refresh:${refreshToken.slice(-16)}`, 10, 60 * 1000)) return error('Too many refresh attempts. Please try again later.', 429);

    const res = await fetch(
      'https://securetoken.googleapis.com/v1/token?key=' + FIREBASE_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken }),
      }
    );

    const data = await res.json();
    if (!res.ok || !data.id_token) return error('Session expired. Please login again.', 401);

    return success({ idToken: data.id_token, refreshToken: data.refresh_token });
  } catch {
    return error('Internal server error', 500);
  }
}
