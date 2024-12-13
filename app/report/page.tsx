import { getReportData } from "../actions/getReportData";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: { file: string };
}) {
  const reportData = await getReportData(searchParams.file);

  if (!reportData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-8 font-light">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light whitespace-nowrap">
            <span className="text-[#FF6B8A]">{reportData.metadata.consultantName}</span>
            <span className="text-white"> | Collaborative planning - condensed</span>
          </h1>
          <p className="text-xl italic text-gray-400 mt-4">
            Week {reportData.metadata.weekNumber}: {reportData.metadata.dateRange}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-600 my-8"></div>

        {/* Stats Title */}
        <h2 className="text-4xl font-light mb-12">Your week in numbers [route 1]:</h2>

        {/* Stats Table */}
        <div className="bg-[#252525] rounded-lg p-10">
          <table className="w-full border-separate border-spacing-x-6">
            <thead>
              <tr>
                <th className="text-left pb-8 w-12"></th>
                <th className="text-center pb-8 w-1/3">
                  <div className="bg-[#303030] rounded px-4 py-1 text-xl font-light">Total calls</div>
                </th>
                <th className="text-center pb-8 w-1/3">
                  <div className="bg-[#303030] rounded px-4 py-1 text-xl font-light">% over 2 mins</div>
                </th>
                <th className="text-center pb-8 w-1/3">
                  <div className="bg-[#303030] rounded px-4 py-1 text-xl font-light">talking:listening</div>
                </th>
              </tr>
            </thead>
            <tbody className="text-2xl tracking-wide">
              <tr>
                <td className="relative w-12">
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-white/70 text-lg -rotate-180" style={{ writingMode: 'vertical-lr', height: 'auto' }}>Individual</div>
                </td>
                <td className="text-center py-6 font-extralight">
                  {Math.round(reportData.total_number_of_calls)}
                </td>
                <td className="text-center py-6 font-extralight">
                  {Math.round(reportData.percent_of_calls_over_2_minutes.percentage)}%
                </td>
                <td className="text-center py-6 font-extralight">
                  {Math.round(reportData.average_talking_percentage.individual_average)}:{Math.round(100 - reportData.average_talking_percentage.individual_average)}
                </td>
              </tr>
              <tr>
                <td className="relative w-12">
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-white/70 text-lg -rotate-180" style={{ writingMode: 'vertical-lr', height: 'auto' }}>Team</div>
                </td>
                <td className="text-center py-6 font-extralight">
                  {Math.round(reportData.team_average_total_number_of_calls_per_sales_consultant)}
                </td>
                <td className="text-center py-6 font-extralight">
                  {Math.round(reportData.percent_of_calls_over_2_minutes.team_average_percentage)}%
                </td>
                <td className="text-center py-6 font-extralight">
                  {Math.round(reportData.average_talking_percentage.team_average)}:{Math.round(100 - reportData.average_talking_percentage.team_average)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Conversation Analysis */}
        <div className="mt-12">
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
