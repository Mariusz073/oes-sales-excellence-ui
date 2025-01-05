'use server'

const fs = require('fs');
const path = require('path');

interface RelatedCalls {
  primary_call: {
    call_id: string;
    segment_id: string;
    timestamp: string | null;
  };
  supporting_calls: Array<{
    call_id: string;
    segment_id: string;
    timestamp: string | null;
  }>;
}

interface Theme {
  headline: string;
  explanation: string;
}

interface BehavioralScore {
  label: string;
  average_final_ranking_score_eligible_transcripts: number;
  average_final_ranking_score_all_transcripts_over_2_mins: number;
  team_average_final_ranking_score_eligible_transcripts: number;
  team_average_final_ranking_score_all_transcripts_over_2_mins: number;
}

interface ConversationBase {
  id: number;
  title: string;
  type: string;
  is_aggregated: boolean;
  related_calls: RelatedCalls;
  student_trigger: string;
  consultant_response: string;
  context_impact: string;
  recommended_approach: string;
}

interface ConversationCondensed extends ConversationBase {}

interface ConversationVerbose extends ConversationBase {
  priority: string;
}

export interface ReportData {
  metadata: {
    consultant_name: string;
    report_type: string;
    week_number: number;
    date_range: string;
  };
  total_number_of_calls: number;
  team_average_total_number_of_calls_per_sales_consultant: number;
  number_of_calls_over_2_minutes: {
    absolute_number: number;
    team_average_absolute_number: number;
  };
  percent_of_calls_over_2_minutes: {
    percentage: number;
    team_average_percentage: number;
  };
  number_of_calls_under_2_minutes: {
    absolute_number: number;
    team_average_absolute_number: number;
  };
  percent_of_calls_under_2_minutes: {
    percentage: number;
    team_average_percentage: number;
  };
  average_talking_percentage: {
    individual_average: number;
    team_average: number;
  };
  excluded_transcripts: {
    individual_excluded_transcripts: number;
    team_total_excluded_transcripts: number;
  };
  behavioral_scores: BehavioralScore[];
  themes: {
    positive: Theme[];
    improvement: Theme[];
  };
  conversation_analysis: {
    condensed: {
      conversations: ConversationCondensed[];
    };
    verbose: {
      conversations: ConversationVerbose[];
    };
  };
}

export async function getReportData(filename: string): Promise<ReportData> {
  const jsonDirectory = path.join(process.cwd(), 'app/data/json_reports');
  
  // Ensure filename has .json extension
  const jsonFilename = filename.replace(/\.[^/.]+$/, '') + '.json';
  const filePath = path.join(jsonDirectory, jsonFilename);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const rawData = JSON.parse(fileContent);

    // Transform data to match expected format
    const data: ReportData = {
      metadata: {
        consultant_name: rawData.metadata.consultant_name,
        report_type: rawData.metadata.report_type,
        week_number: rawData.metadata.week_number,
        date_range: rawData.metadata.date_range
      },
      total_number_of_calls: rawData.total_number_of_calls,
      team_average_total_number_of_calls_per_sales_consultant: rawData.team_average_total_number_of_calls_per_sales_consultant,
      number_of_calls_over_2_minutes: rawData.number_of_calls_over_2_minutes,
      percent_of_calls_over_2_minutes: rawData.percent_of_calls_over_2_minutes,
      number_of_calls_under_2_minutes: rawData.number_of_calls_under_2_minutes,
      percent_of_calls_under_2_minutes: rawData.percent_of_calls_under_2_minutes,
      average_talking_percentage: rawData.average_talking_percentage,
      excluded_transcripts: rawData.excluded_transcripts,
      behavioral_scores: rawData.behavioral_scores,
      themes: rawData.themes,
      conversation_analysis: rawData.conversation_analysis
    };

    console.log('Transformed data:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error reading JSON report:', error);
    throw new Error('Failed to read report data');
  }
}
