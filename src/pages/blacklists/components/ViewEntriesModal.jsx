import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Shield, Save, AlertCircle, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

const ViewEntriesModal = ({ item, onClose, onUpdateBatch }) => {
  // 1. Initialize entries. We now expect each entry to potentially have an 'errors' array
  const [entries, setEntries] = useState(item.manualData || []);
  const [hasChanges, setHasChanges] = useState(false);

  const statuses = ['erroneous', 'valid'];

  const allColumns = [
    "name6", "name1", "name2", "name3", "name4", "name5",
    "title", "nameNonLatin", "nonLatinType", "nonLatinLang",
    "dob", "townOfBirth", "countryOfBirth", "nationality",
    "passportNum", "passportDetails", "nationalId", "nationalIdDetails",
    "addr1", "addr2", "addr3", "addr4", "addr5", "addr6",
    "zipCode", "country", "otherInfo", "groupType", "aliasType",
    "aliasQuality", "regime", "listedOn", "ukSanctionsListDate", "lastUpdated", "groupId"
  ];

  // 2. TOGGLE CELL ERROR: Mark a specific cell in a specific row as wrong
  const toggleCellError = (rowIndex, colName) => {
    const updatedEntries = [...entries];
    const currentEntry = { ...updatedEntries[rowIndex] };

    // Initialize error array for this row if it doesn't exist
    if (!currentEntry.errors) currentEntry.errors = [];

    if (currentEntry.errors.includes(colName)) {
      currentEntry.errors = currentEntry.errors.filter(err => err !== colName);
    } else {
      currentEntry.errors.push(colName);
    }

    updatedEntries[rowIndex] = currentEntry;
    setEntries(updatedEntries);
    setHasChanges(true);
  };

  // 3. GLOBAL Status Change
  const handleBulkStatusChange = (newStatus) => {
    const updated = entries.map(entry => ({ ...entry, status: newStatus }));
    setEntries(updated);
    setHasChanges(true);
  };

  

 // Inside ViewEntriesModal.jsx
const handleFinalSave = () => {
  // We determine the new batch status based on the first entry 
  // (since handleBulkStatusChange updates all of them)
  const newBatchStatus = entries[0]?.status || item.status;

  onUpdateBatch({
    ...item,
    manualData: entries,
    status: newBatchStatus // This updates the status in the main blacklists state
  });
  
  setHasChanges(false);
  onClose(); // Closes the modal so the operator sees the updated table immediately
};
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(entries);
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
                {entries.length} entry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Batch Status:</span>
              <select
                onChange={(e) => handleBulkStatusChange(e.target.value)}
                className="bg-transparent text-xs font-bold uppercase outline-none cursor-pointer text-blue-600"
                defaultValue=""
              >
                <option value="" disabled>Change All...</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {hasChanges && (
              <button onClick={handleFinalSave} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2">
                <Save size={18} /> Save Flags
              </button>
            )}

            <button onClick={handleDownloadExcel} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">
              <Download size={18} /> Export
            </button>

            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
          </div>
        </div>

        {/* Tip Bar */}
        <div className="bg-amber-50 px-8 py-2 border-b border-amber-100 flex items-center gap-2 text-[10px] text-amber-700 font-medium">
          <AlertCircle size={14} />
          <span>OPERATOR MODE: Click any individual cell to mark it as an error.</span>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-hidden p-6 bg-[#F8FAFC]">
          <div className="bg-white border border-slate-200 rounded-4xl h-full flex flex-col shadow-sm overflow-hidden">
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left text-[11px] border-separate border-spacing-0">
                <thead className="sticky top-0 bg-white z-20">
                  <tr className="text-slate-400 uppercase font-bold">
                    <th className="p-4 border-b sticky left-0 bg-white z-30 shadow-[1px_0_0_0_#e2e8f0]">#</th>
                    {allColumns.map(col => (
                      <th key={col} className="p-4 border-b whitespace-nowrap bg-white">
                        {col.replace(/([A-Z])/g, ' $1').toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {entries.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 font-bold text-slate-400 sticky left-0 bg-white group-hover:bg-slate-50 shadow-[1px_0_0_0_#e2e8f0]">{rowIndex + 1}</td>
                      {allColumns.map(col => {
                        const isError = row.errors && row.errors.includes(col);
                        return (
                          <td
                            key={col}
                            onClick={() => toggleCellError(rowIndex, col)}
                            className={`p-4 whitespace-nowrap cursor-pointer transition-all border-r border-transparent hover:border-blue-200 ${isError ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-blue-50/50'
                              }`}
                          >
                            <div className="flex items-center justify-between gap-2 min-w-20">
                              <span className={col === 'name1' ? 'font-bold' : ''}>
                                {row[col] || "—"}
                              </span>
                              {isError && <AlertCircle size={12} className="text-red-500 shrink-0" />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
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