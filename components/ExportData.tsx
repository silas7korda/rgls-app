
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { DataRecord } from '../types';

interface ExportDataProps {
  records: DataRecord[];
}

const ExportData: React.FC<ExportDataProps> = ({ records }) => {
  const [format, setFormat] = useState('Excel (.xlsx)');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['Date', 'Store', 'Savings', 'Machine', 'Restock Funds', 'Expenses']);

  const handleExport = () => {
    if (records.length === 0) return;

    // Filter by date if provided
    let dataToExport = [...records];
    if (dateFrom) {
      dataToExport = dataToExport.filter(r => new Date(r.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      dataToExport = dataToExport.filter(r => new Date(r.date) <= new Date(dateTo));
    }

    // Prepare data for export
    const exportData = dataToExport.map(r => {
      const row: any = {};
      if (selectedColumns.includes('Date')) row['Date'] = r.date;
      if (selectedColumns.includes('Store')) row['Store Amount'] = r.store;
      if (selectedColumns.includes('Savings')) row['Savings (20%)'] = r.savings;
      if (selectedColumns.includes('Machine')) row['Machine Revenue'] = r.machine;
      if (selectedColumns.includes('Restock Funds')) row['Restock Funds'] = r.restockFunds;
      if (selectedColumns.includes('Expenses')) row['Expenses'] = r.expenses || 0;
      return row;
    });

    if (format.includes('Excel')) {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
      XLSX.writeFile(workbook, `RLGS_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else if (format.includes('CSV')) {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `RLGS_Records_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format.includes('JSON')) {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `RLGS_Records_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleColumn = (col: string) => {
    setSelectedColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#2e5bff] rounded-t-lg px-4 py-3 flex items-center gap-2">
        <i className="fa-solid fa-download"></i>
        <h3 className="font-semibold">Export Data</h3>
      </div>
      <div className="bg-[#16161a] p-8 rounded-b-lg border border-gray-800 border-t-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-4">Export Format</h4>
              <div className="space-y-3">
                {['CSV (Comma Separated Values)', 'Excel (.xlsx)', 'JSON (For APIs)'].map((fmt) => (
                  <label key={fmt} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="format" 
                      className="text-[#2e5bff]" 
                      checked={format === fmt}
                      onChange={() => setFormat(fmt)}
                    />
                    <span className="text-sm">{fmt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Data Range</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">From Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-[#24242b] border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-[#2e5bff]" 
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">To Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-[#24242b] border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-[#2e5bff]" 
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-4">Include Columns</h4>
              <div className="grid grid-cols-2 gap-3">
                {['Date', 'Store', 'Savings', 'Machine', 'Restock Funds', 'Expenses'].map((col) => (
                  <label key={col} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="text-[#2e5bff]" 
                      checked={selectedColumns.includes(col)}
                      onChange={() => toggleColumn(col)}
                    />
                    <span className="text-sm">{col}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-yellow-100/10 border border-yellow-500/50 p-6 rounded-lg">
              <div className="flex gap-3 text-yellow-500">
                <i className="fa-solid fa-triangle-exclamation mt-1"></i>
                <p className="text-sm">
                  <span className="font-bold">Note:</span> Exporting will generate a file based on your current selection.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-between items-center pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-400 font-medium">{records.length} records available</p>
          <button 
            onClick={handleExport}
            className="bg-emerald-600 px-8 py-3 rounded flex items-center gap-2 hover:bg-emerald-700 transition-colors font-bold"
          >
            <i className="fa-solid fa-file-excel"></i> Export to {format.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
