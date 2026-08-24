export function exportRowsToCsv(rows: Record<string, any>[], columns: Array<{ key: string; label: string }>, filename: string = 'export.csv') {
  if (!rows || rows.length === 0) return;

  const headerRow = columns.map(c => `"${(c.label || c.key).replace(/"/g, '""')}"`).join(',');
  const dataRows = rows.map(r => {
    return columns.map(c => {
      const val = r[c.key];
      if (val === null || val === undefined) return '""';
      const strVal = String(val);
      return `"${strVal.replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = [headerRow, ...dataRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
