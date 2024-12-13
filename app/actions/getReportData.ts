'use server'

const fs = require('fs');
const path = require('path');

interface ConversationAnalysis {
  id: number;
  type: string;
  callId: string;
  segmentId?: string;
  studentTrigger: string;
  contextAndImpact: string;
  consultantResponse: string;
  recommendedImprovement: string;
}

export interface ReportData {
  metadata: {
    consultantName: string;
    reportType: string;
    weekNumber: number;
    dateRange: string;
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
  average_finalRanking_score_eligible_transcripts: number;
  average_finalRanking_score_all_transcripts_over_2_mins: number;
  team_average_finalRanking_score_eligible_transcripts: number;
  team_average_finalRanking_score_all_transcripts_over_2_mins: number;
  conversationAnalysis: {
    condensed: {
      conversations: ConversationAnalysis[];
    };
    verbose: {
      conversations: ConversationAnalysis[];
    };
  };
}

export async function getReportData(filename: string): Promise<ReportData> {
  const jsonDirectory = path.join(process.cwd(), 'json_reports');
  const filePath = path.join(jsonDirectory, filename);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    return data;
  } catch (error) {
    console.error('Error reading JSON report:', error);
    throw new Error('Failed to read report data');
  }
}