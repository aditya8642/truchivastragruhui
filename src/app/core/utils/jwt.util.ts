// Minimal JWT payload decoder for DISPLAY purposes only (e.g. showing the
// logged-in user's email in the navbar). This does NOT verify the signature -
// the backend is the only thing that ever trusts this token's validity.
export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}
