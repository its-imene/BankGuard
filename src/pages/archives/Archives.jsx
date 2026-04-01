import React from 'react';
import { Package, Download, FileText } from 'lucide-react';

// Ajout de = [] pour éviter l'erreur .length sur un objet undefined
const Archives = ({ archivedData = [] }) => {
  return (
    <div className="p-8 md:p-5 space-y-8 bg-[#f8fafc] min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-[#031124] tracking-tight">Archives</h1>
          <p className="text-slate-500 mt-1 font-medium">Consult and download previously archived regulatory lists.</p>
        </div>
        
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-separate border-spacing-0">
            <thead>
              <tr className="text-slate-400 uppercase text-[11px] font-bold tracking-widest">
                <th className="pb-6 border-b border-slate-50 pr-4">Blacklist ID</th>
                <th className="pb-6 border-b border-slate-50 pr-4">Source</th>
                <th className="pb-6 border-b border-slate-50 pr-4">Archived Date</th>
                <th className="pb-6 border-b border-slate-50 pr-4">Entries</th>
                <th className="pb-6 border-b border-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-50">
              {archivedData.length > 0 ? (
                archivedData.map((doc) => (
                  <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                    {/* ID de la liste : Priorité à version (Blacklist ID) */}
                    <td className="py-6 text-[#031124] font-bold pr-4">
                      {doc.version || doc.blacklistId || "No ID"}
                    </td>

                    {/* Source avec un petit badge style Corporate */}
                    <td className="py-6 pr-4">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[12px] font-bold uppercase tracking-tight">
                        {doc.source || 'Unknown'}
                      </span>
                    </td>

                    {/* Date d'archivage */}
                    <td className="py-6 text-slate-500 font-medium pr-4">
                      {doc.archiveDate || doc.date || "N/A"}
                    </td>

                    {/* Nombre d'entrées */}
                    <td className="py-6 text-slate-600 font-bold pr-4">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-slate-300" />
                        {doc.manualData?.length || doc.entriesCount || 0}
                      </div>
                    </td>

                    {/* Bouton Download stylisé */}
                    <td className="py-6 text-right">
                      <button className="inline-flex items-center gap-2 bg-[#031124] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95">
                        <Download size={14} />
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <Package size={60} strokeWidth={1} />
                      <p className="text-lg font-medium">L'archive est vide.</p>
                      <p className="text-sm">Les listes supprimées apparaîtront ici.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Archives;