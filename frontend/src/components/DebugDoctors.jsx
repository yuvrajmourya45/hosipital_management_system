import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getBackendUrl } from '../utils/config';

const DebugDoctors = () => {
  const [backendStatus, setBackendStatus] = useState('checking...');
  const [doctorsData, setDoctorsData] = useState(null);
  const [error, setError] = useState(null);

  const testBackend = async () => {
    const backendUrl = getBackendUrl();
    console.log('Testing backend URL:', backendUrl);
    
    try {
      // Test basic connectivity
      const response = await axios.get(`${backendUrl}/api/doctors`);
      setBackendStatus('connected');
      setDoctorsData(response.data);
      console.log('Backend response:', response.data);
    } catch (err) {
      setBackendStatus('failed');
      setError(err.message);
      console.error('Backend test failed:', err);
    }
  };

  const seedDoctors = async () => {
    try {
      const backendUrl = getBackendUrl();
      const response = await axios.post(`${backendUrl}/api/seed-doctors`);
      console.log('Seed response:', response.data);
      alert('Doctors seeded successfully!');
      testBackend(); // Refresh data
    } catch (err) {
      console.error('Seed failed:', err);
      alert('Failed to seed doctors: ' + err.message);
    }
  };

  useEffect(() => {
    testBackend();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg m-4">
      <h3 className="text-lg font-bold mb-4">🔧 Backend Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <p><strong>Backend URL:</strong> {getBackendUrl()}</p>
        <p><strong>Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded ${
            backendStatus === 'connected' ? 'bg-green-100 text-green-800' :
            backendStatus === 'failed' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {backendStatus}
          </span>
        </p>
        
        {error && (
          <p className="text-red-600"><strong>Error:</strong> {error}</p>
        )}
        
        <p><strong>Doctors Count:</strong> {doctorsData ? doctorsData.length : 'N/A'}</p>
        
        {doctorsData && doctorsData.length > 0 && (
          <div>
            <strong>Sample Doctor:</strong>
            <pre className="bg-white p-2 rounded text-xs overflow-auto">
              {JSON.stringify(doctorsData[0], null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-4 space-x-2">
        <button 
          onClick={testBackend}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Test Again
        </button>
        
        <button 
          onClick={seedDoctors}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Seed Doctors
        </button>
      </div>
    </div>
  );
};

export default DebugDoctors;