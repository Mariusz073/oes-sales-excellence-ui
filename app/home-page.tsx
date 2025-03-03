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
  const [selectedPersonAnalysis, setSelectedPersonAnalysis] = useState<string>('');
  const [selectedPersonWeek, setSelectedPersonWeek] = useState<string>('');
  const [availablePersonWeeks, setAvailablePersonWeeks] = useState<number[]>([]);
  const [availableAnalysisTypes, setAvailableAnalysisTypes] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);

  // Options for individual report analysis
  const analysisOptions = [
    { code: 'COLL', label: 'Collaborative Planning' },
    { code: 'ADAP', label: 'Adaptability' },
    { code: 'CLEA', label: 'Clear and Effective Communication' },
    { code: 'CONF', label: 'Confidence and Expertise' },
    { code: 'CONS', label: 'Consultative Approach' },
    { code: 'EMPA', label: 'Empathy' },
    { code: 'ACTI', label: 'Active Listening' },
    { code: 'OBJE', label: 'Objection Handling' },
    { code: 'PROF', label: 'Professionalism and Composure' },
    { code: 'ONEC', label: 'One Call Resolution' },
    { code: 'ENRO', label: 'Enrolment closing' }
  ];

  // Options for team report analysis
  const teamAnalysisOptions = [
    { value: 'behavioural-coll', label: 'Behavioural-Collaborative Planning', code: 'COLL' },
    { value: 'behavioural-adap', label: 'Behavioural-Adaptability', code: 'ADAP' },
    { value: 'behavioural-clea', label: 'Behavioural-Clear and Effective Communication', code: 'CLEA' },
    { value: 'behavioural-conf', label: 'Behavioural-Confidence and Expertise', code: 'CONF' },
    { value: 'behavioural-cons', label: 'Behavioural-Consultative Approach', code: 'CONS' },
    { value: 'behavioural-empa', label: 'Behavioural-Empathy', code: 'EMPA' },
    { value: 'behavioural-acti', label: 'Behavioural-Active Listening', code: 'ACTI' },
    { value: 'behavioural-obje', label: 'Behavioural-Objection Handling', code: 'OBJE' },
    { value: 'behavioural-prof', label: 'Behavioural-Professionalism and Composure', code: 'PROF' },
    { value: 'behavioural-onec', label: 'Behavioural-One Call Resolution', code: 'ONEC' },
    { value: 'compliance', label: 'Compliance - Call recording disclosure' }
  ];

  // Update available options for individual reports
  useEffect(() => {
    if (selectedPerson) {
      // Get all available analysis types for the selected person
      const personFiles = jsonFiles.filter(file => file.filename.startsWith(selectedPerson));
      const analysisTypes = new Set(personFiles.map(file => {
        const match = file.filename.match(/_([A-Z]+)_/);
        return match ? match[1] : null;
      }).filter(Boolean));
      setAvailableAnalysisTypes(Array.from(analysisTypes));

      // Update available weeks if analysis is selected
      if (selectedPersonAnalysis) {
        const weeksForAnalysis = personFiles
          .filter(file => file.filename.includes(selectedPersonAnalysis))
          .map(file => file.weekNumber)
          .sort((a, b) => a - b);
        setAvailablePersonWeeks(weeksForAnalysis);

        // If current week is not available, clear it
        if (selectedPersonWeek && !weeksForAnalysis.includes(parseInt(selectedPersonWeek))) {
          setSelectedPersonWeek('');
        }
      }
    } else {
      setAvailableAnalysisTypes([]);
      setAvailablePersonWeeks([]);
    }
  }, [selectedPerson, selectedPersonAnalysis, jsonFiles]);

  // Update available weeks for team reports when team or analysis changes
  useEffect(() => {
    if (selectedTeam && selectedAnalysis) {
      const prefix = selectedTeam === 'monash' ? 'MONU' : 'SOL';
      const selectedOption = teamAnalysisOptions.find(option => option.value === selectedAnalysis);
      
      // Get all files that match the pattern
      const matchingFiles = teamReportFiles.filter(file => {
        const filename = file.filename;
        if (selectedAnalysis === 'compliance') {
          return filename.includes(prefix) && filename.includes('Compliance');
        } else {
          // For behavioral reports, match the specific code
          return filename.includes(prefix) && 
                 filename.includes('Behavioural') && 
                 filename.includes(selectedOption?.code || '');
        }
      });

      // Extract week numbers
      const weeks = matchingFiles.map(file => {
        const match = file.filename.match(/W(\d+)/);
        return match ? match[1] : null;
      }).filter((week): week is string => week !== null)
        .sort((a, b) => parseInt(a) - parseInt(b));

      setAvailableWeeks(weeks);
      if (selectedWeek && !weeks.includes(selectedWeek)) {
        setSelectedWeek('');
      }
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

  const isReportAvailable = () => {
    if (!selectedPerson || !selectedPersonAnalysis || !selectedPersonWeek) return false;
    
    return jsonFiles.some(file => 
      file.filename.startsWith(selectedPerson) && 
      file.filename.includes(selectedPersonAnalysis) && 
      file.weekNumber === parseInt(selectedPersonWeek)
    );
  };

  const handleViewReport = () => {
    if (selectedPerson && selectedPersonAnalysis && selectedPersonWeek && isReportAvailable()) {
      const selectedFile = jsonFiles.find(
        file => file.filename.startsWith(selectedPerson) && 
               file.filename.includes(selectedPersonAnalysis) && 
               file.weekNumber === parseInt(selectedPersonWeek)
      );
      if (selectedFile) {
        const isEnrolmentReport = selectedFile.filename.includes('ENRO');
        const reportPath = isEnrolmentReport ? '/report/enrolment' : '/report';
        window.open(`${reportPath}?file=${encodeURIComponent(selectedFile.filename)}`, '_blank');
      }
    }
  };

  const handleViewTeamReport = () => {
    if (selectedTeam && selectedAnalysis && selectedWeek) {
      const prefix = selectedTeam === 'monash' ? 'MONU' : 'SOL';
      const selectedOption = teamAnalysisOptions.find(option => option.value === selectedAnalysis);
      
      // Find the matching file to get its exact name
      const teamFile = teamReportFiles.find(file => {
        const filename = file.filename;
        if (selectedAnalysis === 'compliance') {
          return filename.includes(prefix) && 
                 filename.includes('Compliance') && 
                 filename.includes(`W${selectedWeek}`);
        } else {
          return filename.includes(prefix) && 
                 filename.includes('Behavioural') && 
                 filename.includes(selectedOption?.code || '') && 
                 filename.includes(`W${selectedWeek}`);
        }
      });

      if (teamFile) {
        // For behavioral reports, use 'behavioural' as the analysis type and include the code
        const analysisType = selectedAnalysis === 'compliance' ? 'compliance' : 'behavioural';
        const analysisCode = selectedOption?.code || '';
        window.open(`/team_report?team=${selectedTeam}&analysis=${analysisType}&code=${analysisCode}&week=${selectedWeek}`, '_blank');
      }
    }
  };

  const baseSelectStyles = `bg-[#252525] text-white px-4 py-3 rounded-lg text-base 
                          border-none outline-none focus:ring-2 focus:ring-[#ff6b6b] 
                          appearance-none cursor-pointer font-medium`;

  const standardWidth = 'w-[300px]';
  const analysisWidth = 'w-[469px]';

  const dropdownArrowStyle = {
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    backgroundSize: '1em'
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
        <div className="mt-4">
          <div className="flex items-center gap-4">
            <select
              className={`${baseSelectStyles} ${standardWidth} ${!isAdmin && !privileges.individualReports && (!privileges.allowedReports || privileges.allowedReports.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={selectedPerson}
              aria-label="Select a report"
              onChange={(e) => {
                setSelectedPerson(e.target.value);
              }}
              disabled={!isAdmin && !privileges.individualReports && (!privileges.allowedReports || privileges.allowedReports.length === 0)}
              style={dropdownArrowStyle}
            >
              <option value="">Select a report</option>
              {Array.from(new Set(jsonFiles.map(file => {
                const match = file.filename.match(/^([^_]+)/);
                return match ? match[1] : null;
              }).filter(Boolean)))
                .filter(filename => 
                  isAdmin || 
                  privileges.individualReports || 
                  (privileges.allowedReports && privileges.allowedReports.some(allowed => allowed.startsWith(filename)))
                )
                .map((filename) => {
                  // Convert filename (e.g., "John-Doe") to display name (e.g., "John Doe")
                  const displayName = filename.replace('-', ' ');
                  return (
                    <option key={filename} value={filename}>
                      {displayName}
                    </option>
                  );
                })
              }
            </select>

            <select
              className={`${baseSelectStyles} ${analysisWidth} ${!selectedPerson ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={selectedPersonAnalysis}
              aria-label="Select kind of analysis"
              onChange={(e) => {
                setSelectedPersonAnalysis(e.target.value);
              }}
              disabled={!selectedPerson}
              style={dropdownArrowStyle}
            >
              <option value="">Kind of analysis</option>
              {analysisOptions.map((option) => {
                const isAvailable = availableAnalysisTypes.includes(option.code);
                return (
                  <option 
                    key={option.code} 
                    value={option.code}
                    disabled={!isAvailable}
                    className={!isAvailable ? 'opacity-50' : ''}
                  >
                    {option.label}
                  </option>
                );
              })}
            </select>

            <select
              className={`${baseSelectStyles} ${standardWidth} ${!selectedPerson || !selectedPersonAnalysis ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={selectedPersonWeek}
              aria-label="Select week number"
              onChange={(e) => setSelectedPersonWeek(e.target.value)}
              disabled={!selectedPerson || !selectedPersonAnalysis}
              style={dropdownArrowStyle}
            >
              <option value="">Week</option>
              {availablePersonWeeks.map((week) => {
                const personFile = jsonFiles.find(file => 
                  file.filename.startsWith(selectedPerson) && 
                  file.filename.includes(selectedPersonAnalysis) && 
                  file.weekNumber === week
                );
                return (
                  <option key={week} value={week}>
                    Week {week}: {personFile?.dateRange?.replace('_', ' - ')}
                  </option>
                );
              })}
            </select>

            <button
              className={`button ${!isReportAvailable() ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleViewReport}
              disabled={!isReportAvailable()}
            >
              View report
            </button>
          </div>
        </div>

        <h1 className="title font-bold mt-16">Team Report Page</h1>
        <div className="mt-4">
          <div className="flex items-center gap-4">
            <select
              className={`${baseSelectStyles} ${standardWidth} ${!isAdmin && !privileges.teamMonash && !privileges.teamSOL ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isAdmin && !privileges.teamMonash && !privileges.teamSOL}
              value={selectedTeam}
              aria-label="Select team"
              onChange={(e) => setSelectedTeam(e.target.value)}
              style={dropdownArrowStyle}
            >
              <option value="">Team</option>
              {(isAdmin || privileges.teamMonash) && <option value="monash">Monash</option>}
              {(isAdmin || privileges.teamSOL) && <option value="sol">SOL</option>}
            </select>

            <select
              className={`${baseSelectStyles} ${analysisWidth} ${!isAdmin && !privileges.teamBehavioural && !privileges.teamCollaborative ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isAdmin && !privileges.teamBehavioural && !privileges.teamCollaborative}
              value={selectedAnalysis}
              aria-label="Select analysis type"
              onChange={(e) => setSelectedAnalysis(e.target.value)}
              style={dropdownArrowStyle}
            >
              <option value="">Kind of analysis</option>
              {teamAnalysisOptions.map(option => (
                ((option.value.startsWith('behavioural') && (isAdmin || privileges.teamBehavioural)) ||
                 (option.value === 'compliance' && (isAdmin || privileges.teamCollaborative))) && (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )
              ))}
            </select>

            <select
              className={`${baseSelectStyles} ${standardWidth} ${!selectedTeam || !selectedAnalysis ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={selectedWeek}
              aria-label="Select week number"
              onChange={(e) => setSelectedWeek(e.target.value)}
              disabled={!selectedTeam || !selectedAnalysis}
              style={dropdownArrowStyle}
            >
              <option value="">Week</option>
              {availableWeeks.map((week) => {
                const prefix = selectedTeam === 'monash' ? 'MONU' : 'SOL';
                const selectedOption = teamAnalysisOptions.find(option => option.value === selectedAnalysis);
                
                const teamFile = teamReportFiles.find(file => {
                  const filename = file.filename;
                  if (selectedAnalysis === 'compliance') {
                    return filename.includes(prefix) && 
                           filename.includes('Compliance') && 
                           filename.includes(`W${week}`);
                  } else {
                    return filename.includes(prefix) && 
                           filename.includes('Behavioural') && 
                           filename.includes(selectedOption?.code || '') && 
                           filename.includes(`W${week}`);
                  }
                });
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
