// Store the token in localStorage
export const storeToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// Get the token from localStorage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Clear the token from localStorage
export const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

// Decode JWT token and get the payload
export const getPayload = (): any | null => {
  const token = getToken();
  if (!token) return null;

  const payloadBase64 = token.split('.')[1];
  const decodedPayload = atob(payloadBase64);
  return JSON.parse(decodedPayload);
};

// Check if the token is expired
export const isTokenExpired = (): boolean => {
  const payload = getPayload();
  if (!payload || !payload.exp) return true; // No token or no expiration info
  
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  return currentTime >= payload.exp;
};