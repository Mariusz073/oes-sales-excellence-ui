import { getReportData } from "../actions/getReportData";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: { file: string };
}) {
  const reportData = await getReportData(searchParams.file);

  if (!reportData) return <div>Loading...</div>;

  const themesData = {
    positive_themes: reportData["Collaborative planning with high-need students:"]?.positive_themes || [],
    improvement_themes: reportData["Collaborative planning with high-need students:"]?.improvement_themes || []
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-8 font-light">
      <div className="max-w-5xl mx-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-[#1E1E1E] pt-8">
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
        </div>

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

        {/* Bar Graph */}
        <div className="mt-8 bg-[#252525] rounded-lg p-10">
          {/* Graph Title */}
          <h2 className="text-3xl font-light mb-8">Collaborative planning with high-need students:</h2>

          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[#FF6B8A]"></div>
              <span className="text-sm text-gray-300">Team average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[#4CAF50]"></div>
              <span className="text-sm text-gray-300">Sales consultant average</span>
            </div>
          </div>

          <div className="relative h-[400px] mt-16 mb-16">
            {/* Y-axis labels */}
            <div className="absolute -left-2 -top-11 h-[110%] flex flex-col justify-between text-xs text-gray-400">
              <span>% alignment</span>
              <span>100</span>
              <span>90</span>
              <span>80</span>
              <span>70</span>
              <span>60</span>
              <span>50</span>
              <span>40</span>
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>

            {/* Bar */}
            <div className="relative h-[98%] ml-8">
              <div className="absolute bottom-0 w-16 bg-[#1E1E1E] h-full">
                <div 
                  className="absolute bottom-0 w-full bg-[#4CAF50]" 
                  style={{ 
                    height: `${(reportData.average_finalRanking_score_eligible_transcripts / 380) * 100}%` 
                  }}
                ></div>
                {/* Red line for team average */}
                <div 
                  className="absolute w-full h-[4px] bg-[#FF6B8A]" 
                  style={{ 
                    bottom: `${(reportData.team_average_finalRanking_score_eligible_transcripts / 380) * 100}%` 
                  }}
                ></div>
              </div>
              {/* X-axis label */}
              <div className="absolute bottom-[-40px] text-xs text-gray-400 whitespace-nowrap">
                week_{reportData.metadata.weekNumber}
                <br />
                {reportData.metadata.dateRange}
              </div>

              {/* Timeline */}
              <div className="absolute bottom-[-60px] left-0 right-5">
                {/* Week past section */}
                <div className="relative float-left w-[70px]">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    <div className="w-full h-[1px] bg-white"></div>
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span className="absolute w-full text-center text-xs text-gray-400 mt-2">Week past</span>
                </div>
                
                {/* Future weeks section */}
                <div className="relative ml-4 flex-1" style={{ marginLeft: '70px' }}>
                  <div className="flex items-center">
                    <div className="flex-1 h-[1px] bg-white"></div>
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span className="absolute left-1/2 -translate-x-1/2 text-xs text-gray-400 mt-2">Future weeks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Qualitative Analysis Headlines */}
        <div className="mt-16">
          <h2 className="text-4xl font-light mb-8">Qualitative analysis headlines:</h2>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Highlights */}
            <div className="bg-[#252525] rounded-lg p-8">
              <h3 className="text-3xl font-light mb-6 text-[#4CAF50]">Highlights:</h3>
              <ul className="space-y-4">
                {themesData.positive_themes.map((theme: string, index: number) => (
                  <li key={index} className="text-xl font-light">{theme}</li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-[#252525] rounded-lg p-8">
              <h3 className="text-3xl font-light mb-6 text-[#FF6B8A]">Opportunities:</h3>
              <ul className="space-y-4">
                {themesData.improvement_themes.map((theme: string, index: number) => (
                  <li key={index} className="text-xl font-light">{theme}</li>
                ))}
              </ul>
            </div>
          </div>
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

        {/* Verbose Conversation Analysis */}
        <div className="mt-16 space-y-12">
          {reportData.conversationAnalysis.verbose.conversations.map((conv) => (
            <div key={conv.id} className="space-y-6">
              <h2 className="text-3xl font-light">
                {conv.id}. {conv.type}
              </h2>

              {/* Student Trigger */}
              <div className="space-y-2">
                <h3 className="text-xl font-light italic">Student trigger:</h3>
                <div className="border border-[#4CAF50] rounded-lg p-6">
                  <p className="text-lg font-light">{conv.studentTrigger}</p>
                </div>
              </div>

              {/* Consultant Response */}
              <div className="space-y-2">
                <h3 className="text-xl font-light italic">Consultant response:</h3>
                <div className="border border-[#4CAF50] rounded-lg p-6">
                  <p className="text-lg font-light">{conv.consultantResponse}</p>
                </div>
              </div>

              {/* Recommended Approach */}
              <div className="space-y-2">
                <h3 className="text-xl font-light italic">Recommended approach:</h3>
                <div className="border border-[#FF6B8A] rounded-lg p-6">
                  <p className="text-lg font-light">{conv.recommendedApproach}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
