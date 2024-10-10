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