'use server'

const fs = require('fs');
const path = require('path');

interface JsonFile {
  filename: string;
  displayName: string;
}

export async function getJsonFiles(): Promise<{ files: JsonFile[] }> {
  const jsonDirectory = path.join(process.cwd(), 'app/data/json_reports');
  
  try {
    const files = fs.readdirSync(jsonDirectory)
      .filter((file: string) => file.endsWith('.json'))
      .map((filename: string) => {
        // Extract name from filename by removing various suffixes and replacing hyphens
        const nameOnly = filename
          .replace(' report.json', '')
          .replace('_report_test.json', '')
          .replace('.json', '')
          .replace(/-/g, ' ');
        
        // Split by spaces and take first two parts (name and surname)
        const nameParts = nameOnly.split(' ');
        const displayName = nameParts.slice(0, 2).join(' ');
        
        return {
          filename,
          displayName
        };
      });
    
    return { files };
  } catch (error) {
    console.error('Error reading JSON files:', error);
    return { files: [] };
  }
}
