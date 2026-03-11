// NEW CONFIG FILE - Force cache refresh
export const BACKEND_URL = 'https://hosipital-management-system-backend.onrender.com';

console.log('🚀 NEW CONFIG LOADED - PRODUCTION BACKEND ONLY');
console.log('Backend URL:', BACKEND_URL);

export const getBackendUrl = () => {
  console.log('🌐 Using production backend:', BACKEND_URL);
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