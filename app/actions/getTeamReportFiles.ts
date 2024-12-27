'use server'

import fs from 'fs';
import path from 'path';

interface TeamReportFile {
  filename: string;
  displayName: string;
}

export async function getTeamReportFiles(): Promise<{ files: TeamReportFile[] }> {
  const jsonDirectory = path.join(process.cwd(), 'app/data/team_reports');
  
  try {
    const files = fs.readdirSync(jsonDirectory)
      .filter((file: string) => file.endsWith('.json'))
      .map((filename: string) => ({
        filename,
        displayName: filename
      }));
    
    return { files };
  } catch (error) {
    console.error('Error reading team report files:', error);
    return { files: [] };
  }
}
