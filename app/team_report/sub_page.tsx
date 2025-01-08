'use client';

import React from 'react';
import { IndividualPerformanceDialog } from '../components/IndividualPerformanceDialog';

interface WeeklyInsight {
  title: string;
  content: string;
  border_color: string;
}

interface WeeklyInitiativeProps {
  type: string;
  title: string;
  fullCompliance?: {
    percentage: number;
    change: number;
  };
  partialCompliance?: {
    percentage: number;
    change: number;
  };
  subRequirements?: Array<{
    title: string;
    current: number;
    last_week: number;
  }>;
  consultants: Array<{
    name: string;
    result: string;
    percentage: number;
  }>;
  averageResult: {
    name: string;
    result: string;
  };
  weeklyInsights?: {
    verdicts_count: number;
    insights: WeeklyInsight[];
  };
  individualPerformanceCount?: number;
}

const CircularProgress = ({ percentage, color }: { percentage: number; color: string }) => (
  <div className="relative w-20 h-20" style={{ marginRight: '150px' }}>
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

const SubRequirementsBar = ({ data }: { data: { current: number; last_week: number; title: string } }) => (
  <div className="relative w-28">
    {/* Values */}
    <div className="absolute -top-16 left-7 text-sm whitespace-nowrap"
      style={{left: '103px'}}>
      <span className="text-[#78c38e]">{Math.round(data.current)}% : </span>
      <span className="text-[#FF6B8A]">{Math.round(data.last_week)}%</span>
    </div>

    {/* Bar */}
    <div className="relative h-[180px] bg-[#1E1E1E] top-[-40px] left-20">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between">
        <div className="h-px bg-gray-800" />
        <div className="h-px bg-gray-800" />
        <div className="h-px bg-gray-800" />
        <div className="h-px bg-gray-800" />
      </div>

      {/* Current week bar */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-[#78c38e]"
        style={{ 
          height: `${(data.current / 100) * 180}px`,
          marginBottom: '0px',
          transition: 'height 0.3s ease'
        }}
      />

      {/* Last week line */}
      <div 
        className="absolute left-0 right-0 h-1 bg-[#FF6B8A] z-10"
        style={{ 
          bottom: `${(data.last_week / 100) * 180}px`,
          transition: 'bottom 0.3s ease'
        }}
      />
    </div>

    {/* Title */}
    <div className="absolute -bottom-0 left-14 right-0 text-sm text-gray-400 whitespace-nowrap"
      style={{ left: '77px'}}>
      {data.title}
    </div>
  </div>
);

export const WeeklyInitiative = ({ 
  type,
  title, 
  fullCompliance, 
  partialCompliance, 
  subRequirements, 
  consultants, 
  averageResult,
  weeklyInsights,
  individualPerformanceCount
}: WeeklyInitiativeProps) => {
  const [showNonCompliance, setShowNonCompliance] = React.useState(false);

  // Sort consultants based on percentage from result string and toggle state
  const sortedConsultants = React.useMemo(() => {
    const filtered = consultants.filter(consultant => consultant.result !== "0/0 (0.00%)");
    const sorted = [...filtered].sort((a, b) => {
      // Extract percentages from result strings (format: "X/Y (Z%)")
      const getPercentage = (result: string) => {
        const match = result.match(/\((\d+(?:\.\d+)?)%\)/);
        return match ? parseFloat(match[1]) : 0;
      };
      return getPercentage(b.result) - getPercentage(a.result);
    });
    return showNonCompliance ? sorted.reverse() : sorted;
  }, [consultants, showNonCompliance]);
  // Extract title and highlight the text between <em> tags in red
  const titleParts = title.split(/<em>|<\/em>/);
  const formattedTitle = titleParts.map((part: string, index: number) => 
    index % 2 === 1 ? <span key={index} className="text-[#FF6B8A]">{part}</span> : part
  );

  // Filter out consultants with "0/0 (0.00%)" results
  const filteredConsultants = consultants.filter(consultant => consultant.result !== "0/0 (0.00%)");

  return (
    <div className="mt-8 bg-[#252525] rounded-lg p-10">
      {/* Title */}
      <h2 className="text-2xl mb-10 font-semibold border-b border-gray-600 pb-4">{formattedTitle}</h2>

      <div className="grid grid-cols-2 gap-8">
        {type === 'Compliance' ? (
          // Compliance Report Layout
          <>
            {/* Left Column */}
            <div>
              {/* Compliance Verdict */}
              <h3 className="text-xl font-medium mb-6">Compliance verdict</h3>
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <div className="text-[#78c38e] text-xl font-medium mb-2">Full compliance</div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2" stroke="#78c38e" strokeWidth="2"/>
                        {(fullCompliance?.change || 0) >= 0 ? (
                          <path d="M12 8L12 16M12 8L16 12M12 8L8 12" stroke="#78c38e" strokeWidth="2"/>
                        ) : (
                          <path d="M12 16L12 8M12 16L16 12M12 16L8 12" stroke="#78c38e" strokeWidth="2"/>
                        )}
                      </svg>
                      <span className="text-[#78c38e]">{fullCompliance?.change}%</span>
                      <span className="text-gray-300">Since last week</span>
                    </div>
                  </div>
                  <CircularProgress 
                    percentage={fullCompliance?.percentage || 0}
                    color="#78c38e"
                  />
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <div className="text-[#ff6b8a] text-xl font-medium mb-2">Partial compliance</div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2" stroke="#ff6b8a" strokeWidth="2"/>
                        {(partialCompliance?.change || 0) >= 0 ? (
                          <path d="M12 8L12 16M12 8L16 12M12 8L8 12" stroke="#ff6b8a" strokeWidth="2"/>
                        ) : (
                          <path d="M12 16L12 8M12 16L16 12M12 16L8 12" stroke="#ff6b8a" strokeWidth="2"/>
                        )}
                      </svg>
                      <span className="text-[#ff6b8a]">{partialCompliance?.change}%</span>
                      <span className="text-gray-300">Since last week</span>
                    </div>
                  </div>
                  <CircularProgress 
                    percentage={partialCompliance?.percentage || 0}
                    color="#FF6B8A"
                  />
                </div>
              </div>

              {/* Sub-requirements */}
              {subRequirements && subRequirements.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-medium mb-6">Sub-requirements</h3>
                  
                  {/* Legend */}
                  <div className="flex items-center gap-6 mb-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-[2px] bg-[#78c38e]"></div>
                      <span>This week</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-[2px] bg-[#FF6B8A]"></div>
                      <span>Last week</span>
                    </div>
                  </div>

                  {/* Y-axis labels */}
                  <div className="flex mb-6">
                    <div className="w-12 text-sm text-gray-300">
                      <div>% fulfilled</div>
                      <div className="mt-2">100</div>
                    </div>
                  </div>

                  {/* Bars */}
                  <div className="relative pl-12">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 h-[80%] flex flex-col justify-between text-sm text-gray-300">
                      <span>75</span>
                      <span>50</span>
                      <span>25</span>
                      <span>0</span>
                    </div>

                    {/* Bars container */}
                    <div className="flex gap-16">
                      {subRequirements.map((req, index) => (
                        <SubRequirementsBar key={index} data={req} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Individual Performance */}
            <div>
                <div className="grid grid-cols-[auto_280px] items-center mb-6">
                  <h3 className="text-xl font-medium">Individual performance</h3>
                  <div className="grid grid-cols-[48px_1fr] items-center gap-3 justify-end">
                    <button
                    onClick={() => setShowNonCompliance(!showNonCompliance)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                      showNonCompliance ? 'bg-[#FF6B8A]' : 'bg-[#78c38e]'
                    }`}
                    aria-label={`Toggle ${showNonCompliance ? 'compliance' : 'non-compliance'} rate view`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                        showNonCompliance ? 'transform translate-x-6' : ''
                      }`}
                    />
                    <span className="sr-only">
                      {showNonCompliance ? 'Switch to compliance rate' : 'Switch to non-compliance rate'}
                    </span>
                  </button>
                    <span className="text-lg text-gray-300 whitespace-nowrap">
                      {showNonCompliance ? 'Non-compliance rate' : 'Compliance rate'}
                    </span>
                </div>
              </div>
              <div className="space-y-4">
                {/* Top 2 performers */}
                {sortedConsultants.slice(0, 2).map((consultant, index) => (
                  <div key={index} className="flex items-center gap-4 bg-[#1E1E1E] p-4 rounded">
                    <div className={`w-8 h-8 rounded ${showNonCompliance ? 'bg-[#FF6B8A]' : 'bg-[#78c38e]'} flex items-center justify-center`}>
                      {index + 1}
                    </div>
                    <span className="flex-grow">{consultant.name}</span>
                    <span>{consultant.result}</span>
                  </div>
                ))}

                {/* First ellipsis */}
                <div className="text-center text-2xl text-gray-500">...</div>

                {/* Team average */}
                <div className="flex items-center gap-4 bg-[#1E1E1E] p-4 rounded">
                  <div className="w-8 h-8 rounded bg-[#1E1E1E] flex items-center justify-center text-white">
                    -
                  </div>
                  <span className="flex-grow">{averageResult.name}</span>
                  <span>{averageResult.result}</span>
                </div>

                {/* Second ellipsis */}
                <div className="text-center text-2xl text-gray-500">...</div>

                {/* Bottom 2 performers */}
                {sortedConsultants.slice(-2).map((consultant, index) => (
                  <div key={index} className="flex items-center gap-4 bg-[#1E1E1E] p-4 rounded">
                    <div className={`w-8 h-8 rounded ${showNonCompliance ? 'bg-[#78c38e]' : 'bg-[#FF6B8A]'} flex items-center justify-center`}>
                      {sortedConsultants.length - 1 + index}
                    </div>
                    <span className="flex-grow">{consultant.name}</span>
                    <span>{consultant.result}</span>
                  </div>
                ))}
                {/* View all button */}
                <IndividualPerformanceDialog 
                  consultants={consultants}
                  averageResult={averageResult}
                  showNonCompliance={showNonCompliance}
                  onToggleCompliance={() => setShowNonCompliance(!showNonCompliance)}
                />
              </div>
            </div>
          </>
        ) : (
          // Behavioral Report Layout
          <>
            {/* Left Column - Individual Performance */}
            <div>
              <h3 className="text-xl mb-6 flex items-center gap-2">
                Individual performance
                <span className="text-sm text-gray-400">n={individualPerformanceCount}</span>
              </h3>
              <div className="space-y-4">
                {/* Top 2 performers */}
                {sortedConsultants.slice(0, 2).map((consultant, index) => (
                  <div key={index} className="flex items-center gap-4 bg-[#1E1E1E] p-4 rounded">
                    <div className="w-8 h-8 rounded bg-[#78c38e] flex items-center justify-center">
                      {index + 1}
                    </div>
                    <span className="flex-grow">{consultant.name}</span>
                    <span>{consultant.result}</span>
                  </div>
                ))}

                {/* First ellipsis */}
                <div className="text-center text-2xl text-gray-500">...</div>

                {/* Team average */}
                <div className="flex items-center gap-4 bg-[#1E1E1E] p-4 rounded">
                  <div className="w-8 h-8 rounded bg-[#1E1E1E] flex items-center justify-center text-white">
                    -
                  </div>
                  <span className="flex-grow">{averageResult.name}</span>
                  <span>{averageResult.result}</span>
                </div>

                {/* Second ellipsis */}
                <div className="text-center text-2xl text-gray-500">...</div>

                {/* Bottom 2 performers */}
                {sortedConsultants.slice(-2).map((consultant, index) => (
                  <div key={index} className="flex items-center gap-4 bg-[#1E1E1E] p-4 rounded">
                    <div className="w-8 h-8 rounded bg-[#FF6B8A] flex items-center justify-center">
                      {sortedConsultants.length - 1 + index}
                    </div>
                    <span className="flex-grow">{consultant.name}</span>
                    <span>{consultant.result}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Weekly Insights */}
            <div>
              <h3 className="text-xl mb-6 flex items-center gap-2">
                Weekly insights
                <span className="text-sm text-gray-400">n={weeklyInsights?.verdicts_count}</span>
              </h3>
              <div className="space-y-4">
                {weeklyInsights?.insights.map((insight, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded bg-[#1E1E1E] border-l-4"
                    style={{ borderColor: insight.border_color }}
                  >
                    <div className="text-sm font-medium mb-2">{insight.title}</div>
                    <div className="text-sm text-gray-400">{insight.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
