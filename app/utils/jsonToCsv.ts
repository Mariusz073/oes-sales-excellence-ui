interface Metadata {
  consultantName: string;
  reportType: string;
  weekNumber: number;
  dateRange: string;
}

interface JsonReport {
  metadata: Metadata;
  conversationAnalysis?: {
    condensed?: {
      conversations?: any[];
    };
    verbose?: {
      conversations?: any[];
    };
  };
  [key: string]: any;
}

function formatValue(value: any): string {
  if (value === undefined || value === null) return '';
  return String(value).replace(/\n/g, ' ');
}

export function convertJsonToCsv(jsonData: string | JsonReport): string {
  // If input is a string, parse it to handle duplicate keys
  const rawData = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData);
  
  // Parse the JSON manually to preserve both objects with the same key
  const parsedObjects: any[] = [];
  let currentObject: any = {};
  let currentKey = '';
  let depth = 0;
  let inString = false;
  let escaped = false;
  let buffer = '';

  for (let i = 0; i < rawData.length; i++) {
    const char = rawData[i];

    if (!inString) {
      if (char === '{') {
        depth++;
        if (depth === 1) {
          currentObject = {};
        }
      } else if (char === '}') {
        depth--;
        if (depth === 0 && currentKey) {
          currentObject[currentKey] = JSON.parse(buffer);
          parsedObjects.push({ [currentKey]: currentObject[currentKey] });
          buffer = '';
          currentKey = '';
        }
      } else if (char === '"') {
        inString = true;
      }
    } else {
      if (char === '"' && !escaped) {
        inString = false;
        if (depth === 1 && !currentKey) {
          currentKey = buffer;
          buffer = '';
        }
      } else if (char === '\\' && !escaped) {
        escaped = true;
      } else {
        escaped = false;
        if (depth === 1) {
          buffer += char;
        }
      }
    }
  }

  // Now process the objects in order
  let csvContent = '';
  let metadata: any = null;
  let statsData: any = null;
  let rankingData: any = null;
  let conversationAnalysis: any = null;

  parsedObjects.forEach(obj => {
    const key = Object.keys(obj)[0];
    const value = obj[key];

    if (key === 'metadata') {
      metadata = value;
    } else if (key === 'conversationAnalysis') {
      conversationAnalysis = value;
    } else if (value && typeof value === 'object') {
      if ('total_number_of_calls' in value) {
        statsData = value;
      } else if ('average_finalRanking_score_eligible_transcripts' in value) {
        rankingData = value;
      }
    }
  });

  // Handle metadata
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      csvContent += `    ${key}; ${formatValue(value)}\n`;
    });
    csvContent += '  ;\n';
  }

  // Handle statistics
  if (statsData) {
    const statsOrder = [
      ['total_number_of_calls'],
      ['team_average_total_number_of_calls_per_sales_consultant'],
      ['number_of_calls_over_2_minutes', ['absolute_number', 'team_average_absolute_number']],
      ['percent_of_calls_over_2_minutes', ['percentage', 'team_average_percentage']],
      ['number_of_calls_under_2_minutes', ['absolute_number', 'team_average_absolute_number']],
      ['percent_of_calls_under_2_minutes', ['percentage', 'team_average_percentage']],
      ['average_talking_percentage', ['individual_average', 'team_average']],
      ['excluded_transcripts', ['individual_excluded_transcripts', 'team_total_excluded_transcripts']]
    ];

    statsOrder.forEach(([key, subKeys]) => {
      const value = statsData[key as string];
      if (value !== undefined) {
        if (Array.isArray(subKeys) && typeof value === 'object') {
          csvContent += `        ${key}; \n`;
          subKeys.forEach(subKey => {
            if (value[subKey] !== undefined) {
              csvContent += `            ${subKey};${formatValue(value[subKey])}\n`;
            }
          });
          csvContent += '        ;\n';
        } else {
          csvContent += `        ${key};${formatValue(value)}\n`;
        }
      }
    });
    csvContent += ';\n;\n';
  }

  // Handle ranking data
  if (rankingData && metadata?.consultantName) {
    csvContent += `  ${metadata.consultantName}; \n`;
    const rankingStats = [
      'average_finalRanking_score_eligible_transcripts',
      'average_finalRanking_score_all_transcripts_over_2_mins',
      'team_average_finalRanking_score_eligible_transcripts',
      'team_average_finalRanking_score_all_transcripts_over_2_mins'
    ];

    rankingStats.forEach(statKey => {
      const value = rankingData[statKey];
      if (value !== undefined) {
        csvContent += `        ${statKey};${formatValue(value)}\n`;
      }
    });
    csvContent += '    ;\n';
  }

  // Handle condensed conversations
  if (conversationAnalysis?.condensed?.conversations) {
    conversationAnalysis.condensed.conversations.forEach((conv: any) => {
      Object.entries(conv).forEach(([key, value]) => {
        csvContent += `          ${key}; ${formatValue(value)}\n`;
      });
      csvContent += '        ;\n';
    });
  }

  // Handle verbose conversations
  if (conversationAnalysis?.verbose?.conversations) {
    csvContent += '    verbose; \n      conversations;\n        ;\n';
    conversationAnalysis.verbose.conversations.forEach((conv: any) => {
      Object.entries(conv).forEach(([key, value]) => {
        csvContent += `          ${key}; ${formatValue(value)}\n`;
      });
      csvContent += '        ;\n';
    });
    csvContent += '    ;\n  ;\n';
  }

  return csvContent;
}
