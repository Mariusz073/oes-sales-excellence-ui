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
      headline: string;
      explanation: string;
    }[];
    improvement: {
      headline: string;
      explanation: string;
    }[];
  };
  conversation_analysis: {
    condensed: {
      insights: {
        number: string | number;
        title: string;
        type: string;
        is_aggregated: boolean;
        related_calls: {
          primary_call: {
            call_id: string;
            segment_id: string;
            timestamp: string;
          };
        };
        student_trigger: string;
        context_impact: string;
        consultant_response: string;
        improvement: string;
      }[];
    };
    effective_collaborating_planning: {
      insights: {
        number: string | number;
        title: string;
        type: string;
        priority: string;
        is_aggregated: boolean;
        related_calls: {
          primary_call: {
            call_id: string;
            segment_id: string;
            timestamp: string;
          };
        };
        student_trigger: string;
        consultant_response: string;
        recommended_approach: string;
      }[];
    };
  };
}

export type ReportData = EnrolmentReportData;
