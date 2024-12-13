'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface ReportData {
  consultantName: string;
  reportType: string;
  weekNumber: string;
  dateRange: string;
  total_number_of_calls: number;
  team_average_total_number_of_calls_per_sales_consultant: number;
  percent_of_calls_over_2_minutes: {
    percentage: number;
    team_average_percentage: number;
  };
  average_talking_percentage: {
    individual_average: number;
    team_average: number;
  };
}

export default function ReportPage() {
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const file = searchParams.get('file');
      if (!file) return;

      try {
        const response = await fetch(`/api/view-report?file=${encodeURIComponent(file)}`);
        if (!response.ok) throw new Error('Failed to fetch report');
        
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        setReportData(parsedData);
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    };

    fetchReport();
  }, [searchParams]);

  const parseCSV = (csvText: string): ReportData => {
    const lines = csvText.split('\n').map(line => line.trim());
    const data: ReportData = {
      consultantName: '',
      reportType: '',
      weekNumber: '',
      dateRange: '',
      total_number_of_calls: 0,
      team_average_total_number_of_calls_per_sales_consultant: 0,
      percent_of_calls_over_2_minutes: {
        percentage: 0,
        team_average_percentage: 0
      },
      average_talking_percentage: {
        individual_average: 0,
        team_average: 0
      }
    };

    let currentSection = '';

    lines.forEach(line => {
      const [key, value] = line.split(';').map(item => item.trim());
      
      // Handle metadata
      if (key === 'consultantName') data.consultantName = value;
      if (key === 'reportType') data.reportType = value;
      if (key === 'weekNumber') data.weekNumber = value;
      if (key === 'dateRange') data.dateRange = value;

      // Handle statistics
      if (key === 'total_number_of_calls') {
        data.total_number_of_calls = Number(value);
      }
      if (key === 'team_average_total_number_of_calls_per_sales_consultant') {
        data.team_average_total_number_of_calls_per_sales_consultant = Number(value);
      }

      // Handle nested data
      if (key === 'percent_of_calls_over_2_minutes') {
        currentSection = 'percent_over_2';
      } else if (key === 'average_talking_percentage') {
        currentSection = 'talking_percentage';
      } else if (currentSection === 'percent_over_2') {
        if (key === 'percentage') {
          data.percent_of_calls_over_2_minutes.percentage = Number(value);
        } else if (key === 'team_average_percentage') {
          data.percent_of_calls_over_2_minutes.team_average_percentage = Number(value);
        }
      } else if (currentSection === 'talking_percentage') {
        if (key === 'individual_average') {
          data.average_talking_percentage.individual_average = Number(value);
        } else if (key === 'team_average') {
          data.average_talking_percentage.team_average = Number(value);
        }
      }
    });

    return data;
  };

  if (!reportData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl">
            <span className="text-white">{reportData.consultantName}</span>
            <span className="text-red-500"> | {reportData.reportType}</span>
          </h1>
          <p className="text-lg mt-2">
            Week {reportData.weekNumber}: {reportData.dateRange}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-600 my-6"></div>

        {/* Stats Title */}
        <h2 className="text-2xl mb-6">Your week in numbers [route 1]:</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Total Calls */}
          <div className="bg-[#2A2A2A] p-6 rounded">
            <h3 className="text-lg mb-4">Total calls</h3>
            <div className="grid grid-rows-2 gap-4">
              <div className="text-3xl font-light">{Math.round(reportData.total_number_of_calls)}</div>
              <div className="text-3xl font-light">{Math.round(reportData.team_average_total_number_of_calls_per_sales_consultant)}</div>
            </div>
          </div>

          {/* % over 2 mins */}
          <div className="bg-[#2A2A2A] p-6 rounded">
            <h3 className="text-lg mb-4">% over 2 mins</h3>
            <div className="grid grid-rows-2 gap-4">
              <div className="text-3xl font-light">{Math.round(reportData.percent_of_calls_over_2_minutes.percentage)}%</div>
              <div className="text-3xl font-light">{Math.round(reportData.percent_of_calls_over_2_minutes.team_average_percentage)}</div>
            </div>
          </div>

          {/* talking:listening */}
          <div className="bg-[#2A2A2A] p-6 rounded">
            <h3 className="text-lg mb-4">talking:listening</h3>
            <div className="grid grid-rows-2 gap-4">
              <div className="text-3xl font-light">
                {Math.round(reportData.average_talking_percentage.individual_average)}:
                {Math.round(100 - reportData.average_talking_percentage.individual_average)}
              </div>
              <div className="text-3xl font-light">
                {Math.round(reportData.average_talking_percentage.team_average)}:
                {Math.round(100 - reportData.average_talking_percentage.team_average)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
