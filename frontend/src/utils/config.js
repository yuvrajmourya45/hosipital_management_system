// Centralized backend URL configuration
// Force production URL for now - Updated at 2024-12-19 15:30
export const BACKEND_URL = 'https://hosipital-management-system-backend.onrender.com';

console.log('🔧 Config loaded at:', new Date().toISOString());
console.log('  - VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
console.log('  - Final BACKEND_URL:', BACKEND_URL);

export const getBackendUrl = () => {
  console.log('🌐 getBackendUrl() called, returning:', BACKEND_URL);
  return BACKEND_URL;
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/')) return `${BACKEND_URL}${imagePath}`;
  return `${BACKEND_URL}/uploads/${imagePath}`;
};

export const getMedicalRecordUrl = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  if (filePath.startsWith('/')) return `${BACKEND_URL}${filePath}`;
  return `${BACKEND_URL}/uploads/medical-records/${filePath}`;
};