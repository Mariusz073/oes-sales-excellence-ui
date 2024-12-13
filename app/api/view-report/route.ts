import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filename = url.searchParams.get('file');

    if (!filename) {
      return new NextResponse('File name is required', { status: 400 });
    }

    const csvDir = path.join(process.cwd(), '..', 'csv_reports');
    const filePath = path.join(csvDir, filename);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      return new NextResponse('File not found', { status: 404 });
    }
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
