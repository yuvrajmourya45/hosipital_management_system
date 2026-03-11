export const getBackendUrl = () => {
  return import.meta.env.VITE_BACKEND_URL || 'https://hosipital-management-system-backend.onrender.com';
};