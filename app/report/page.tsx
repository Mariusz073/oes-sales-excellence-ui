import { getReportData } from "../actions/getReportData";
import CreatePdfButton from "../components/CreatePdfButton";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: { file: string };
}) {
  const reportData = await getReportData(searchParams.file);

  if (!reportData) return <div>Loading...</div>;

  const currentBehavioralScore = reportData.behavioral_scores[reportData.behavioral_scores.length - 1];

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-8 font-light">
      <div className="max-w-5xl mx-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-[#1E1E1E] pt-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl whitespace-nowrap">
              <span className="text-[#FF6B8A] font-semibold">
                {reportData.metadata.consultant_name} |
              </span>
              <span className="text-white text-4xl">
                {" "}
                {reportData.metadata.report_type}
              </span>
            </h1>
            <p className="text-xl italic text-[#a6a6a6] mt-4">
              Week {reportData.metadata.week_number}:{" "}
              {reportData.metadata.date_range}
            </p>

            {/* Create PDF Button */}
            <div className="flex justify-center mt-0">
              <CreatePdfButton />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#a6a6a6] my-8"></div>
        </div>

        {/* Stats Table */}
        <div className="bg-[#252525] rounded-lg px-10 pb-10">
          {/* Stats Title */}
          <h2 className="text-2xl font-medium pt-8 mb-8">
            Your week in numbers:
          </h2>

          <table className="w-full border-separate border-spacing-x-6">
            <thead>
              <tr>
                <th className="text-left pb-8 w-12">
                  <span className="sr-only">Category</span>
                </th>
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
          <h2 className="text-2xl mb-6 font-medium">
            Collaborative planning with high-need students:
          </h2>

          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[#FF6B8A]"></div>
              <span className="text-xs text-[#a6a6a6] font-normal">
                Team average
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[#78c38e]"></div>
              {/* <div className="w-6 h-[2px] bg-[#78c38e]"></div> */}
              <span className="text-xs text-[#a6a6a6] font-normal">
                Sales consultant average
              </span>
            </div>
          </div>

          <div className="relative h-[400px] mt-16 mb-16">
            {/* Y-axis labels */}
            <div className="absolute -left-2 -top-11 h-[110%] flex flex-col justify-between text-xs text-[#a6a6a6] font-normal">
              <span>Score</span>
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

            {/* Bars Container */}
            <div className="relative h-[98%] ml-8">
              {Array.from({ length: 12 }).map((_, index) => {
                const score = reportData.behavioral_scores[index];
                const barWidth = 64; // 16px * 4
                const gapWidth = 16;
                const totalWidth = barWidth + gapWidth;
                
                return (
                  <div
                    key={index}
                    className="absolute bottom-0 h-full"
                    style={{ left: `${index * totalWidth}px` }}
                  >
                    <div className="absolute bottom-0 w-16 bg-[#1E1E1E] h-full">
                      {score && (
                        <>
                          <div
                            className="absolute bottom-0 w-full bg-[#78c38e]"
                            style={{
                              height: `${
                                (score.average_final_ranking_score_eligible_transcripts /
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
                                (score.team_average_final_ranking_score_eligible_transcripts /
                                  380) *
                                100
                              }%`,
                            }}
                          ></div>
                        </>
                      )}
                    </div>
                    {/* X-axis label */}
                    {score && (
                      <div 
                        className="absolute text-xs text-[#a6a6a6] whitespace-nowrap font-normal text-center"
                        style={{
                          bottom: index % 2 === 0 ? '-40px' : '-60px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: barWidth
                        }}
                      >
                        {score.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Qualitative Analysis Headlines */}
        <div className="mt-16">
          <h2 className="text-2xl mb-6 font-medium">
            Qualitative analysis headlines:
          </h2>

          <div className="space-y-8">
            {/* Highlights */}
            <div className="bg-[#252525] rounded-lg p-8">
              <h3 className="text-3xl font-semibold mb-6 text-[#78c38e]">
                Highlights:
              </h3>
              <ul className="space-y-4">
                {reportData.themes.positive.map(
                  (theme: { headline: string; explanation: string }, index: number) => (
                    <li key={index} className="mb-4">
                      <div className="text-xl font-medium">{theme.headline}</div>
                      <div className="text-lg font-medium mt-1 italic">{theme.explanation}</div>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-[#252525] rounded-lg p-8">
              <h3 className="text-3xl font-semibold mb-6 text-[#FF6B8A]">
                Opportunities:
              </h3>
              <ul className="space-y-4">
                {reportData.themes.improvement.map(
                  (theme: { headline: string; explanation: string }, index: number) => (
                    <li key={index} className="mb-4">
                      <div className="text-xl font-medium">{theme.headline}</div>
                      <div className="text-lg font-medium mt-1 italic">{theme.explanation}</div>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Conversation Analysis */}
        <div className="mt-12">
          <h2 className="text-2xl mb-6 font-medium">Conversation Analysis</h2>
          <div className="space-y-4">
            {reportData.conversation_analysis.condensed.conversations.map(
              (conv) => (
                <div key={conv.id} className="bg-[#2A2A2A] p-6 rounded">
                  <h3 className="text-xl font-medium mb-2">
                    {conv.id}. {conv.title}
                  </h3>
                  <div className="space-y-2 text-base font-base">
                    <p>
                      <span className="font-semibold">
                        Student Trigger:
                      </span>
                      <br /> {conv.student_trigger}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Context & Impact:
                      </span>
                      <br /> {conv.context_impact}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Consultant Response:
                      </span>
                      <br /> {conv.consultant_response}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Recommended Approach:
                      </span>
                      <br /> {conv.recommended_approach}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Verbose Conversation Analysis */}
        <div className="mt-16 space-y-12">
          {reportData.conversation_analysis.verbose.conversations.map((conv) => (
            <div key={conv.id} className="space-y-6">
              <h2 className="text-2xl mb-6 font-medium">
                {conv.id}. {conv.title}
              </h2>

              {/* Student Trigger */}
              <div className="space-y-2">
                <h3 className="text-xl font-normal italic">
                  Student trigger:
                </h3>
                <div className="border border-[#78c38e] rounded-lg p-6">
                  <p className="text-lg font-medium">{conv.student_trigger}</p>
                </div>
              </div>

              {/* Consultant Response */}
              <div className="space-y-2">
                <h3 className="text-xl font-normal italic">
                  Consultant response:
                </h3>
                <div className="border border-[#78c38e] rounded-lg p-6">
                  <p className="text-lg font-medium">
                    {conv.consultant_response}
                  </p>
                </div>
              </div>

              {/* Recommended Approach */}
              <div className="space-y-2">
                <h3 className="text-xl font-normal italic">
                  Recommended approach:
                </h3>
                <div className="border border-[#FF6B8A] rounded-lg p-6">
                  <p className="text-lg font-medium">
                    {conv.recommended_approach}
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
