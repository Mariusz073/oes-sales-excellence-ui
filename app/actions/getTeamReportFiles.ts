'use server'

import fs from 'fs';
import path from 'path';

interface TeamReportFile {
  filename: string;
  displayName: string;
  weekNumber: number;
  reportingPeriod?: string;
}

export async function getTeamReportFiles(): Promise<{ files: TeamReportFile[] }> {
  const jsonDirectory = path.join(process.cwd(), 'app/data/team_reports');
  
  try {
    const files = fs.readdirSync(jsonDirectory)
      .filter((file: string) => file.endsWith('.json'))
      .map((filename: string) => {
        // Extract week number from filename (e.g., MONU_Behavioural_W11.json)
        const weekMatch = filename.match(/W(\d+)\.json$/);
        const weekNumber = weekMatch ? parseInt(weekMatch[1]) : 0;

        // Read and parse the JSON file to get the reporting period
        const filePath = path.join(jsonDirectory, filename);
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const jsonData = JSON.parse(fileContent);
          const reportingPeriod = jsonData.reporting_period;

          return {
            filename,
            displayName: filename,
            weekNumber,
            reportingPeriod
          };
        } catch (error) {
          console.error(`Error reading file ${filename}:`, error);
          return {
            filename,
            displayName: filename,
            weekNumber
          };
        }
      });
    
    return { files };
  } catch (error) {
    console.error('Error reading team report files:', error);
    return { files: [] };
  }
}
