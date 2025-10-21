// Updated API Configuration for Lovable Edge Functions
const API_BASE_URL = '/api'; // Uses Lovable's edge functions

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Get auth headers for Supabase
export const getAuthHeaders = () => {
  // Supabase automatically handles auth headers
  // The edge functions will get the user from Supabase auth
  return {
    'Content-Type': 'application/json',
  };
};

export const handleApiResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};
