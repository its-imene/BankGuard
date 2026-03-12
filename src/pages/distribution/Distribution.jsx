import React, { useState } from 'react';
import { Search, Server, Database, Activity } from 'lucide-react';

export default function Distribution({ blacklists = [] }) {
  const [selectedFormat, setSelectedFormat] = useState('XML');
  
  // On ne récupère que les listes avec le statut 'valid'
  const validBlacklists = blacklists.filter(b => b.status === 'valid');

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 pb-2">Distribution</h1>
        <p className="text-slate-500">Distribute formatted blacklists to internal banking systems.</p>
      </div>

      <div className="flex gap-4">
        {/* Panneau Gauche : Manuel Distribution (54% comme ton design) */}
        <div className="w-[54%] bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-hidden p-6">
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 pb-1">Manual Distribution</h2>
              <p className="text-sm text-slate-500">Trigger an immediate update for a specific system.</p>
            </div>

            {/* Target System */}
            <div className="flex flex-col gap-2">
              <label htmlFor="target-select" className="text-sm font-semibold text-black">Target System</label>
              <select id="target-select" className="w-full font-medium border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                <option value="">Select System</option>
                <option value="core">Core Banking System</option>
                <option value="atm">ATM Network</option>
                <option value="swift">SWIFT Gateway</option>
              </select>
            </div>

            {/* Blacklist ID */}
            <div className="flex flex-col gap-2">
              <label htmlFor="id-select" className="text-sm font-semibold text-black">Blacklist ID</label>
              <input 
                id="id-select" 
                type="text" 
                placeholder="Enter or select Blacklist ID" 
                className="w-full font-medium border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
              />
            </div>

            {/* Output Format */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-black">Output Format</label>
              <div className="flex gap-2">
                {['XML', 'Excel', 'HMT'].map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all border ${
                      selectedFormat === format
                        ? 'bg-[#3C6996] text-white border-[#3C6996]'
                        : 'bg-[#F4F4F7] text-[#464E5F] border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button className="mt-4 w-full bg-[#031124] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
              <Activity size={18} /> Distribute Now
            </button>
          </div>
        </div>

        {/* Panneau Droite : Valid Blacklists (Flex-1) */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-hidden">
          <div className="p-6 pb-0">
            <h2 className="text-xl font-bold text-slate-900 pb-4">Valid Blacklists</h2>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search valid Blacklist ID..."
                className="w-full font-medium border border-slate-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <th className="p-4 font-bold pl-6">#</th>
                  <th className="p-4 font-bold">ID</th>
                  <th className="p-4 font-bold">Source</th>
                  <th className="p-4 font-bold">Entries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {validBlacklists.length > 0 ? (
                  validBlacklists.map((row, index) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 text-slate-400 font-medium">{index + 1}</td>
                      <td className="p-4 font-bold text-slate-700">{row.version}</td>
                      <td className="p-4 text-slate-600">{row.source}</td>
                      <td className="p-4 text-slate-600">
                        {row.manualData ? row.manualData.length : row.entries}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-slate-400 italic">
                      No valid blacklists ready for distribution.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}