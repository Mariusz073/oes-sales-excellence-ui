'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getReportData, type ReportData } from '../actions/getReportData';

export default function ReportPage() {
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const file = searchParams.get('file');
      if (!file) return;

      try {
        const data = await getReportData(file);
        setReportData(data);
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    };

    fetchReport();
  }, [searchParams]);

  if (!reportData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl">
            <span className="text-white">{reportData.metadata.consultantName}</span>
            <span className="text-red-500"> | {reportData.metadata.reportType}</span>
          </h1>
          <p className="text-lg mt-2">
            Week {reportData.metadata.weekNumber}: {reportData.metadata.dateRange}
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
              <div className="text-3xl font-light">
                {Math.round(reportData.team_average_total_number_of_calls_per_sales_consultant)}
              </div>
            </div>
          </div>

          {/* % over 2 mins */}
          <div className="bg-[#2A2A2A] p-6 rounded">
            <h3 className="text-lg mb-4">% over 2 mins</h3>
            <div className="grid grid-rows-2 gap-4">
              <div className="text-3xl font-light">
                {Math.round(reportData.percent_of_calls_over_2_minutes.percentage)}%
              </div>
              <div className="text-3xl font-light">
                {Math.round(reportData.percent_of_calls_over_2_minutes.team_average_percentage)}%
              </div>
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

        {/* Conversation Analysis */}
        <div className="mt-8">
          <h2 className="text-2xl mb-6">Conversation Analysis</h2>
          <div className="space-y-4">
            {reportData.conversationAnalysis.condensed.conversations.map((conv) => (
              <div key={conv.id} className="bg-[#2A2A2A] p-6 rounded">
                <h3 className="text-lg font-medium mb-2">{conv.type}</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-400">Student Trigger:</span> {conv.studentTrigger}</p>
                  <p><span className="text-gray-400">Context & Impact:</span> {conv.contextAndImpact}</p>
                  <p><span className="text-gray-400">Consultant Response:</span> {conv.consultantResponse}</p>
                  <p><span className="text-gray-400">Recommended Improvement:</span> {conv.recommendedImprovement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
