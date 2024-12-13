'use client';

import { useState } from 'react';

interface ProcessingStatus {
  message: string;
  isError?: boolean;
  details?: {
    successes?: string[];
    errors?: string[];
  };
}

export default function Home() {
  const [status, setStatus] = useState<ProcessingStatus | null>(null);

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
    } catch (error) {
      setStatus({ 
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        isError: true 
      });
    }
  };

  return (
    <main className="p-5">
      <div className="max-w-7xl mx-auto">
        <h1 className="title">Individual Report Page</h1>
        <div className="space-y-4">
          <button 
            className="button"
            onClick={handleCreateCsv}
          >
            Create .csv files
          </button>
          
          {status && (
            <div className={`mt-4 p-4 rounded-lg ${
              status.isError 
                ? 'bg-red-900/50 text-red-200' 
                : 'bg-green-900/50 text-green-200'
            }`}>
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
