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

function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const flattened: Record<string, string> = {};

  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const nested = flattenObject(obj[key], `${prefix}${key};`);
      Object.assign(flattened, nested);
    } else {
      flattened[`${prefix}${key}`] = obj[key];
    }
  }

  return flattened;
}

export function convertJsonToCsv(jsonData: JsonReport): string {
  let csvContent = '';
  
  // Handle metadata
  if (jsonData.metadata) {
    Object.entries(jsonData.metadata).forEach(([key, value]) => {
      csvContent += `    ${key}; ${value}\n`;
    });
    csvContent += '  ;\n';
  }

  // Handle statistics
  const consultantName = jsonData.metadata?.consultantName;
  if (consultantName && jsonData[consultantName]) {
    Object.entries(jsonData[consultantName]).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        csvContent += `        ${key}; \n`;
        Object.entries(value).forEach(([subKey, subValue]) => {
          csvContent += `            ${subKey};${subValue}\n`;
        });
        csvContent += '        ;\n';
      } else {
        csvContent += `        ${key};${value}\n`;
      }
    });
    csvContent += ';\n;\n';
  }

  // Handle conversation analysis
  if (jsonData.conversationAnalysis?.condensed?.conversations) {
    jsonData.conversationAnalysis.condensed.conversations.forEach((conv: any) => {
      csvContent += '          ';
      Object.entries(conv).forEach(([key, value]) => {
        csvContent += `${key};${value}\n          `;
      });
      csvContent += ';\n';
    });
  }

  // Handle verbose conversations
  if (jsonData.conversationAnalysis?.verbose?.conversations) {
    csvContent += '    verbose; \n      conversations;\n        ;\n';
    jsonData.conversationAnalysis.verbose.conversations.forEach((conv: any) => {
      csvContent += '          ';
      Object.entries(conv).forEach(([key, value]) => {
        csvContent += `${key}; ${value}\n          `;
      });
      csvContent += ';\n';
    });
    csvContent += '    ;\n  ;\n';
  }

  return csvContent;
}
