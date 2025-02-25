"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { getCollaborativePercentageScore } from "../lib/utils";

interface Consultant {
  name: string;
  result?: string;
  percentage_high_need?: string;
  high_need_score?: string;
  all_score?: string;
}

interface BehavioralPerformanceDialogProps {
  consultants: Consultant[];
  averageResult: {
    name: string;
    result: string;
    high_need_score?: string;
    all_score?: string;
  };
  showNonCompliance: boolean;
  onToggleCompliance: () => void;
}

export const BehavioralPerformanceDialog = ({
  consultants,
  averageResult,
  showNonCompliance,
  onToggleCompliance,
}: BehavioralPerformanceDialogProps) => {
  const sortedConsultantsByHighNeedScore = React.useMemo(() => {
    const filtered = consultants.filter((consultant) => {
      return (
        consultant.high_need_score !== undefined &&
        consultant.high_need_score !== "0.0"
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      const scoreA = parseFloat(a.high_need_score || "0");
      const scoreB = parseFloat(b.high_need_score || "0");
      return scoreB - scoreA; // Sort in descending order
    });
    return showNonCompliance ? sorted.reverse() : sorted;
  }, [consultants, showNonCompliance]);

  const getTeamAverageIndex = () => {
    const avgScore = parseFloat(averageResult.high_need_score || "0");
    if (showNonCompliance) {
      return sortedConsultantsByHighNeedScore.findIndex((consultant) => {
        const consultantScore = parseFloat(consultant.high_need_score || "0");
        return consultantScore > avgScore;
      });
    } else {
      return sortedConsultantsByHighNeedScore.findIndex((consultant) => {
        const consultantScore = parseFloat(consultant.high_need_score || "0");
        return consultantScore <= avgScore;
      });
    }
  };

  const teamAverageIndex = getTeamAverageIndex();

  const getSquareColor = (
    index: number,
    total: number,
    isAboveAverage: boolean
  ) => {
    const baseColor = isAboveAverage
      ? showNonCompliance
        ? "#FF6B8A"
        : "#78c38e"
      : showNonCompliance
      ? "#78c38e"
      : "#FF6B8A";

    const relativePosition = isAboveAverage
      ? index / teamAverageIndex
      : (index - teamAverageIndex) / (total - teamAverageIndex);

    const opacity =
      0.4 + 0.6 * (isAboveAverage ? 1 - relativePosition : relativePosition);

    return (
      baseColor +
      Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")
    );
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <div className="flex justify-center mt-4">
          <button
            className="px-4 py-2 bg-[#FF6B8A] text-white font-medium rounded hover:bg-[#ff8ba4] transition-colors"
            aria-label="View all individual performance data"
          >
            View all
          </button>
        </div>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#252525] text-white p-8 rounded-lg w-[1200px] max-h-[80vh] overflow-y-auto z-50 font-medium">
          <div className="grid grid-cols-[auto_280px] items-center mb-6">
            <Dialog.Title className="text-xl font-medium">
              Individual performance
            </Dialog.Title>
            <div className="grid grid-cols-[48px_1fr] items-center gap-3 justify-end">
              <button
                onClick={onToggleCompliance}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                  showNonCompliance ? "bg-[#FF6B8A]" : "bg-[#78c38e]"
                }`}
                aria-label={`Toggle ${
                  showNonCompliance ? "compliance" : "non-compliance"
                } rate view`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                    showNonCompliance ? "transform translate-x-6" : ""
                  }`}
                />
              </button>
              <span className="text-lg text-gray-300 whitespace-nowrap">
                Behavioural alignment
              </span>
            </div>
          </div>

          {/* Header row */}
          <div className="grid grid-cols-[60px_300px_200px_200px_200px] gap-4 mb-4 px-4">
            <div>Rank</div>
            <div>Name</div>
            <div className="text-right">
              <div>Collaborative-planning score</div>
              <div className="text-sm text-gray-400">
                (high-need calls only)
              </div>
            </div>
            <div className="text-right">
              <div>Collaborative-planning score</div>
              <div className="text-sm text-gray-400">(All calls)</div>
            </div>
            <div className="text-right">% of high-need calls</div>
          </div>

          <div className="space-y-4">
            {/* Consultants above average */}
            {sortedConsultantsByHighNeedScore
              .slice(0, teamAverageIndex)
              .map((consultant, index) => (
                <div
                  key={consultant.name}
                  className="grid grid-cols-[60px_300px_200px_200px_200px] items-center gap-4 bg-[#1E1E1E] p-4 rounded"
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{
                      backgroundColor: getSquareColor(
                        index,
                        sortedConsultantsByHighNeedScore.length,
                        true
                      ),
                    }}
                  >
                    {index + 1}
                  </div>
                  <span>{consultant.name}</span>
                  <span className="text-right">
                    {getCollaborativePercentageScore(
                      consultant.high_need_score
                    )}
                  </span>
                  <span className="text-right">
                    {getCollaborativePercentageScore(consultant.all_score)}
                  </span>
                  <span className="text-right">
                    {consultant.percentage_high_need}
                  </span>
                </div>
              ))}

            {/* Team average */}
            <div className="grid grid-cols-[60px_300px_200px_200px_200px] items-center gap-4 bg-[#1E1E1E] p-4 rounded">
              <div className="w-8 h-8 rounded bg-[#1E1E1E] flex items-center justify-center text-white">
                -
              </div>
              <span>{averageResult.name}</span>
              <span className="text-right">
                {getCollaborativePercentageScore(averageResult.high_need_score)}
              </span>
              <span className="text-right">
                {getCollaborativePercentageScore(averageResult.all_score)}
              </span>
              <span className="text-right">{averageResult.result}</span>
            </div>

            {/* Consultants below average */}
            {sortedConsultantsByHighNeedScore
              .slice(teamAverageIndex)
              .map((consultant, index) => (
                <div
                  key={consultant.name}
                  className="grid grid-cols-[60px_300px_200px_200px_200px] items-center gap-4 bg-[#1E1E1E] p-4 rounded"
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{
                      backgroundColor: getSquareColor(
                        index + teamAverageIndex,
                        sortedConsultantsByHighNeedScore.length,
                        false
                      ),
                    }}
                  >
                    {index + teamAverageIndex + 1}
                  </div>
                  <span>{consultant.name}</span>
                  <span className="text-right">
                    {getCollaborativePercentageScore(
                      consultant.high_need_score
                    )}
                  </span>
                  <span className="text-right">
                    {getCollaborativePercentageScore(consultant.all_score)}
                  </span>
                  <span className="text-right">
                    {consultant.percentage_high_need}
                  </span>
                </div>
              ))}
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              aria-label="Close dialog"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
