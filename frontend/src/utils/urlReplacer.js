// Bulk URL replacement utility
import { getBackendUrl } from './config.js';

// This file helps replace all hardcoded localhost URLs
// Use: getBackendUrl() instead of 'http://localhost:8000'

export const replaceHardcodedUrls = () => {
  console.log('Use getBackendUrl() from config.js instead of hardcoded URLs');
  console.log('Backend URL:', getBackendUrl());
};