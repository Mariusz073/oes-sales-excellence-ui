import fs from 'fs/promises';
import path from 'path';

export async function getTeamReportData(team: string, analysisType: string, week: string) {
  try {
    const teamPrefix = team === 'monash' ? 'MONU' : 'SOLU';
    const analysisKeyword = analysisType === 'compliance' ? 'Compliance' : 'Behavioural';
    
    // For behavioral reports, we need to check both spellings and collaborative keyword
    const analysisMatches = (file: string) => {
      const fileLower = file.toLowerCase();
      if (analysisType === 'compliance') {
        return fileLower.includes('compliance');
      } else {
        return fileLower.includes('behavioural') || 
               fileLower.includes('behavioral') || 
               fileLower.includes('collaborative');
      }
    };
    
    const teamReportsDir = path.join(process.cwd(), 'app/data/team_reports');
    console.log('Looking in directory:', teamReportsDir);
    console.log('Search parameters:', { team, analysisType, week });
    
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
      const fileLower = file.toLowerCase();
      const matchesTeam = fileLower.includes(teamPrefix.toLowerCase());
      const matchesAnalysis = analysisMatches(file);
      const matchesWeek = fileLower.includes(`w${week.toLowerCase()}`);
      
      console.log('Checking file:', file, {
        teamPrefix,
        analysisKeyword,
        week,
        matchesTeam,
        matchesAnalysis,
        matchesWeek,
        fileLower
      });
      
      if (matchesTeam && matchesAnalysis && matchesWeek) {
        console.log('Found matching file:', file);
        return true;
      }
      return false;
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
