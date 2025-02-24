import { getReportData } from "../../actions/getReportData";
import { EnrolmentReportData } from "../../types/types";
import EnrolmentReportPage from "../enrolment_report";

export default async function Page({
  searchParams,
}: {
  searchParams: { file: string };
}) {
  const reportData = await getReportData(searchParams.file);

  if (!reportData) return <div>Loading...</div>;

  return <EnrolmentReportPage reportData={reportData as EnrolmentReportData} />;
}
