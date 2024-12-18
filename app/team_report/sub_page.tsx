interface WeeklyInitiativeProps {
  title: string;
  fullCompliance: {
    percentage: number;
    change: number;
  };
  partialCompliance: {
    percentage: number;
    change: number;
  };
  subRequirements: Array<{
    title: string;
    current: number;
    lastWeek: number;
  }>;
  consultants: Array<{
    name: string;
    compliant: number;
    totalOutbound: number;
    ratio: number;
  }>;
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

const SubRequirementsBar = ({ data }: { data: { current: number; lastWeek: number; title: string } }) => (
  <div className="relative w-28">
    {/* Values */}
    <div className="absolute -top-16 left-7 text-sm whitespace-nowrap"
      style={{left: '103px'}}>
      <span className="text-[#4CAF50]">{Math.round(data.current)}% : </span>
      <span className="text-[#FF6B8A]">{Math.round(data.lastWeek)}%</span>
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
        className="absolute bottom-0 left-0 right-0 bg-[#4CAF50]"
        style={{ 
          height: `${(data.current / 100) * 180}px`,
          marginBottom: '0px',
          transition: 'height 0.3s ease'
        }}
      />

      {/* Last week line */}
      <div 
        className="absolute left-0 right-0 h-0.5 bg-[#FF6B8A] z-10"
        style={{ 
          bottom: `${(data.lastWeek / 100) * 180}px`,
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

export const WeeklyInitiative = ({ title, fullCompliance, partialCompliance, subRequirements, consultants }: WeeklyInitiativeProps) => {
  // Extract title and highlight the text between <em> tags in red
  const titleParts = title.split(/<em>|<\/em>/);
  const formattedTitle = titleParts.map((part: string, index: number) => 
    index % 2 === 1 ? <span key={index} className="text-[#FF6B8A]">{part}</span> : part
  );

  return (
    <div className="mt-8 bg-[#252525] rounded-lg p-10">
      {/* Title */}
      <h2 className="text-2xl mb-10 font-semibold border-b border-gray-600 pb-4">{formattedTitle}</h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div>
          {/* Compliance Verdict */}
          <h3 className="text-xl mb-6">Compliance verdict</h3>
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="text-[#FF6B8A] text-xl mb-2">Full compliance</div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2" stroke="#4CAF50" strokeWidth="2"/>
                    <path d="M12 8L12 16M12 8L16 12M12 8L8 12" stroke="#4CAF50" strokeWidth="2"/>
                  </svg>
                  <span className="text-[#4CAF50]">+{fullCompliance.change}%</span>
                  <span className="text-gray-400">Since last week</span>
                </div>
              </div>
              <CircularProgress 
                percentage={fullCompliance.percentage}
                color="#4CAF50"
              />
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="text-[#FFA500] text-xl mb-2">Partial compliance</div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2" stroke="#FFA500" strokeWidth="2"/>
                    <path d="M12 16L12 8M12 16L16 12M12 16L8 12" stroke="#FFA500" strokeWidth="2"/>
                  </svg>
                  <span className="text-[#FFA500]">{partialCompliance.change}%</span>
                  <span className="text-gray-400">Since last week</span>
                </div>
              </div>
              <CircularProgress 
                percentage={partialCompliance.percentage}
                color="#FF6B8A"
              />
            </div>
          </div>

          {/* Sub-requirements */}
          <div className="mt-12">
            <h3 className="text-xl mb-6">Sub-requirements</h3>
            
            {/* Legend */}
            <div className="flex items-center gap-6 mb-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-[2px] bg-[#4CAF50]"></div>
                <span>This week</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-[2px] bg-[#FF6B8A]"></div>
                <span>Last week</span>
              </div>
            </div>

            {/* Y-axis labels */}
            <div className="flex mb-6">
              <div className="w-12 text-sm text-gray-400">
                <div>% fulfilled</div>
                <div className="mt-2">100</div>
              </div>
            </div>

            {/* Bars */}
            <div className="relative pl-12">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-[80%] flex flex-col justify-between text-sm text-gray-400">
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
        </div>

        {/* Right Column - Individual Performance */}
        <div>
          <h3 className="text-xl mb-6">Individual performance</h3>
          <div className="space-y-4">
            {/* Top 2 performers */}
            {consultants.slice(0, 2).map((consultant, index) => (
              <div key={index} className="flex items-center gap-4 bg-[#1E1E1E] p-4 rounded">
                <div className="w-8 h-8 rounded bg-[#4CAF50] flex items-center justify-center">
                  {index + 1}
                </div>
                <span className="flex-grow">{consultant.name}</span>
                <span>{consultant.compliant}/{consultant.totalOutbound} ({Math.round(consultant.ratio * 100)}%)</span>
              </div>
            ))}

            {/* Ellipsis */}
            <div className="text-center text-2xl text-gray-500">...</div>

            {/* Bottom 2 performers */}
            {consultants.slice(-2).map((consultant, index) => (
              <div key={index} className="flex items-center gap-4 bg-[#1E1E1E] p-4 rounded">
                <div className="w-8 h-8 rounded bg-[#FF6B8A] flex items-center justify-center">
                  {consultants.length - 1 + index}
                </div>
                <span className="flex-grow">{consultant.name}</span>
                <span>{consultant.compliant}/{consultant.totalOutbound} ({Math.round(consultant.ratio * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
