import { getTeamReportData } from "../actions/getTeamReportData";

interface ComplianceGraph {
  title: string;
  full: number;
  partial: number;
}

interface TeamReportData {
  firstPageTitle: string;
  complianceGraph: ComplianceGraph[];
}

export default async function TeamReportPage({
  searchParams,
}: {
  searchParams: { team: string; analysis: string };
}) {
  const reportData = await getTeamReportData(searchParams.team, searchParams.analysis) as TeamReportData | null;

  if (!reportData) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-white p-8 font-light flex items-center justify-center">
        <div className="text-2xl text-red-500">No report data file found</div>
      </div>
    );
  }

  // Extract title and highlight the text between <em> tags in red
  const titleParts = reportData.firstPageTitle.split(/<em>|<\/em>/);
  const formattedGraphTitle = titleParts.map((part: string, index: number) => 
    index % 2 === 1 ? <span key={index} className="text-[#FF6B8A]">{part}</span> : part
  );

  // Create array of 12 positions
  const totalBars = 12;
  const bars = Array.from({ length: totalBars }, (_, index) => {
    if (index < reportData.complianceGraph.length) {
      return reportData.complianceGraph[index];
    }
    return null;
  });

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-8 font-light">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="title font-bold">Team Report Page</h1>

        {/* Bar Graph Section */}
        <div className="mt-8 bg-[#252525] rounded-lg p-10">
          {/* Graph Title */}
          <h2 className="text-2xl mb-6 font-semibold">{formattedGraphTitle}</h2>

          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[#FF6B8A]"></div>
              <span className="text-sm text-gray-300 font-normal">Partial compliance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[#4CAF50]"></div>
              <span className="text-sm text-gray-300 font-normal">Full compliance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[#1E1E1E]"></div>
              <span className="text-sm text-gray-300 font-normal">No compliance</span>
            </div>
            <div className="flex items-center gap-2 ml-8">
              <span className="text-sm text-gray-300 font-normal">86% - Full & Partial compliance combined</span>
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
                      <div className="absolute -top-5 w-full text-xs text-center text-sm text-gray-300 font-normal">
                        {graph.full + graph.partial}%
                      </div>
                      <div className="absolute bottom-0 w-full bg-[#1E1E1E] h-full">
                        {/* Full compliance bar */}
                        <div 
                          className="absolute bottom-0 w-full bg-[#4CAF50]" 
                          style={{ 
                            height: `${graph.full}%`
                          }}
                        ></div>
                        {/* Partial compliance bar */}
                        <div 
                          className="absolute w-full bg-[#FF6B8A]" 
                          style={{ 
                            bottom: `${graph.full}%`,
                            height: `${graph.partial}%`
                          }}
                        ></div>
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

            {/* Timeline */}
            <div className="absolute bottom-[-80px] left-0 right-5">
              <div className="relative flex items-center w-full">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="flex-1 h-[1px] bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
