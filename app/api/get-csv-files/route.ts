import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const csvDir = path.join(process.cwd(), '..', 'csv_reports');
    
    // Check if directory exists, if not return empty array
    try {
      await fs.access(csvDir);
    } catch {
      return NextResponse.json({ files: [] });
    }

    // Read all CSV files
    const files = await fs.readdir(csvDir);
    const csvFiles = files
      .filter(file => file.endsWith('.csv'))
      .map(file => {
        // Remove .csv extension and 'report' from filename
        const name = file.replace('.csv', '').replace(' report', '');
        return {
          filename: file,
          displayName: name
        };
      });

    return NextResponse.json({ files: csvFiles });
  } catch (error) {
    console.error('Error reading CSV files:', error);
    return NextResponse.json(
      { error: 'Failed to read CSV files' },
      { status: 500 }
    );
  }
}
