export interface UserPrivileges {
  individualReports: boolean;
  teamMonash: boolean;
  teamSOL: boolean;
  teamBehavioural: boolean;
  teamCollaborative: boolean;
  allowedReports?: string[];
}

export interface EnrolmentReportData {
  metadata: {
    consultant_name: string;
    week_number: number;
    date_range: string;
    report_type: string;
  };
  percentage_of_consultation: {
    individual: number;
    team: number;
  };
  percentage_of_attempted_close: {
    individual: number;
    team: number;
  };
  percentage_of_positive_response: {
    individual: number;
    team: number;
  };
  bargraph_sub_requirements: {
    label: string;
    green: number;
    red: number;
  }[];
  bargraph_historical: {
    label: string;
    green: number;
    red: number;
  }[];
  bargraph_legend: {
    green_label: string;
    red_label: string;
  }[];
  themes: {
    positive: {
      explanation: string;
      explanation1?: string;
      explanation2?: string;
    }[];
    improvement: {
      explanation: string;
      explanation1?: string;
      explanation2?: string;
    }[];
  };
  conversation_analysis: {
    condensed: {
      conversations: {
        id: number;
        title: string;
        related_calls: {
          primary_call: {
            call_id: string;
            segment_id: string;
            timestamp: string;
          };
          supporting_calls: {
            call_id: string;
            segment_id: string;
            timestamp: string;
          }[];
        };
        consultant_close_attempt: string;
        student_response: string;
        consultant_adaptation: string;
        recommended_improvement: string;
      }[];
    };
    effective_collaborating_planning: {
      goal_setting: {
        id: number;
        title: string;
        consultant_close_attempt: string;
        student_response: string;
        consultant_adaptation: string;
        recommended_improvement: string;
      }[];
    };
  };
}

export type ReportData = EnrolmentReportData;
