import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filename = url.searchParams.get('file');

    if (!filename) {
      console.error('No filename provided');
      return new NextResponse('File name is required', { status: 400 });
    }

    console.log('Requested filename:', filename);
    const csvDir = path.join(process.cwd(), 'csv_reports');
    const filePath = path.join(csvDir, filename);
    console.log('Full file path:', filePath);

    try {
      await fs.access(filePath);
      console.log('File exists, attempting to read');
      const content = await fs.readFile(filePath, 'utf-8');
      console.log('File read successfully, length:', content.length);
      
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      console.error('Error accessing or reading file:', error);
      console.error('Attempted path:', filePath);
      return new NextResponse('File not found', { status: 404 });
    }
  } catch (error) {
    console.error('Internal server error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
