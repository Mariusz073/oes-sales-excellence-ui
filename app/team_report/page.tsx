import { getTeamReportData } from "../actions/getTeamReportData";

interface ComplianceGraph {
  title: string;
  full: number;
  partial: number;
}

interface SubRequirement {
  title: string;
  current: number;
  lastWeek: number;
}

interface ConsultantResult {
  name: string;
  totalOutbound: number;
  compliant: number;
}

interface TeamReportData {
  firstPageTitle: string;
  secondPageTitle: string;
  complianceGraph: ComplianceGraph[];
  subRequirements: {
    data: SubRequirement[];
    verdictsCount: number;
  };
  individualPerformance: {
    verdictsCount: number;
    consultantResults: ConsultantResult[];
  };
}

interface SubRequirementsBarProps {
  data: {
    current: number;
    lastWeek: number;
    title: string;
  };
}

const CircularProgress = ({ percentage, color }: { percentage: number; color: string }) => (
  <div className="relative w-20 h-20">
    <svg className="w-full h-full" viewBox="0 0 100 100">
      {/* Background circle */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#2A2A2A"
        strokeWidth="8"
      />
      {/* Progress circle */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={`${percentage * 2.51327} 251.327`}
        transform="rotate(-90 50 50)"
        strokeLinecap="round"
      />
      {/* Percentage text */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dy="7"
        className="text-lg font-normal"
        fill="white"
      >
        {percentage}%
      </text>
    </svg>
  </div>
);

const SubRequirementsBar = ({ data }: SubRequirementsBarProps) => (
  <div className="relative h-32">
    <div className="absolute inset-0 flex items-end">
      {/* Bar with gradient */}
      <div className="relative w-32 h-full">
        <div 
          className="absolute bottom-0 w-full bg-gradient-to-t from-[#4CAF50] to-[#4CAF50]/50"
          style={{ height: `${data.current}%` }}
        >
          {/* Last week line */}
          <div 
            className="absolute w-full h-[2px] bg-[#FF6B8A]"
            style={{ bottom: `${data.lastWeek - data.current}%` }}
          ></div>
        </div>
      </div>
    </div>
    {/* Title */}
    <div className="absolute bottom-[-24px] text-sm text-gray-400 whitespace-nowrap">
      {data.title}
    </div>
    {/* Current value */}
    <div className="absolute top-[-24px] text-sm text-gray-400">
      {data.current}%
    </div>
  </div>
);

export default async function TeamReportPage({
  searchParams,
}: {
  searchParams: { team: string; analysis: string };
}): Promise<JSX.Element> {
  const reportData = await getTeamReportData(searchParams.team, searchParams.analysis) as TeamReportData | null;

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

  const secondTitleParts = reportData.secondPageTitle.split(/<em>|<\/em>/);
  const formattedSecondTitle = secondTitleParts.map((part: string, index: number) => 
    index % 2 === 1 ? <span key={index} className="text-[#FF6B8A]">{part}</span> : part
  );

  // Calculate compliance changes
  const lastIndex = reportData.complianceGraph.length - 1;
  const prevIndex = lastIndex - 1;
  const fullComplianceChange = reportData.complianceGraph[lastIndex].full - reportData.complianceGraph[prevIndex].full;
  const partialComplianceChange = reportData.complianceGraph[lastIndex].partial - reportData.complianceGraph[prevIndex].partial;

  // Sort consultants by compliance ratio and handle ties
  const sortedConsultants = [...reportData.individualPerformance.consultantResults]
    .map(consultant => ({
      ...consultant,
      ratio: consultant.compliant / consultant.totalOutbound
    }))
    .sort((a, b) => {
      const ratioA = a.compliant / a.totalOutbound;
      const ratioB = b.compliant / b.totalOutbound;
      if (ratioB === ratioA) {
        return b.compliant - a.compliant;
      }
      return ratioB - ratioA;
    });

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

        {/* First Bar Graph Section */}
        <div className="mt-8 bg-[#252525] rounded-lg p-10">
          {/* Graph Title */}
          <h2 className="text-2xl mb-6 font-semibold">{formattedFirstTitle}</h2>

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
                      <div className="absolute -top-6 w-full text-center text-gray-400 text-xs font-normal">
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
          </div>
        </div>

        {/* Second Section */}
        <div className="mt-8 bg-[#252525] rounded-lg p-10">
          {/* Title */}
          <h2 className="text-2xl mb-10 font-semibold border-b border-gray-600 pb-4">{formattedSecondTitle}</h2>

          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              {/* Compliance Verdict */}
              <h3 className="text-xl mb-6">Compliance verdict</h3>
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <div className="text-[#FF6B8A] text-xl mb-2">Full compliance</div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2" stroke="#4CAF50" strokeWidth="2"/>
                        <path d="M12 8L12 16M12 8L16 12M12 8L8 12" stroke="#4CAF50" strokeWidth="2"/>
                      </svg>
                      <span className="text-[#4CAF50]">+{fullComplianceChange}%</span>
                      <span className="text-gray-400">Since last week</span>
                    </div>
                  </div>
                  <CircularProgress 
                    percentage={reportData.complianceGraph[lastIndex].full}
                    color="#4CAF50"
                  />
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <div className="text-[#FF6B8A] text-xl mb-2">Partial compliance</div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2" stroke="#FF6B8A" strokeWidth="2"/>
                        <path d="M12 16L12 8M12 16L16 12M12 16L8 12" stroke="#FF6B8A" strokeWidth="2"/>
                      </svg>
                      <span className="text-[#FF6B8A]">{partialComplianceChange}%</span>
                      <span className="text-gray-400">Since last week</span>
                    </div>
                  </div>
                  <CircularProgress 
                    percentage={reportData.complianceGraph[lastIndex].partial}
                    color="#FF6B8A"
                  />
                </div>
              </div>

              {/* Sub-requirements */}
              <div className="mt-12">
                <h3 className="text-xl mb-6">Sub-requirements</h3>
                
                {/* Legend */}
                <div className="flex items-center gap-6 mb-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-[2px] bg-[#4CAF50]"></div>
                    <span>This week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-[2px] bg-[#FF6B8A]"></div>
                    <span>Last week</span>
                  </div>
                </div>

                {/* Y-axis labels */}
                <div className="flex mb-6">
                  <div className="w-12 text-sm text-gray-400">
                    <div>% fulfilled</div>
                    <div className="mt-2">100</div>
                  </div>
                </div>

                {/* Bars */}
                <div className="relative pl-12">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-gray-400">
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                  </div>

                  {/* Bars container */}
                  <div className="flex gap-16">
                    {reportData.subRequirements.data.map((req, index) => (
                      <SubRequirementsBar key={index} data={req} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Individual Performance */}
            <div>
              <h3 className="text-xl mb-6">Individual performance</h3>
              <div className="space-y-4">
                {/* Top 2 performers */}
                {sortedConsultants.slice(0, 2).map((consultant, index) => (
                  <div key={index} className="flex items-center gap-4 bg-[#1E1E1E] p-4 rounded">
                    <div className="w-8 h-8 rounded bg-[#4CAF50] flex items-center justify-center">
                      {index + 1}
                    </div>
                    <span className="flex-grow">{consultant.name}</span>
                    <span>{consultant.compliant}/{consultant.totalOutbound} ({Math.round(consultant.ratio * 100)}%)</span>
                  </div>
                ))}

                {/* Ellipsis */}
                <div className="text-center text-2xl text-gray-500">...</div>

                {/* Bottom 2 performers */}
                {sortedConsultants.slice(-2).map((consultant, index) => (
                  <div key={index} className="flex items-center gap-4 bg-[#1E1E1E] p-4 rounded">
                    <div className="w-8 h-8 rounded bg-[#FF6B8A] flex items-center justify-center">
                      {sortedConsultants.length - 1 + index}
                    </div>
                    <span className="flex-grow">{consultant.name}</span>
                    <span>{consultant.compliant}/{consultant.totalOutbound} ({Math.round(consultant.ratio * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
