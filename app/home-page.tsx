'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getJsonFiles } from './actions/getJsonFiles';
import { getTeamReportFiles } from './actions/getTeamReportFiles';

interface JsonFile {
  filename: string;
  displayName: string;
}

import { UserPrivileges } from './types/types';

interface HomePageProps {
  isAdmin: boolean;
  privileges: UserPrivileges;
}

export default function HomePage({ isAdmin, privileges }: HomePageProps) {
  const router = useRouter();
  const [jsonFiles, setJsonFiles] = useState<JsonFile[]>([]);
  const [teamReportFiles, setTeamReportFiles] = useState<JsonFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);

  // Update available weeks when team or analysis changes
  useEffect(() => {
    if (selectedTeam && selectedAnalysis) {
      const prefix = selectedTeam === 'monash' ? 'MONU' : 'SOL';
      const analysisType = selectedAnalysis === 'compliance' ? 'Compliance' : 'Behavioral';
      
      // Get all files that match the pattern
      const matchingFiles = teamReportFiles.filter(file => 
        file.filename.includes(prefix) && 
        file.filename.includes(analysisType)
      );

      // Extract week numbers
      const weeks = matchingFiles.map(file => {
        const match = file.filename.match(/W(\d+)/);
        return match ? match[1] : null;
      }).filter((week): week is string => week !== null)
        .sort((a, b) => parseInt(a) - parseInt(b));

      setAvailableWeeks(weeks);
      setSelectedWeek(''); // Reset selected week when team or analysis changes
    } else {
      setAvailableWeeks([]);
      setSelectedWeek('');
    }
  }, [selectedTeam, selectedAnalysis, teamReportFiles]);

  useEffect(() => {
    // Fetch files when component mounts
    fetchJsonFiles();
    fetchTeamReportFiles();
  }, []);

  const fetchJsonFiles = async () => {
    try {
      const data = await getJsonFiles();
      setJsonFiles(data.files);
    } catch (error) {
      console.error('Error fetching JSON files:', error);
    }
  };

  const fetchTeamReportFiles = async () => {
    try {
      const data = await getTeamReportFiles();
      setTeamReportFiles(data.files);
    } catch (error) {
      console.error('Error fetching team report files:', error);
    }
  };

  const handleViewReport = () => {
    if (selectedFile) {
      // Ensure we're using the .json extension
      const filename = selectedFile.endsWith('.json') ? selectedFile : `${selectedFile}.json`;
      window.open(`/report?file=${encodeURIComponent(filename)}`, '_blank');
    }
  };

  const handleViewTeamReport = () => {
    if (selectedTeam && selectedAnalysis && selectedWeek) {
      // Open in new tab
      window.open(`/team_report?team=${selectedTeam}&analysis=${selectedAnalysis}&week=${selectedWeek}`, '_blank');
    }
  };

  return (
    <main className="min-h-screen bg-[#1E1E1E] text-white p-8 font-normal">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="title font-bold">Individual Report Page</h1>
          {isAdmin && (
            <Link href="/admin" className="button">
              Admin Panel
            </Link>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <select
                className={`bg-[#252525] text-white px-4 py-3 rounded-lg text-base 
                          border-none outline-none focus:ring-2 focus:ring-[#ff6b6b] 
                          appearance-none cursor-pointer min-w-[200px] font-normal
                          ${!isAdmin && !privileges.individualReports ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={selectedFile}
                aria-label="Select individual report"
                onChange={(e) => setSelectedFile(e.target.value)}
                disabled={!isAdmin && !privileges.individualReports}
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
        <h1 className="title font-bold mt-16">Team Report Page</h1>
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-4">
              <select
              className="bg-[#252525] text-white px-4 py-3 rounded-lg text-base 
                        border-none outline-none focus:ring-2 focus:ring-[#ff6b6b] 
                        appearance-none cursor-pointer min-w-[200px] font-normal"
              value={selectedTeam}
              aria-label="Select team"
              onChange={(e) => setSelectedTeam(e.target.value)}
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1em'
              }}
            >
              <option value="">Team</option>
              {(isAdmin || privileges.teamMonash) && <option value="monash">Monash</option>}
              {(isAdmin || privileges.teamSOL) && <option value="sol">SOL</option>}
            </select>

              <select
              className="bg-[#252525] text-white px-4 py-3 rounded-lg text-base 
                        border-none outline-none focus:ring-2 focus:ring-[#ff6b6b] 
                        appearance-none cursor-pointer min-w-[200px] font-normal"
              value={selectedAnalysis}
              aria-label="Select analysis type"
              onChange={(e) => setSelectedAnalysis(e.target.value)}
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1em'
              }}
            >
              <option value="">Kind of analysis</option>
              {(isAdmin || privileges.teamBehavioural) && <option value="behavioral">Behavioral-Collaborative planning</option>}
              {(isAdmin || privileges.teamCollaborative) && <option value="compliance">Compliance - Call recording disclosure</option>}
            </select>

              <select
              className="bg-[#252525] text-white px-4 py-3 rounded-lg text-base 
                        border-none outline-none focus:ring-2 focus:ring-[#ff6b6b] 
                        appearance-none cursor-pointer min-w-[200px] font-normal"
              value={selectedWeek}
              aria-label="Select week number"
              onChange={(e) => setSelectedWeek(e.target.value)}
              disabled={!selectedTeam || !selectedAnalysis}
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1em'
              }}
            >
              <option value="">Week number</option>
              {availableWeeks.map((week) => (
                <option key={week} value={week}>
                  Week {week}
                </option>
              ))}
            </select>

            <button
              className={`button ${!selectedTeam || !selectedAnalysis || !selectedWeek ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleViewTeamReport}
              disabled={!selectedTeam || !selectedAnalysis || !selectedWeek}
            >
              View report
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
