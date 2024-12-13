'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProcessingStatus {
  message: string;
  isError?: boolean;
  details?: {
    successes?: string[];
    errors?: string[];
  };
}

interface CsvFile {
  filename: string;
  displayName: string;
}

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [csvFiles, setCsvFiles] = useState<CsvFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');

  const handleCreateCsv = async () => {
    try {
      setStatus({ message: 'Processing files...' });
      
      const response = await fetch('/api/convert', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      setStatus({ 
        message: result.message, 
        isError: !result.success,
        details: result.details
      });

      // Set timeout to clear the status
      setTimeout(() => setStatus(null), 3000);

      // Refresh CSV files list after creating new files
      fetchCsvFiles();
    } catch (error) {
      setStatus({ 
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        isError: true 
      });
      // Set timeout to clear error status
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const fetchCsvFiles = async () => {
    try {
      const response = await fetch('/api/get-csv-files');
      const data = await response.json();
      setCsvFiles(data.files);
    } catch (error) {
      console.error('Error fetching CSV files:', error);
    }
  };

  const handleViewReport = () => {
    if (selectedFile) {
      router.push(`/report?file=${encodeURIComponent(selectedFile)}`);
    }
  };

  return (
    <main className="p-5">
      <div className="max-w-7xl mx-auto">
        <h1 className="title">Individual Report Page</h1>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button 
              className="button"
              onClick={handleCreateCsv}
            >
              Create .csv files
            </button>

            <div className="flex items-center gap-4">
              <select
                className="bg-neutral-800 text-white px-4 py-3 rounded-lg text-base 
                          border-none outline-none focus:ring-2 focus:ring-[#ff6b6b] 
                          appearance-none cursor-pointer min-w-[200px]"
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                onClick={fetchCsvFiles}
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1em'
                }}
              >
                <option value="">Select a report</option>
                {csvFiles.map((file) => (
                  <option key={file.filename} value={file.filename}>
                    {file.displayName}
                  </option>
                ))}
              </select>

              <button 
                className={`button ${!selectedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleViewReport}
                disabled={!selectedFile}
              >
                View report
              </button>
            </div>
          </div>
          
          {status && (
            <div 
              className={`status-message mt-4 p-4 rounded-lg ${
                status.isError 
                  ? 'bg-red-900/50 text-red-200' 
                  : 'bg-green-900/50 text-green-200'
              }`}
            >
              <p className="font-medium mb-2">{status.message}</p>
              
              {status.details?.successes && status.details.successes.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-green-200">Successful conversions:</p>
                  <ul className="list-disc list-inside mt-1">
                    {status.details.successes.map((success, index) => (
                      <li key={index} className="text-sm">{success}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {status.details?.errors && status.details.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-red-200">Errors:</p>
                  <ul className="list-disc list-inside mt-1">
                    {status.details.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
