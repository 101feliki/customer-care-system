// components/BulkImportModal.tsx
import React, { useState, useRef } from 'react';
import { XMarkIcon, CloudArrowUpIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (recipients: Array<{name: string, email: string, phone?: string}>) => void;
  token: string;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose,  token }) => {
  const [file, setFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/)) {
      setError('Please upload a CSV or Excel file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size should be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    previewFile(selectedFile);
  };

  const previewFile = (file: File) => {
    const reader = new FileReader();
    
    if (file.name.endsWith('.csv')) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').slice(0, 6); // Preview first 6 rows
        const preview = lines.map(line => {
          const [name, email, phone] = line.split(',').map(field => field.trim());
          return { name, email, phone };
        }).filter(r => r.name && r.email);
        setPreviewData(preview);
      };
      reader.readAsText(file);
    }
  };

  const handleUpload = async () => {
    if (!file || !token) return;

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', file.name.endsWith('.csv') ? 'csv' : 'excel');

    try {
      const response = await fetch('http://localhost:3001/recipients/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result = await response.json();
      alert(`✅ Successfully imported ${result.count} recipients`);
      onClose();
      
      // Refresh the page or update recipients list
      window.location.reload();
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Import Recipients</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Upload CSV or Excel file with recipient data</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            disabled={isUploading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* File Upload Area */}
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
            
            <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {file ? file.name : 'Click to select file'}
            </p>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload CSV or Excel file (Max 10MB)
            </p>
            
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              Required columns: <strong>name, email</strong> (phone is optional)
            </p>
          </div>

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Preview (First {previewData.length} rows)</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {previewData.map((row, index) => (
                      <tr key={index} className="bg-white dark:bg-gray-800">
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{row.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{row.email}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{row.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}

          {/* Download Template */}
          <div className="mt-6">
            <button
              onClick={() => {
                // Create CSV template
                const csvContent = "data:text/csv;charset=utf-8,name,email,phone\nJohn Doe,john@example.com,1234567890\nJane Smith,jane@example.com,\"\"";
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "recipients_template.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
              Download CSV Template
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isUploading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                Importing...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Import Recipients
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;