'use client';

import { useState } from 'react';

interface Graph {
  title: string;
  green: number;
  red?: number;
  upperBound?: number;
  lowerBound?: number;
}

interface TeamBarGraphProps {
  graphs: Graph[];
  type: string;
  greenLabel: string;
  redLabel: string;
  blackLabel: string;
  resultLabel: string;
}

export default function TeamBarGraph({
  graphs,
  type,
  greenLabel,
  redLabel,
  blackLabel,
  resultLabel,
}: TeamBarGraphProps) {
  const [startIndex, setStartIndex] = useState(Math.max(0, graphs.length - 13));
  const hasMoreOlder = startIndex > 0;
  const hasMoreNewer = startIndex < graphs.length - 13;

  const visibleGraphs = graphs.slice(startIndex, startIndex + 13);

  const moveLeft = () => {
    if (hasMoreOlder) {
      setStartIndex(Math.max(0, startIndex - 1));
    }
  };

  const moveRight = () => {
    if (hasMoreNewer) {
      setStartIndex(Math.min(graphs.length - 13, startIndex + 1));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-6 mb-4">
        {/* Red line legend - show for both compliance and behavioral */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-[2px] bg-[#FF6B8A]"></div>
          <span className="text-sm text-gray-300 font-normal">
            {type === "Compliance" ? "Partial compliance" : redLabel}
          </span>
        </div>
        {/* Green line legend */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-[2px] bg-[#78c38e]"></div>
          <span className="text-sm text-gray-300 font-normal">{greenLabel}</span>
        </div>
        {/* Black line legend */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-[2px] bg-[#1E1E1E]"></div>
          <span className="text-sm text-gray-300 font-normal">{blackLabel}</span>
        </div>
        {/* Result label */}
        <div className="flex items-center gap-2 ml-8">
          <span className="text-sm text-gray-300 font-normal">{resultLabel}</span>
        </div>
      </div>

      <div className="relative h-[460px] mt-16">
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

        {/* Bar Graph */}
        <div className="relative h-full ml-8">
          <div className="relative h-full flex gap-2">
            {/* Always render 13 bars */}
            {Array.from({ length: 13 }).map((_, index) => {
              const graphData = visibleGraphs[index];

              return (
                <div
                  key={index}
                  className="relative"
                  style={{
                    width: `calc((100% - ${12 * 8}px) / 13)`, // Fixed width for 13 bars
                  }}
                >
                  {graphData ? (
                    <>
                      <div className="absolute -top-6 w-full text-center text-gray-400 text-xs font-normal">
                        {type === "Compliance"
                          ? `${graphData.green + graphData.red!}%`
                          : `${Math.round((graphData.green / 380) * 100)}%`}
                      </div>
                      <div className="absolute bottom-0 w-full bg-[#1E1E1E] h-full">
                        {/* Green bar */}
                        <div
                          className="absolute bottom-0 w-full bg-[#78c38e]"
                          style={{
                            height: `${
                              type === "behavioural" || type === "behavioral"
                                ? (graphData.green / 380) * 100
                                : graphData.green
                            }%`,
                          }}
                        ></div>
                        {type === "Compliance" ? (
                          /* Partial compliance bar for Compliance type */
                          <div
                            className="absolute w-full bg-[#FF6B8A]"
                            style={{
                              bottom: `${graphData.green}%`,
                              height: `${graphData.red}%`,
                            }}
                          ></div>
                        ) : (
                          /* Upper and Lower bound lines for Behavioral type */
                          <>
                            <div
                              className="absolute w-full h-[2px] bg-[#FF6B8A]"
                              style={{
                                bottom: `${(graphData.lowerBound / 380) * 100}%`,
                              }}
                            ></div>
                            <div
                              className="absolute w-full h-[2px] bg-[#FF6B8A]"
                              style={{
                                bottom: `${(graphData.upperBound / 380) * 100}%`,
                              }}
                            ></div>
                          </>
                        )}
                      </div>
                      {/* X-axis label */}
                      <div className="absolute -bottom-14 text-xs text-gray-400 font-normal text-center w-full leading-tight">
                        {graphData.title}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Black rectangle for missing graphs */}
                      <div className="absolute bottom-0 w-full bg-[#1E1E1E] h-full"></div>
                      {/* Empty space for missing label */}
                      <div className="absolute -bottom-14 text-xs text-gray-400 font-normal text-center w-full leading-tight">
                        &nbsp;
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        {graphs.length > 13 && (
          <div className="absolute left-1/2 transform -translate-x-1/2" style={{ top: 'calc(100% + 80px)' }}>
            <div className="flex gap-4">
              <button
                onClick={moveLeft}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                  hasMoreOlder
                    ? 'bg-[#FF6B8A] hover:bg-[#ff8da6]'
                    : 'bg-[#4A4A4A] cursor-not-allowed'
                }`}
                disabled={!hasMoreOlder}
              >
                <span className="text-white text-xl">←</span>
              </button>
              <button
                onClick={moveRight}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                  hasMoreNewer
                    ? 'bg-[#FF6B8A] hover:bg-[#ff8da6]'
                    : 'bg-[#4A4A4A] cursor-not-allowed'
                }`}
                disabled={!hasMoreNewer}
              >
                <span className="text-white text-xl">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
