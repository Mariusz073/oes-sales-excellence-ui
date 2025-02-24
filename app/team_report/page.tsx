import { getTeamReportData } from "../actions/getTeamReportData";
import { WeeklyInitiative } from "./sub_page";
import { getCollaborativePercentageScore } from "../lib/utils";
import TeamBarGraph from "../components/TeamBarGraph";

interface Graph {
  title: string;
  green: number;
  red?: number;
  upperBound?: number;
  lowerBound?: number;
  upper_bound?: number;
  lower_bound?: number;
}

interface SubRequirement {
  title: string;
  current: number;
  last_week: number;
}

interface ConsultantResult {
  name: string;
  result?: string;
  percentage_high_need?: string;
  high_need_score?: string;
  all_score?: string;
}

interface AverageResult {
  name: string;
  result: string;
  percentage_high_need?: string;
  high_need_score?: string;
  all_score?: string;
}

interface WeeklyInsight {
  title: string;
  content: string;
  border_color: string;
}

interface WeeklyInsights {
  verdicts_count: number;
  insights: WeeklyInsight[];
}

interface TeamReportData {
  type: string;
  requirement: string;
  first_page_title: string;
  second_page_title: string;
  graph: {
    bars: Graph[];
    green_label: string;
    red_label: string;
    black_label: string;
    result_label: string;
  };
  sub_requirements?: {
    data: SubRequirement[];
    verdicts_count: number;
  };
  individual_performance: {
    verdicts_count: number;
    consultant_results: ConsultantResult[];
    average_result: AverageResult;
  };
  weekly_insights?: {
    verdicts_count: number;
    insights: WeeklyInsight[];
  };
}

export default async function TeamReportPage({
  searchParams,
}: {
  searchParams: { team: string; analysis: string; week: string; code?: string };
}): Promise<JSX.Element> {
  const reportData = (await getTeamReportData(
    searchParams.team,
    searchParams.analysis,
    searchParams.week,
    searchParams.code
  )) as TeamReportData | null;

  // Transform data for behavioral reports
  if (
    reportData &&
    (reportData.type === "behavioural" || reportData.type === "behavioral")
  ) {
    // Update average result to use percentage_high_need
    if (reportData.individual_performance.average_result.high_need_score) {
      reportData.individual_performance.average_result.result =
        getCollaborativePercentageScore(
          reportData.individual_performance.average_result.high_need_score
        );
    }

    // Transform graph data to use upperBound and lowerBound
    reportData.graph.bars = reportData.graph.bars.map((bar) => ({
      ...bar,
      upperBound: bar.upper_bound,
      lowerBound: bar.lower_bound,
    }));
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-white p-8 font-light flex items-center justify-center">
        <div className="text-2xl text-red-500">No report data file found</div>
      </div>
    );
  }

  // Extract titles and highlight the text between <em> tags in red
  const firstTitleParts = reportData.first_page_title.split(/<em>|<\/em>/);
  const formattedFirstTitle = firstTitleParts.map(
    (part: string, index: number) =>
      index % 2 === 1 ? (
        <span key={index} className="text-[#FF6B8A]">
          {part}
        </span>
      ) : (
        part
      )
  );

  // Calculate compliance changes
  const lastIndex = reportData.graph.bars.length - 1;
  const prevIndex = lastIndex - 1;
  const fullComplianceChange =
    reportData.graph.bars[lastIndex].green -
    reportData.graph.bars[prevIndex].green;
  const partialComplianceChange =
    reportData.type === "Compliance"
      ? reportData.graph.bars[lastIndex].red! -
        reportData.graph.bars[prevIndex].red!
      : 0;

  // Sort consultants by compliance percentage
  const sortedConsultants = [
    ...reportData.individual_performance.consultant_results,
  ]
    .map((consultant) => {
      // Handle both compliance and behavioral data structures
      const percentageStr =
        reportData.type === "behavioural" || reportData.type === "behavioral"
          ? consultant.percentage_high_need
          : consultant.result;

      // Extract percentage from either format
      const percentageMatch = percentageStr?.match(/\((\d+(?:\.\d+)?)%\)$/);
      const percentage = percentageMatch ? parseFloat(percentageMatch[1]) : 0;

      return {
        ...consultant,
        // For behavioral reports, use percentage_high_need as result
        result:
          reportData.type === "behavioural" || reportData.type === "behavioral"
            ? getCollaborativePercentageScore(consultant.high_need_score) //PK: Changed as per Jason request, total score is 380
            : consultant.result,
        percentage,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-8 font-light">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="title font-bold">
          Team Report Page{" "}
          <span className="text-white">
            - {searchParams.team === "monash" ? "Monash" : "SOL"} -{" "}
            {searchParams.analysis === "compliance"
              ? "Compliance"
              : "Behavioural"}{" "}
            - Week {searchParams.week}
          </span>
        </h1>

        {/* First Bar Graph Section */}
        <div className="mt-8 bg-[#252525] rounded-lg p-10 pb-40">
          {/* Graph Title */}
          <h2 className="text-2xl mb-6 font-semibold">{formattedFirstTitle}</h2>

          <TeamBarGraph
            graphs={reportData.graph.bars}
            type={reportData.type}
            greenLabel={reportData.graph.green_label}
            redLabel={reportData.graph.red_label}
            blackLabel={reportData.graph.black_label}
            resultLabel={reportData.graph.result_label}
          />
        </div>

        {/* Second Section - Weekly Report Initiative */}
        <WeeklyInitiative
          type={reportData.type}
          title={reportData.second_page_title}
          fullCompliance={{
            percentage: reportData.graph.bars[lastIndex].green,
            change: fullComplianceChange,
          }}
          partialCompliance={{
            percentage:
              reportData.type === "Compliance"
                ? reportData.graph.bars[lastIndex].red!
                : 0,
            change: partialComplianceChange,
          }}
          subRequirements={reportData.sub_requirements?.data || []}
          consultants={sortedConsultants.map((consultant) => ({
            name: consultant.name,
            result: consultant.result,
            percentage: consultant.percentage,
            high_need_score: consultant.high_need_score,
            all_score: consultant.all_score,
            percentage_high_need: consultant.percentage_high_need,
          }))}
          averageResult={{
            name: reportData.individual_performance.average_result.name,
            result: reportData.individual_performance.average_result.result,
            high_need_score:
              reportData.individual_performance.average_result.high_need_score,
            all_score:
              reportData.individual_performance.average_result.all_score,
          }}
          weeklyInsights={reportData.weekly_insights}
          individualPerformanceCount={
            reportData.individual_performance.verdicts_count
          }
        />
      </div>
    </div>
  );
}
