'use server'

const fs = require('fs');
const path = require('path');

interface JsonFile {
  filename: string;
  displayName: string;
}

export async function getJsonFiles(): Promise<{ files: JsonFile[] }> {
  const jsonDirectory = path.join(process.cwd(), 'json_reports');
  
  try {
    const files = fs.readdirSync(jsonDirectory)
      .filter((file: string) => file.endsWith('.json'))
      .map((filename: string) => ({
        filename,
        displayName: filename.replace('.json', '')
      }));
    
    return { files };
  } catch (error) {
    console.error('Error reading JSON files:', error);
    return { files: [] };
  }
}
