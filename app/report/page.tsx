import { getReportData } from "../actions/getReportData";
import CreatePdfButton from "../components/CreatePdfButton";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: { file: string };
}) {
  const reportData = await getReportData(searchParams.file);

  if (!reportData) return <div>Loading...</div>;

  const themesData = {
    positive_themes:
      reportData["Collaborative planning with high-need students:"]
        ?.positive_themes || [],
    improvement_themes:
      reportData["Collaborative planning with high-need students:"]
        ?.improvement_themes || [],
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-8 font-light">
      <div className="max-w-5xl mx-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-[#1E1E1E] pt-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl whitespace-nowrap">
              <span className="text-[#FF6B8A] font-bold">
                {reportData.metadata.consultantName} |
              </span>
              <span className="text-white text-4xl">
                {" "}
                Collaborative planning
              </span>
            </h1>
            <p className="text-xl italic text-gray-400 mt-4">
              Week {reportData.metadata.weekNumber}:{" "}
              {reportData.metadata.dateRange}
            </p>

            {/* Create PDF Button */}
            <div className="flex justify-center mt-0">
              <CreatePdfButton />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-600 my-8"></div>
        </div>

        {/* Stats Table */}
        <div className="bg-[#252525] rounded-lg px-10 pb-10">
          {/* Stats Title */}
          <h2 className="text-2xl font-semibold pt-8 mb-8">
            Your week in numbers:
          </h2>

          <table className="w-full border-separate border-spacing-x-6">
            <thead>
              <tr>
                <th className="text-left pb-8 w-12"></th>
                <th className="text-center pb-8 w-1/3">
                  <div className="bg-[#303030] rounded px-4 py-6 text-xl font-normal">
                    Total calls
                  </div>
                </th>
                <th className="text-center pb-8 w-1/3">
                  <div className="bg-[#303030] rounded px-4 py-6 text-xl font-normal">
                    % over 2 mins
                  </div>
                </th>
                <th className="text-center pb-8 w-1/3">
                  <div className="bg-[#303030] rounded px-4 py-6 text-xl font-normal">
                    talking:listening
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-3xl tracking-wide">
              <tr>
                <td className="relative w-12">
                  <div
                    className="absolute -left-2 top-1/2 -translate-y-1/2 text-white/80 text-lg -rotate-180 font-semibold"
                    style={{ writingMode: "vertical-lr", height: "auto" }}
                  >
                    Individual
                  </div>
                </td>
                <td className="text-center py-6 font-normal">
                  {Math.round(reportData.total_number_of_calls)}
                </td>
                <td className="text-center py-6 font-normal">
                  {Math.round(
                    reportData.percent_of_calls_over_2_minutes.percentage
                  )}
                  %
                </td>
                <td className="text-center py-6 font-normal">
                  {Math.round(
                    reportData.average_talking_percentage.individual_average
                  )}{" "}
                  :{" "}
                  {Math.round(
                    100 -
                      reportData.average_talking_percentage.individual_average
                  )}
                </td>
              </tr>
              <tr>
                <td className="relative w-12">
                  <div
                    className="absolute -left-2 top-1/2 -translate-y-1/2 text-white/80 text-lg -rotate-180 font-semibold"
                    style={{ writingMode: "vertical-lr", height: "auto" }}
                  >
                    Team
                  </div>
                </td>
                <td className="text-center py-6 font-normal">
                  {Math.round(
                    reportData.team_average_total_number_of_calls_per_sales_consultant
                  )}
                </td>
                <td className="text-center py-6 font-normal">
                  {Math.round(
                    reportData.percent_of_calls_over_2_minutes
                      .team_average_percentage
                  )}
                  %
                </td>
                <td className="text-center py-6 font-normal">
                  {Math.round(
                    reportData.average_talking_percentage.team_average
                  )}{" "}
                  :{" "}
                  {Math.round(
                    100 - reportData.average_talking_percentage.team_average
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bar Graph */}
        <div className="mt-8 bg-[#252525] rounded-lg p-10">
          {/* Graph Title */}
          <h2 className="text-2xl mb-6 font-semibold">
            Collaborative planning with high-need students:
          </h2>

          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[#FF6B8A]"></div>
              <span className="text-sm text-gray-300 font-normal">
                Team average
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[#4CAF50]"></div>
              <span className="text-sm text-gray-300 font-normal">
                Sales consultant average
              </span>
            </div>
          </div>

          <div className="relative h-[400px] mt-16 mb-16">
            {/* Y-axis labels */}
            <div className="absolute -left-2 -top-11 h-[110%] flex flex-col justify-between text-xs text-gray-400 font-normal">
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
                    height: `${
                      (reportData.average_finalRanking_score_eligible_transcripts /
                        380) *
                      100
                    }%`,
                  }}
                ></div>
                {/* Red line for team average */}
                <div
                  className="absolute w-full h-[4px] bg-[#FF6B8A]"
                  style={{
                    bottom: `${
                      (reportData.team_average_finalRanking_score_eligible_transcripts /
                        380) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              {/* X-axis label */}
              <div className="absolute bottom-[-40px] text-xs text-gray-400 whitespace-nowrap font-normal">
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
                  <span className="absolute w-full text-center text-xs text-gray-400 mt-2 font-normal">
                    Week past
                  </span>
                </div>

                {/* Future weeks section */}
                <div
                  className="relative ml-4 flex-1"
                  style={{ marginLeft: "70px" }}
                >
                  <div className="flex items-center">
                    <div className="flex-1 h-[1px] bg-white"></div>
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span className="absolute left-1/2 -translate-x-1/2 text-xs text-gray-400 mt-2 font-normal">
                    Future weeks
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Qualitative Analysis Headlines */}
        <div className="mt-16">
          <h2 className="text-2xl mb-6 font-semibold">
            Qualitative analysis headlines:
          </h2>

          <div className="grid grid-cols-2 gap-8">
            {/* Highlights */}
            <div className="bg-[#252525] rounded-lg p-8">
              <h3 className="text-3xl font-normal mb-6 text-[#4CAF50]">
                Highlights:
              </h3>
              <ul className="space-y-4">
                {themesData.positive_themes.map(
                  (theme: string, index: number) => (
                    <li key={index} className="text-xl font-normal">
                      {theme}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-[#252525] rounded-lg p-8">
              <h3 className="text-3xl font-normal mb-6 text-[#FF6B8A]">
                Opportunities:
              </h3>
              <ul className="space-y-4">
                {themesData.improvement_themes.map(
                  (theme: string, index: number) => (
                    <li key={index} className="text-xl font-normal">
                      {theme}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Conversation Analysis */}
        <div className="mt-12">
          <h2 className="text-2xl mb-6 font-semibold">Conversation Analysis</h2>
          <div className="space-y-4">
            {reportData.conversationAnalysis.condensed.conversations.map(
              (conv) => (
                <div key={conv.id} className="bg-[#2A2A2A] p-6 rounded">
                  <h3 className="text-lg font-medium mb-2">
                    {conv.id}. {conv.type}
                  </h3>
                  <div className="space-y-2 text-sm font-normal">
                    <p>
                      <span className="text-gray-400 font-semibold">
                        Student Trigger:
                      </span>
                      <br /> {conv.studentTrigger}
                    </p>
                    <p>
                      <span className="text-gray-400 font-semibold">
                        Context & Impact:
                      </span>
                      <br /> {conv.contextAndImpact}
                    </p>
                    <p>
                      <span className="text-gray-400 font-semibold">
                        Consultant Response:
                      </span>
                      <br /> {conv.consultantResponse}
                    </p>
                    <p>
                      <span className="text-gray-400 font-semibold">
                        Recommended Improvement:
                      </span>
                      <br /> {conv.recommendedImprovement}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Verbose Conversation Analysis */}
        <div className="mt-16 space-y-12">
          {reportData.conversationAnalysis.verbose.conversations.map((conv) => (
            <div key={conv.id} className="space-y-6">
              <h2 className="text-xl mb-6 font-semibold italic">
                {conv.id}. {conv.type}
              </h2>

              {/* Student Trigger */}
              <div className="space-y-2">
                <h3 className="text-xl text-gray-300 font-normal italic">
                  Student trigger:
                </h3>
                <div className="border border-[#4CAF50] rounded-lg p-6">
                  <p className="text-lg font-normal">{conv.studentTrigger}</p>
                </div>
              </div>

              {/* Consultant Response */}
              <div className="space-y-2">
                <h3 className="text-xl text-gray-300 font-normal italic">
                  Consultant response:
                </h3>
                <div className="border border-[#4CAF50] rounded-lg p-6">
                  <p className="text-lg font-normal">
                    {conv.consultantResponse}
                  </p>
                </div>
              </div>

              {/* Recommended Approach */}
              <div className="space-y-2">
                <h3 className="text-xl text-gray-300 font-normal italic">
                  Recommended approach:
                </h3>
                <div className="border border-[#FF6B8A] rounded-lg p-6">
                  <p className="text-lg font-normal">
                    {conv.recommendedApproach}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
