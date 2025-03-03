"use client";
import CreatePdfButton from "../components/CreatePdfButton";
import { EnrolmentReportData } from "../types/types";
import { useState } from "react";

export default function EnrolmentReportPage({
  reportData,
}: {
  reportData: EnrolmentReportData;
}) {
  const [showSubRequirements, setShowSubRequirements] = useState(false);

  const formatLabel = (label: string) => {
    if (label.startsWith('Feb-Mar')) {
      return {
        row1: 'Feb-Mar',
        row2: '2024',
        row3: '2000 hours'
      };
    }
    const weekMatch = label.match(/week-(\d+)/);
    if (weekMatch) {
      const [_, dates] = label.split('_');
      const [firstDate, secondDate] = dates.split('-');
      return {
        row1: `Week ${weekMatch[1]}`,
        row2: firstDate,
        row3: secondDate
      };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-8 font-light">
      <div className="max-w-5xl mx-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-[#1E1E1E] pt-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl whitespace-nowrap">
              <span className="text-[#FF6B8A] font-semibold">
                {reportData.metadata.consultant_name} |
              </span>
              <span className="text-white text-4xl">
                {" "}
                {reportData.metadata.report_type}
              </span>
            </h1>
            <p className="text-xl italic text-[#a6a6a6] mt-4">
              Week {reportData.metadata.week_number}:{" "}
              {reportData.metadata.date_range}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-[#a6a6a6] my-8"></div>
        </div>

        {/* Stats Table */}
        <div className="bg-[#252525] rounded-lg px-10 pb-10">
          {/* Stats Title */}
          <h2 className="text-2xl font-medium pt-8 mb-8">
            Your week in numbers:
          </h2>

          <table className="w-full border-separate border-spacing-x-6">
            <thead>
              <tr>
                <th className="text-left pb-8 w-12">
                  <span className="sr-only">Category</span>
                </th>
                <th className="text-center pb-8 w-1/3">
                  <div className="bg-[#303030] rounded px-4 py-6 text-xl font-normal">
                    consultation %
                  </div>
                </th>
                <th className="text-center pb-8 w-1/3">
                  <div className="bg-[#303030] rounded px-4 py-6 text-xl font-normal">
                    attempted close %
                  </div>
                </th>
                <th className="text-center pb-8 w-1/3">
                  <div className="bg-[#303030] rounded px-4 py-6 text-xl font-normal">
                    positive response %
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-3xl tracking-wide">
              <tr>
                <td className="relative w-12">
                  <div
                    className="absolute -left-2 top-1/2 -translate-y-1/2 text-white/80 text-lg -rotate-180 font-semibold"
                    style={{ writingMode: "vertical-lr", height: "auto" }}
                  >
                    Individ.
                  </div>
                </td>
                <td className="text-center py-6 font-normal">
                  {reportData.percentage_of_consultation.individual}%
                </td>
                <td className="text-center py-6 font-normal">
                  {reportData.percentage_of_attempted_close.individual}%
                </td>
                <td className="text-center py-6 font-normal">
                  {reportData.percentage_of_positive_response.individual}%
                </td>
              </tr>
              <tr>
                <td className="relative w-12">
                  <div
                    className="absolute -left-2 top-1/2 -translate-y-1/2 text-white/80 text-lg -rotate-180 font-semibold"
                    style={{ writingMode: "vertical-lr", height: "auto" }}
                  >
                    Avrg<br />Team
                  </div>
                </td>
                <td className="text-center py-6 font-normal">
                  {reportData.percentage_of_consultation.team}%
                </td>
                <td className="text-center py-6 font-normal">
                  {reportData.percentage_of_attempted_close.team}%
                </td>
                <td className="text-center py-6 font-normal">
                  {reportData.percentage_of_positive_response.team}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bar Graph */}
        <div className="mt-8 bg-[#252525] rounded-lg p-10">
          {/* Graph Title and Toggle */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-normal">
              <span className="font-medium">Next steps skill fulfillment</span> | {showSubRequirements ? "sub-requirements" : "historical scores"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-base font-normal text-[#ffffff]">
                {showSubRequirements 
                  ? "toggle for historical trend"
                  : "toggle for sub requirements"
                }
              </span>
              <button
                onClick={() => setShowSubRequirements(!showSubRequirements)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out bg-[#FF6B8A]`}
                aria-label={showSubRequirements ? "Switch to historical trend view" : "Switch to sub-requirements view"}
              >
                <div
                  className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform duration-200 ease-in-out ${
                    showSubRequirements ? 'left-1' : 'transform translate-x-6 left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[#FF6B8A]"></div>
              <span className="text-xs text-[#e5e5e5] font-normal">
                {reportData.bargraph_legend[0].red_label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[#78c38e]"></div>
              <span className="text-xs text-[#e5e5e5] font-normal">
                {reportData.bargraph_legend[0].green_label}
              </span>
            </div>
          </div>

          <div className="relative h-[400px] mt-16 mb-16">
            {/* Y-axis labels */}
            <div className="absolute -left-2 -top-11 h-[110%] flex flex-col justify-between text-xs text-[#a6a6a6] font-normal">
              <span>Score</span>
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
            <div className="relative h-[98%] ml-8">
              {(showSubRequirements ? reportData.bargraph_sub_requirements : reportData.bargraph_historical).map((score, index) => {
                const barWidth = 64;
                const gapWidth = showSubRequirements ? 160 : 16; // Enhanced spacing for sub-requirements
                const totalWidth = barWidth + gapWidth;
                
                return (
                  <div
                    key={index}
                    className="absolute bottom-0 h-full"
                    style={{ left: `${index * totalWidth}px` }}
                  >
                    <div className="absolute bottom-0 w-16 bg-[#1E1E1E] h-full">
                      <>
                        <div
                          className="absolute bottom-0 w-full bg-[#78c38e]"
                          style={{
                            height: `${score.green}%`,
                          }}
                        ></div>
                        {/* Red bar */}
                        <div
                          className="absolute w-full bg-[#FF6B8A]"
                          style={{
                            height: `${score.red}%`,
                            bottom: `${score.green}%`,
                          }}
                        ></div>
                      </>
                    </div>
                    {/* X-axis label */}
                    {showSubRequirements ? (
                      <div 
                        className="absolute text-xs font-normal text-center flex flex-col gap-1.5"
                        style={{
                          bottom: '-52px',
                          left: '32px',
                          transform: 'translateX(-50%)',
                          width: barWidth * 2.5
                        }}
                      >
                        {(() => {
                          const label = score.label;
                          const parts = label.split(' | ');
                          if (parts.length === 2) {
                            return (
                              <>
                                <div className="text-white whitespace-normal text-[11px] leading-tight">{parts[0]}</div>
                                <div className="text-white whitespace-normal text-[11px] leading-tight">{parts[1]}</div>
                              </>
                            );
                          }
                          return <div className="text-white whitespace-normal text-[11px] leading-tight">{label}</div>;
                        })()}
                      </div>
                    ) : (
                      <div 
                        className="absolute text-xs font-normal text-center flex flex-col gap-1.5"
                        style={{
                          bottom: '-82px',
                          left: 0,
                          right: 0,
                          width: barWidth,
                          margin: '0 auto'
                        }}
                      >
                        {(() => {
                          const parts = score.label.split('_');
                          return (
                            <>
                              <div className="text-white font-medium">{parts[0]}</div>
                              <div className="text-white">{parts[1] || ''}</div>
                              <div className="text-white">{parts[2] || ''}</div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Positive themes driving successful enrolment responses */}
        <div className="mt-16">
          <h2 className="text-2xl mb-6 font-medium">
            Positive themes driving successful enrolment responses:
          </h2>

          <div className="space-y-8">
            {/* Highlights */}
            <div className="bg-[#252525] rounded-lg p-8">
              <h3 className="text-3xl font-semibold mb-6 text-[#78c38e]">
                Highlights:
              </h3>
              <ul className="space-y-4">
                {reportData.themes.positive.map(
                  (theme: any, index: number) => (
                    <li key={index} className="mb-4">
                      <div className="text-xl font-medium mb-2">{theme.headline}</div>
                      <div className="text-lg font-normal">{theme.explanation}</div>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-[#252525] rounded-lg p-8">
              <h3 className="text-3xl font-semibold mb-6 text-[#FF6B8A]">
                Opportunities:
              </h3>
              <ul className="space-y-4">
                {reportData.themes.improvement.map(
                  (theme: any, index: number) => (
                    <li key={index} className="mb-4">
                      <div className="text-xl font-medium mb-2">{theme.headline}</div>
                      <div className="text-lg font-normal">{theme.explanation}</div>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Conversation Analysis */}
        <div className="mt-12">
          <h2 className="text-2xl mb-6 font-medium">Conversation Analysis</h2>
          <div className="space-y-4">
            {reportData.conversation_analysis.condensed.insights.map(
              (insight: any) => (
                <div key={insight.number} className="bg-[#2A2A2A] p-6 rounded">
                  <h3 className="text-xl font-medium mb-2">
                    {insight.number}. {insight.title} 
                    <span className="text-sm text-[#a6a6a6] ml-2">
                      (Call ID: {insight.related_calls.primary_call.call_id})
                    </span>
                  </h3>
                  <div className="space-y-2 text-lg font-normal">
                    <p>
                      <span className="font-semibold">
                        Student Trigger:
                      </span>
                      <br /> {insight.student_trigger}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Context Impact:
                      </span>
                      <br /> {insight.context_impact}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Consultant Response:
                      </span>
                      <br /> {insight.consultant_response}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Improvement:
                      </span>
                      <br /> {insight.improvement}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Effective Collaborating Planning */}
        <div className="mt-16 space-y-12">
          {reportData.conversation_analysis.effective_collaborating_planning.insights.map((insight: any) => (
            <div key={insight.number} className="space-y-6">
              <h2 className="text-2xl mb-6 font-medium">
                {insight.number}. {insight.title}
              </h2>

              {/* Student Trigger */}
              <div className="space-y-2">
                <h3 className="text-xl font-normal italic">
                  Student Trigger:
                </h3>
                <div className="border border-[#78c38e] rounded-lg p-6">
                  <p className="text-lg font-normal">{insight.student_trigger}</p>
                </div>
              </div>

              {/* Consultant Response */}
              <div className="space-y-2">
                <h3 className="text-xl font-normal italic">
                  Consultant Response:
                </h3>
                <div className="border border-[#78c38e] rounded-lg p-6">
                  <p className="text-lg font-normal">
                    {insight.consultant_response}
                  </p>
                </div>
              </div>

              {/* Recommended Improvement */}
              <div className="space-y-2">
                <h3 className="text-xl font-normal italic">
                  Recommended Approach:
                </h3>
                <div className="border border-[#FF6B8A] rounded-lg p-6">
                  <p className="text-lg font-normal">
                    {insight.recommended_approach}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
