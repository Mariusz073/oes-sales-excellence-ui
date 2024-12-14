'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getJsonFiles } from './actions/getJsonFiles';

interface JsonFile {
  filename: string;
  displayName: string;
}

export default function Home() {
  const router = useRouter();
  const [jsonFiles, setJsonFiles] = useState<JsonFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');

  useEffect(() => {
    // Fetch JSON files when component mounts
    fetchJsonFiles();
  }, []);

  const fetchJsonFiles = async () => {
    try {
      const data = await getJsonFiles();
      setJsonFiles(data.files);
    } catch (error) {
      console.error('Error fetching JSON files:', error);
    }
  };

  const handleViewReport = () => {
    if (selectedFile) {
      // Ensure we're using the .json extension
      const filename = selectedFile.endsWith('.json') ? selectedFile : `${selectedFile}.json`;
      router.push(`/report?file=${encodeURIComponent(filename)}`);
    }
  };

  return (
    <main className="min-h-screen bg-[#1E1E1E] text-white p-8 font-normal">
      <div className="max-w-7xl mx-auto">
        <h1 className="title font-bold">Individual Report Page</h1>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select
                className="bg-[#252525] text-white px-4 py-3 rounded-lg text-base 
                          border-none outline-none focus:ring-2 focus:ring-[#ff6b6b] 
                          appearance-none cursor-pointer min-w-[200px] font-normal"
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1em'
                }}
              >
                <option value="">Select a report</option>
                {jsonFiles.map((file) => (
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
        </div>
      </div>
    </main>
  );
}
