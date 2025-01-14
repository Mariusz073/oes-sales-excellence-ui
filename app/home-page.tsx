'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getJsonFiles } from './actions/getJsonFiles';
import { getTeamReportFiles } from './actions/getTeamReportFiles';
import LogoutButton from './components/LogoutButton';
import ChangePasswordDialog from './components/ChangePasswordDialog';

interface JsonFile {
  filename: string;
  displayName: string;
  weekNumber: number;
  dateRange?: string;
}

interface TeamReportFile {
  filename: string;
  displayName: string;
  weekNumber: number;
  reportingPeriod?: string;
}

import { UserPrivileges } from './types/types';

interface HomePageProps {
  isAdmin: boolean;
  privileges: UserPrivileges;
}

export default function HomePage({ isAdmin, privileges }: HomePageProps) {
  const router = useRouter();
  const [jsonFiles, setJsonFiles] = useState<JsonFile[]>([]);
  const [teamReportFiles, setTeamReportFiles] = useState<TeamReportFile[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [selectedPersonWeek, setSelectedPersonWeek] = useState<string>('');
  const [availablePersonWeeks, setAvailablePersonWeeks] = useState<number[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);

  // Update available weeks for individual reports when person changes
  useEffect(() => {
    if (selectedPerson) {
      const personFiles = jsonFiles.filter(file => file.filename.startsWith(selectedPerson));
      const weeks = personFiles.map(file => file.weekNumber)
        .sort((a, b) => a - b);
      setAvailablePersonWeeks(weeks);
      setSelectedPersonWeek(''); // Reset selected week when person changes
    } else {
      setAvailablePersonWeeks([]);
      setSelectedPersonWeek('');
    }
  }, [selectedPerson, jsonFiles]);

  // Update available weeks for team reports when team or analysis changes
  useEffect(() => {
    if (selectedTeam && selectedAnalysis) {
      const prefix = selectedTeam === 'monash' ? 'MONU' : 'SOL';
      const analysisType = selectedAnalysis === 'compliance' ? 'Compliance' : 'Behavioural';
      
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
    if (selectedPerson && selectedPersonWeek) {
      const selectedFile = jsonFiles.find(
        file => file.filename.startsWith(selectedPerson) && file.weekNumber === parseInt(selectedPersonWeek)
      );
      if (selectedFile) {
        window.open(`/report?file=${encodeURIComponent(selectedFile.filename)}`, '_blank');
      }
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
          <div className="flex items-center gap-4">
            <ChangePasswordDialog />
            <LogoutButton />
            {isAdmin && (
              <Link href="/admin" className="button">
                Admin Panel
              </Link>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <select
                  className={`bg-[#252525] text-white px-4 py-3 rounded-lg text-base 
                            border-none outline-none focus:ring-2 focus:ring-[#ff6b6b] 
                            appearance-none cursor-pointer min-w-[250px] font-medium
                            ${!isAdmin && !privileges.individualReports && (!privileges.allowedReports || privileges.allowedReports.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={selectedPerson}
                  aria-label="Select a report"
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  disabled={!isAdmin && !privileges.individualReports && (!privileges.allowedReports || privileges.allowedReports.length === 0)}
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1em'
                  }}
                >
                  <option value="">Select a report</option>
                  {Array.from(new Set(jsonFiles.map(file => file.filename.replace(/_W\d+\.json$/, ''))))
                    .filter(filename => 
                      isAdmin || 
                      privileges.individualReports || 
                      (privileges.allowedReports && privileges.allowedReports.some(allowed => allowed.startsWith(filename)))
                    )
                    .map((filename) => {
                      const displayName = jsonFiles.find(file => file.filename.startsWith(filename))?.displayName;
                      return (
                        <option key={filename} value={filename}>
                          {displayName}
                        </option>
                      );
                    })
                  }
                </select>

                <select
                  className={`bg-[#252525] text-white px-4 py-3 rounded-lg text-base 
                            border-none outline-none focus:ring-2 focus:ring-[#ff6b6b] 
                            appearance-none cursor-pointer min-w-[250px] font-medium
                            ${!selectedPerson ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={selectedPersonWeek}
                  aria-label="Select week number"
                  onChange={(e) => setSelectedPersonWeek(e.target.value)}
                  disabled={!selectedPerson}
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1em'
                  }}
                >
                  <option value="">Week</option>
                  {availablePersonWeeks.map((week) => {
                    const personFile = jsonFiles.find(file => 
                      file.filename.startsWith(selectedPerson) && file.weekNumber === week
                    );
                    return (
                      <option key={week} value={week}>
                        Week {week}: {personFile?.dateRange?.replace('_', ' - ')}
                      </option>
                    );
                  })}
                </select>

                <button
                  className={`button ${!selectedPerson || !selectedPersonWeek ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleViewReport}
                  disabled={!selectedPerson || !selectedPersonWeek}
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
              className={`bg-[#252525] text-white px-4 py-3 rounded-lg text-base 
                        border-none outline-none focus:ring-2 focus:ring-[#ff6b6b] 
                        appearance-none cursor-pointer min-w-[250px] font-medium
                        ${!isAdmin && !privileges.teamMonash && !privileges.teamSOL ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isAdmin && !privileges.teamMonash && !privileges.teamSOL}
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
              className={`bg-[#252525] text-white px-4 py-3 rounded-lg text-base 
                        border-none outline-none focus:ring-2 focus:ring-[#ff6b6b] 
                        appearance-none cursor-pointer min-w-[250px] font-medium
                        ${!isAdmin && !privileges.teamBehavioural && !privileges.teamCollaborative ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isAdmin && !privileges.teamBehavioural && !privileges.teamCollaborative}
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
              {(isAdmin || privileges.teamBehavioural) && <option value="behavioural">Behavioural-Collaborative planning</option>}
              {(isAdmin || privileges.teamCollaborative) && <option value="compliance">Compliance - Call recording disclosure</option>}
            </select>

              <select
              className="bg-[#252525] text-white px-4 py-3 rounded-lg text-base 
                        border-none outline-none focus:ring-2 focus:ring-[#ff6b6b] 
                        appearance-none cursor-pointer min-w-[250px] font-medium"
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
              <option value="">Week</option>
              {availableWeeks.map((week) => {
                const teamFile = teamReportFiles.find(file => 
                  file.filename.includes(`_W${week}`) && 
                  file.filename.includes(selectedTeam === 'monash' ? 'MONU' : 'SOL') &&
                  file.filename.includes(selectedAnalysis === 'compliance' ? 'Compliance' : 'Behavioural')
                );
                return (
                  <option key={week} value={week}>
                    Week {week}: {teamFile?.reportingPeriod?.replace('_', ' - ')}
                  </option>
                );
              })}
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
