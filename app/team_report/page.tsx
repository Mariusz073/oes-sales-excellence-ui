import { getTeamReportData } from "../actions/getTeamReportData";
import { WeeklyInitiative } from "./sub_page";

interface Graph {
  title: string;
  green: number;
  red?: number;
  upperBound?: number;
  lowerBound?: number;
}

interface SubRequirement {
  title: string;
  current: number;
  lastWeek: number;
}

interface ConsultantResult {
  name: string;
  result: string;
}

interface AverageResult {
  name: string;
  result: string;
}

interface WeeklyInsight {
  title: string;
  content: string;
  borderColor: string;
}

interface TeamReportData {
  type: string;
  requirement: string;
  firstPageTitle: string;
  secondPageTitle: string;
  graph: {
    bars: Graph[];
    greenLabel: string;
    redLabel: string;
    blackLabel: string;
    resultLabel: string;
  };
  subRequirements?: {
    data: SubRequirement[];
    verdictsCount: number;
  };
  individualPerformance: {
    verdictsCount: number;
    consultantResults: ConsultantResult[];
    averageResult: AverageResult;
  };
  weeklyInsights?: {
    verdictsCount: number;
    insights: WeeklyInsight[];
  };
}

export default async function TeamReportPage({
  searchParams,
}: {
  searchParams: { team: string; analysis: string; week: string };
}): Promise<JSX.Element> {
  const reportData = await getTeamReportData(searchParams.team, searchParams.analysis, searchParams.week) as TeamReportData | null;

  if (!reportData) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-white p-8 font-light flex items-center justify-center">
        <div className="text-2xl text-red-500">No report data file found</div>
      </div>
    );
  }

  // Extract titles and highlight the text between <em> tags in red
  const firstTitleParts = reportData.firstPageTitle.split(/<em>|<\/em>/);
  const formattedFirstTitle = firstTitleParts.map((part: string, index: number) => 
    index % 2 === 1 ? <span key={index} className="text-[#FF6B8A]">{part}</span> : part
  );

  // Calculate compliance changes
  const lastIndex = reportData.graph.bars.length - 1;
  const prevIndex = lastIndex - 1;
  const fullComplianceChange = reportData.graph.bars[lastIndex].green - reportData.graph.bars[prevIndex].green;
  const partialComplianceChange = reportData.type === 'Compliance' 
    ? reportData.graph.bars[lastIndex].red! - reportData.graph.bars[prevIndex].red!
    : 0;

  // Sort consultants by compliance percentage
  const sortedConsultants = [...reportData.individualPerformance.consultantResults]
    .map(consultant => ({
      ...consultant,
      percentage: parseInt(consultant.result.match(/\((\d+)%\)$/)?.[1] || '0')
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Create array of 12 positions
  const totalBars = 12;
  const bars = Array.from({ length: totalBars }, (_, index) => {
    if (index < reportData.graph.bars.length) {
      return reportData.graph.bars[index];
    }
    return null;
  });

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-8 font-light">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="title font-bold">
          Team Report Page <span className="text-white">- {searchParams.team === 'monash' ? 'Monash' : 'SOL'} - {searchParams.analysis === 'compliance' ? 'Compliance' : 'Collaborative'} - Week {searchParams.week}</span>
        </h1>

        {/* First Bar Graph Section */}
        <div className="mt-8 bg-[#252525] rounded-lg p-10">
          {/* Graph Title */}
          <h2 className="text-2xl mb-6 font-semibold">{formattedFirstTitle}</h2>

          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[#FF6B8A]"></div>
              <span className="text-sm text-gray-300 font-normal">{reportData.graph.redLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[#78c38e]"></div>
              <span className="text-sm text-gray-300 font-normal">{reportData.graph.greenLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[#1E1E1E]"></div>
              <span className="text-sm text-gray-300 font-normal">{reportData.graph.blackLabel}</span>
            </div>
            <div className="flex items-center gap-2 ml-8">
              <span className="text-sm text-gray-300 font-normal">{reportData.graph.resultLabel}</span>
            </div>
          </div>

          <div className="relative h-[400px] mt-16 mb-24">
            {/* Y-axis labels */}
            <div className="absolute -left-2 -top-11 h-[110%] flex flex-col justify-between text-xs text-gray-400 font-normal">
              <span>% compliance</span>
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
            <div className="relative h-[98%] ml-8 grid grid-cols-12 gap-4">
              {bars.map((graph, index) => (
                <div key={index} className="relative">
                  {graph ? (
                    <>
                      <div className="absolute -top-6 w-full text-center text-gray-400 text-xs font-normal">
                        {reportData.type === 'Compliance' ? `${graph.green + graph.red!}%` : `${graph.green}%`}
                      </div>
                      <div className="absolute bottom-0 w-full bg-[#1E1E1E] h-full">
                        {/* Green bar */}
                        <div 
                          className="absolute bottom-0 w-full bg-[#78c38e]" 
                          style={{ 
                            height: `${graph.green}%`
                          }}
                        ></div>
                        {reportData.type === 'Compliance' ? (
                          /* Partial compliance bar for Compliance type */
                          <div 
                            className="absolute w-full bg-[#FF6B8A]" 
                            style={{ 
                              bottom: `${graph.green}%`,
                              height: `${graph.red}%`
                            }}
                          ></div>
                        ) : (
                          /* Upper and Lower bound lines for Behavioral type */
                          <>
                            <div 
                              className="absolute w-full h-[2px] bg-[#FF6B8A]" 
                              style={{ 
                                bottom: `${graph.lowerBound}%`
                              }}
                            ></div>
                            <div 
                              className="absolute w-full h-[2px] bg-[#FF6B8A]" 
                              style={{ 
                                bottom: `${graph.upperBound}%`
                              }}
                            ></div>
                          </>
                        )}
                      </div>
                      {/* X-axis label */}
                      <div className="absolute bottom-[-52px] text-xs text-gray-400 font-normal text-center w-full leading-tight">
                        {graph.title}
                      </div>
                    </>
                  ) : (
                    // Empty black bar for unused positions
                    <div className="absolute bottom-0 w-full bg-[#1E1E1E] h-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Section - Weekly Report Initiative */}
        <WeeklyInitiative 
          type={reportData.type}
          title={reportData.secondPageTitle}
          fullCompliance={{
            percentage: reportData.graph.bars[lastIndex].green,
            change: fullComplianceChange
          }}
          partialCompliance={{
            percentage: reportData.type === 'Compliance' ? reportData.graph.bars[lastIndex].red! : 0,
            change: partialComplianceChange
          }}
          subRequirements={reportData.subRequirements?.data || []}
          consultants={sortedConsultants.map(consultant => ({
            name: consultant.name,
            result: consultant.result,
            percentage: consultant.percentage
          }))}
          averageResult={reportData.individualPerformance.averageResult}
          weeklyInsights={reportData.weeklyInsights}
          individualPerformanceCount={reportData.individualPerformance.verdictsCount}
        />
      </div>
    </div>
  );
}
