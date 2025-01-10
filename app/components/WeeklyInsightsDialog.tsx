'use client';

import React from 'react';
import { Dialog, DialogContent } from "./ui/dialog";

interface WeeklyInsight {
  title: string;
  content: string | {
    student_trigger: string;
    consultant_response: string;
    recommended_approach: string;
  };
}

interface WeeklyInsightGroup {
  positive: WeeklyInsight[];
  opportunities: WeeklyInsight[];
}

interface WeeklyInsightsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  verboseInsights: WeeklyInsightGroup;
}

export function WeeklyInsightsDialog({ isOpen, onClose, verboseInsights }: WeeklyInsightsDialogProps) {
  const [showPositive, setShowPositive] = React.useState(true);
  
  const insights = showPositive ? verboseInsights.positive : verboseInsights.opportunities;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="text-white border-[#404040] max-h-[85vh] overflow-y-auto bg-[#252525]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-[#404040] rounded-full transition-colors"
          aria-label="Close dialog"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
        </button>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium">Weekly insights</h2>
          <div className="flex items-center gap-4 mr-12">
            <span className={`text-lg ${showPositive ? 'text-[#78c38e]' : 'text-gray-300'}`}>
              Positive
            </span>
            <button
              onClick={() => setShowPositive(!showPositive)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                !showPositive ? 'bg-[#FF6B8A]' : 'bg-[#78c38e]'
              }`}
              aria-label={`Toggle ${!showPositive ? 'positive' : 'opportunities'} view`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                  !showPositive ? 'transform translate-x-6' : ''
                }`}
              />
              <span className="sr-only">
                {!showPositive ? 'Switch to positive' : 'Switch to opportunities'}
              </span>
            </button>
            <span className={`text-lg ${!showPositive ? 'text-[#FF6B8A]' : 'text-gray-300'}`}>
              Opportunities
            </span>
          </div>
        </div>

        <h4 className="text-xl font-medium italic bg-[#404040] w-full px-4 py-2 rounded mb-6">
          Top 3 {showPositive ? 'positive' : 'opportunities'}:
        </h4>

        <div className="grid grid-cols-3 gap-6">
          {insights.map((insight, index) => {
            if (typeof insight.content === 'string') return null;
            
            return (
              <div key={index} className="flex flex-col gap-2">
                <div className="text-lg font-medium">{insight.title}</div>
                <div className="italic font-medium">Student trigger:</div>
                <div className="border border-[#78c38e] rounded-lg px-6 py-3">
                  <div className="text-white font-medium">{insight.content.student_trigger}</div>
                </div>
                <div className="italic font-medium">Consultant response:</div>
                <div className="border border-[#78c38e] rounded-lg px-6 py-3">
                  <div className="text-white font-medium">{insight.content.consultant_response}</div>
                </div>
                <div className="italic font-medium">Recommended approach:</div>
                <div className="border border-[#FF6B8A] rounded-lg px-6 py-3">
                  <div className="text-white font-medium">{insight.content.recommended_approach}</div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
