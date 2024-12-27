import fs from 'fs/promises';
import path from 'path';

export async function getTeamReportData(team: string, analysisType: string, week: string) {
  try {
    const teamPrefix = team === 'monash' ? 'MONU' : 'SOLU';
    const analysisKeyword = analysisType === 'compliance' ? 'compliance' : 'behavioral';
    
    const teamReportsDir = path.join(process.cwd(), 'team_reports');
    console.log('Looking in directory:', teamReportsDir);
    
    // Check if directory exists
    try {
      await fs.access(teamReportsDir);
    } catch (error) {
      console.error('Directory does not exist:', teamReportsDir);
      return null;
    }
    
    const files = await fs.readdir(teamReportsDir);
    console.log('Available files:', files);
    console.log('Looking for file with:', { teamPrefix, analysisKeyword });
    
    // Find file that matches team prefix, analysis type, and week number
    const matchingFile = files.find(file => {
      const matchesTeam = file.toLowerCase().includes(teamPrefix.toLowerCase());
      const matchesAnalysis = file.toLowerCase().includes(analysisKeyword.toLowerCase());
      const matchesWeek = file.includes(`W${week}`);
      console.log('Checking file:', file, { matchesTeam, matchesAnalysis, matchesWeek });
      return matchesTeam && matchesAnalysis && matchesWeek && file.endsWith('.json');
    });

    console.log('Matching file found:', matchingFile);

    if (!matchingFile) {
      return null;
    }

    const filePath = path.join(teamReportsDir, matchingFile);
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading team report data:', error);
    return null;
  }
}
