import fs from 'fs/promises';
import path from 'path';
import { convertJsonToCsv } from './jsonToCsv';

export async function processJsonFiles() {
  try {
    // Create csv_reports directory if it doesn't exist
    const csvDir = path.join(process.cwd(), '..', 'csv_reports');
    await fs.mkdir(csvDir, { recursive: true });

    // Read all JSON files from json_reports directory
    const jsonDir = path.join(process.cwd(), '..', 'json_reports');
    const files = await fs.readdir(jsonDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    // Process each JSON file
    for (const file of jsonFiles) {
      const jsonPath = path.join(jsonDir, file);
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      const jsonData = JSON.parse(jsonContent);

      // Convert to CSV
      const csvContent = convertJsonToCsv(jsonData);

      // Create CSV file with the same name
      const csvFileName = file.replace('.json', '.csv');
      const csvPath = path.join(csvDir, csvFileName);
      await fs.writeFile(csvPath, csvContent, 'utf-8');
    }

    return {
      success: true,
      message: `Successfully created ${jsonFiles.length} CSV files in csv_reports directory`
    };
  } catch (error) {
    return {
      success: false,
      message: `Error processing files: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
