// ============================================
// 📁 FILE: src/nlFormatter.js
// ============================================
export function formatResult(question, results, sql) {
  if (!results || results.length === 0) {
    return {
      answer: "No data found for your query.",
      summary: null,
      data: []
    };
  }

  const questionLower = question.toLowerCase();
  const columns = Object.keys(results[0]);
  const isSingleValue = results.length === 1 && columns.length === 1;
  const isCountQuery = columns.some(c => 
    c.toLowerCase().includes('count') || 
    c.toLowerCase().includes('total')
  );

  // Generate natural language answer
  let answer = '';

  if (isSingleValue) {
    const value = Object.values(results[0])[0];
    const formattedValue = formatValue(value, columns[0]);
    
    if (questionLower.includes('stock') || questionLower.includes('quantity')) {
      answer = `The available stock is ${formattedValue} units.`;
    } else if (questionLower.includes('value') || questionLower.includes('valuation')) {
      answer = `The total valuation is ${formattedValue}.`;
    } else if (questionLower.includes('count') || questionLower.includes('how many')) {
      answer = `The count is ${formattedValue}.`;
    } else {
      answer = `The result is ${formattedValue}.`;
    }
  } else if (isCountQuery && results.length === 1) {
    const countCol = columns.find(c => 
      c.toLowerCase().includes('count') || 
      c.toLowerCase().includes('total')
    );
    answer = `Found ${results[0][countCol]} items.`;
  } else {
    // Multiple rows - create summary
    answer = `Found ${results.length} result${results.length > 1 ? 's' : ''}:`;
  }

  // Build summary for multi-row results
  let summary = null;
  if (results.length > 1 && results.length <= 10) {
    summary = results.map((row, i) => {
      const parts = columns.map(col => `${formatColumnName(col)}: ${formatValue(row[col], col)}`);
      return `${i + 1}. ${parts.join(', ')}`;
    }).join('\n');
  } else if (results.length > 10) {
    summary = `Showing first 10 of ${results.length} results:\n` +
      results.slice(0, 10).map((row, i) => {
        const parts = columns.map(col => `${formatColumnName(col)}: ${formatValue(row[col], col)}`);
        return `${i + 1}. ${parts.join(', ')}`;
      }).join('\n');
  }

  return {
    answer,
    summary,
    data: results,
    rowCount: results.length
  };
}

function formatValue(value, columnName) {
  if (value === null || value === undefined) return 'N/A';
  
  const colLower = columnName.toLowerCase();
  
  // Format currency
  if (colLower.includes('value') || colLower.includes('cost') || colLower.includes('price')) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
  
  // Format quantities
  if (colLower.includes('qty') || colLower.includes('quantity') || colLower.includes('stock')) {
    return new Intl.NumberFormat('en-US').format(value);
  }
  
  // Format dates
  if (value instanceof Date) {
    return value.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  return String(value);
}

function formatColumnName(col) {
  return col
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
