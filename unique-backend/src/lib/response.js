export function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export function error(message, status = 500) {
  return json({ success: false, error: message }, status);
}

export function success(data, status = 200) {
  return json({ success: true, ...data }, status);
}
