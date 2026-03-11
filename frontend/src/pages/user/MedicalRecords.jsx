import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Upload, FileText, Trash2, Download, Calendar, FileCheck } from 'lucide-react';
import { getBackendUrl } from '../../utils/config';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    documentType: 'lab_report',
    file: null
  });

  const token = localStorage.getItem('token');

  const getDocumentTypeLabel = (type) => {
    const labels = {
      'lab_report': '🧪 Lab Report',
      'xray': '📷 X-Ray',
      'prescription': '💊 Prescription',
      'scan': '🔬 Scan',
      'ecg': '❤️ ECG/EKG',
      'vaccination': '💉 Vaccination',
      'discharge_summary': '🏥 Discharge Summary',
      'medical_history': '🩺 Medical History',
      'allergy_report': '⚠️ Allergy Report',
      'other': '📄 Other'
    };
    return labels[type] || type;
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${getBackendUrl()}/api/medical-records/my-records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('documentType', formData.documentType);
    data.append('file', formData.file);

    try {
      await axios.post(`${getBackendUrl()}/api/medical-records/upload`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Medical record uploaded successfully');
      setShowUpload(false);
      setFormData({ title: '', description: '', documentType: 'lab_report', file: null });
      fetchRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await axios.delete(`${getBackendUrl()}/api/medical-records/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Record deleted');
      fetchRecords();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-blue-900 mb-2">📋 How to Use Medical Records</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload all your medical documents here (reports, X-rays, prescriptions)</li>
          <li>• When you book an appointment, doctor can see these documents</li>
          <li>• Upload each document separately (one at a time)</li>
          <li>• You can upload multiple documents for different health issues</li>
        </ul>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Medical Records</h1>
        <button onClick={() => setShowUpload(!showUpload)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Upload size={18} /> Upload Record
        </button>
      </div>

      {showUpload && (
        <form onSubmit={handleUpload} className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
            <input 
              type="text" 
              placeholder="e.g., Blood Test Report, Chest X-Ray, Doctor Prescription" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" 
              required 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
            <textarea 
              placeholder="e.g., Blood test done on 15th Jan 2024, Sugar level normal" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" 
              rows="3" 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Document Type *</label>
            <select 
              value={formData.documentType} 
              onChange={(e) => setFormData({...formData, documentType: e.target.value})} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="lab_report">🧪 Lab Report - Blood Test, Urine Test, Sugar Test</option>
              <option value="xray">📷 X-Ray - Bone X-Ray, Chest X-Ray</option>
              <option value="prescription">💊 Prescription - Medicine List from Doctor</option>
              <option value="scan">🔬 Scan - CT Scan, MRI, Ultrasound, Sonography</option>
              <option value="ecg">❤️ ECG/EKG - Heart Test Report</option>
              <option value="vaccination">💉 Vaccination Record - Vaccine Certificates</option>
              <option value="discharge_summary">🏥 Discharge Summary - Hospital Discharge Papers</option>
              <option value="medical_history">🩺 Medical History - Previous Illness, Surgery Records</option>
              <option value="allergy_report">⚠️ Allergy Report - Medicine/Food Allergies</option>
              <option value="other">📄 Other - Any Other Medical Document</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Select the type of medical document you are uploading</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Upload File *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input 
                type="file" 
                onChange={(e) => setFormData({...formData, file: e.target.files[0]})} 
                className="w-full" 
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" 
                required 
              />
              <p className="text-xs text-gray-500 mt-2">Supported: JPG, PNG, PDF, DOC, DOCX (Max 10MB)</p>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {records.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
            <FileText className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Medical Records Yet</h3>
            <p className="text-gray-500">Upload your medical documents to share with doctors</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                    <FileText className="text-white" size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{record.title}</h3>
                    {record.description && (
                      <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileCheck size={14} />
                        {getDocumentTypeLabel(record.documentType)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(record.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={`${getBackendUrl()}/uploads/medical-records/${record.file}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download size={20} />
                  </a>
                  <button 
                    onClick={() => handleDelete(record._id)} 
                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
