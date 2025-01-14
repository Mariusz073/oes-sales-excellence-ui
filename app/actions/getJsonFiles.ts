'use server'

const fs = require('fs');
const path = require('path');

interface JsonFile {
  filename: string;
  displayName: string;
  weekNumber: number;
  dateRange?: string;
}

export async function getJsonFiles(): Promise<{ files: JsonFile[] }> {
  const jsonDirectory = path.join(process.cwd(), 'app/data/json_reports');
  
  try {
    const files = fs.readdirSync(jsonDirectory)
      .filter((file: string) => file.endsWith('.json'))
      .map((filename: string) => {
        // Extract week number from filename (e.g., name-surname_W11.json)
        const weekMatch = filename.match(/_W(\d+)\.json$/);
        const weekNumber = weekMatch ? parseInt(weekMatch[1]) : 0;

        // Extract name from filename
        const nameOnly = filename
          .replace(/_W\d+\.json$/, '') // Remove week number and extension
          .replace(/-/g, ' '); // Replace hyphens with spaces

        // Split by spaces and take first two parts (name and surname)
        const nameParts = nameOnly.split(' ');
        const displayName = nameParts.slice(0, 2).join(' ');
        
        // Read and parse the JSON file to get the date range
        const filePath = path.join(jsonDirectory, filename);
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const jsonData = JSON.parse(fileContent);
          const dateRange = jsonData.metadata?.date_range;

          return {
            filename,
            displayName,
            weekNumber,
            dateRange
          };
        } catch (error) {
          console.error(`Error reading file ${filename}:`, error);
          return {
            filename,
            displayName,
            weekNumber
          };
        }
      });
    
    return { files };
  } catch (error) {
    console.error('Error reading JSON files:', error);
    return { files: [] };
  }
}
