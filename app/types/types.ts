export interface UserPrivileges {
  individualReports: boolean;
  teamMonash: boolean;
  teamSOL: boolean;
  teamBehavioural: boolean;
  teamCollaborative: boolean;
  allowedReports?: string[];
}
