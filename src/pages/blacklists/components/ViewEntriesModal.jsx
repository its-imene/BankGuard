import React from 'react';
import { X, Download, FileSpreadsheet, Shield } from 'lucide-react';
import * as XLSX from 'xlsx';

const ViewEntriesModal = ({ item, onClose }) => {
  const data = item.manualData || [];

  // Define all column headers exactly as they appear in your data objects
  const allColumns = [
    "name6", "name1", "name2", "name3", "name4", "name5",
    "title", "nameNonLatin", "nonLatinType", "nonLatinLang",
    "dob", "townOfBirth", "countryOfBirth", "nationality",
    "passportNum", "passportDetails", "nationalId", "nationalIdDetails",
    "addr1", "addr2", "addr3", "addr4", "addr5", "addr6",
    "zipCode", "country", "otherInfo", "groupType", "aliasType",
    "aliasQuality", "regime", "listedOn", "ukSanctionsListDate", "lastUpdated", "groupId"
  ];

  // Helper to format header keys for display (e.g., "passportNum" -> "Passport Num")
  const formatHeader = (key) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  };

  const handleDownloadExcel = () => {
    // This will export all keys present in the manualData objects
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Full Blacklist Data");
    XLSX.writeFile(workbook, `${item.source}_Full_Export.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-[98vw] h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl">
              <Shield className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#031124]">{item.source}</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Batch View • {item.version} • {data.length} Total Entries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
            >
              <Download size={18} /> Export Full Excel
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Dynamic Table Body */}
        <div className="flex-1 overflow-hidden p-6 bg-[#F8FAFC]">
          <div className="bg-white border border-slate-200 rounded-4xl h-full flex flex-col shadow-sm overflow-hidden">
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left text-[11px] border-separate border-spacing-0">
                <thead className="sticky top-0 bg-white z-20">
                  <tr className="text-slate-400 uppercase font-bold">
                    <th className="p-4 border-b sticky left-0 bg-white z-30 shadow-[1px_0_0_0_#e2e8f0]">#</th>
                    {allColumns.map(col => (
                      <th key={col} className="p-4 border-b whitespace-nowrap min-w-35 bg-white">
                        {formatHeader(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.length > 0 ? data.map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-4 font-bold text-slate-400 sticky left-0 bg-white group-hover:bg-blue-50/30 shadow-[1px_0_0_0_#e2e8f0]">
                        {i + 1}
                      </td>
                      {allColumns.map(col => (
                        <td key={col} className={`p-4 whitespace-nowrap ${
                          col === 'name1' ? 'font-bold text-[#031124]' : 
                          col === 'groupId' ? 'font-mono text-blue-600 font-bold' : 'text-slate-600'
                        }`}>
                          {row[col] || <span className="text-slate-200">—</span>}
                        </td>
                      ))}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={allColumns.length + 1} className="p-32 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-300">
                          <FileSpreadsheet size={64} strokeWidth={1} />
                          <p className="text-lg font-medium">No records found in this batch</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEntriesModal;