import React from 'react';
import { getBackendUrl } from '../utils/config';

const DebugBackendUrl = () => {
  const backendUrl = getBackendUrl();
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'red', 
      color: 'white', 
      padding: '10px', 
      zIndex: 9999,
      fontSize: '12px'
    }}>
      Backend URL: {backendUrl}
      <br />
      Env: {import.meta.env.VITE_BACKEND_URL || 'undefined'}
    </div>
  );
};

export default DebugBackendUrl;