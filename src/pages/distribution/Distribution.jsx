import React, { useState, useEffect } from 'react';
import { 
  Search, Server, Database, Activity, 
  Plus, CheckCircle2, XCircle, Clock, 
  ExternalLink, Settings, History, Shield, 
  ChevronRight, RefreshCw, AlertCircle, FileJson, FileCode, FileSpreadsheet
} from 'lucide-react';
import webhookService from '../../services/webhookService';
import { toast } from 'react-hot-toast';
import AddDestinationModal from './components/AddDestinationModal';

/* ─── reusable card components ─── */
const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2.5 rounded-xl bg-${color}-50 text-${color}-600`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="flex flex-col">
      <span className="text-slate-500 text-sm font-medium">{title}</span>
      <span className="text-2xl font-bold text-slate-900 mt-1">{value}</span>
    </div>
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
      active 
        ? 'border-orange-500 text-orange-600 bg-orange-50/30' 
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

export default function Distribution({ blacklists = [] }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [targets, setTargets] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);

  // Manual Trigger states
  const [manualBatchId, setManualBatchId] = useState('');
  const [manualTargetId, setManualTargetId] = useState('');

  const validBlacklists = blacklists.filter(b => b.status === 'VALID' || b.status === 'valid');

  const selectedTarget = targets.find(t => t.id === manualTargetId);
  const selectedBatch = validBlacklists.find(b => b.id === manualBatchId);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [targetsRes, deliveriesRes] = await Promise.all([
        webhookService.getTargets(),
        webhookService.getDeliveries()
      ]);
      setTargets(targetsRes.data || []);
      setDeliveries(deliveriesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch distribution data', err);
      // toast.error('Connection to integration service failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTarget = async (data) => {
    try {
      if (editingTarget) {
        await webhookService.updateTarget(editingTarget.id, data);
        toast.success(`${data.name} updated successfully.`);
      } else {
        await webhookService.createTarget(data);
        toast.success(`${data.name} distribution target created.`);
      }
      setIsModalOpen(false);
      setEditingTarget(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save the destination system.');
    }
  };

  const handleManualDistribute = async () => {
    if (!manualBatchId || !manualTargetId) {
      toast.error('Please select both a batch and a target system.');
      return;
    }
    
    setIsManualLoading(true);
    try {
      await webhookService.testDelivery(manualBatchId, manualTargetId);
      toast.success('Distribution task executed. Check logs for confirmation.');
      setActiveTab('logs');
    } catch (err) {
      toast.error('Distribution failed. Destination system might be offline.');
    } finally {
      setIsManualLoading(false);
    }
  };

  const getFormatIcon = (format) => {
    switch (format?.toUpperCase()) {
      case 'JSON': return <FileJson size={14} />;
      case 'XML': return <FileCode size={14} />;
      case 'EXCEL': 
      case 'HMT': return <FileSpreadsheet size={14} />;
      default: return <Database size={14} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Premium Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Shield size={16} />
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF7A00]">Advanced Distribution Center</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">Integration Hub</h1>
            <p className="text-slate-500 mt-1 max-w-2xl font-medium">
              Manually distribute validated blacklists to external banking systems in JSON, XML, or HMT formats.
            </p>
          </div>
          <div className="flex gap-3">
             <button onClick={fetchData} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
               <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
             </button>
             <button 
              onClick={() => { setEditingTarget(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all"
             >
               <Plus size={18} /> Add New Destination
             </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-8">
        <div className="flex max-w-7xl mx-auto">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Activity} label="Manual Distribution" />
          <TabButton active={activeTab === 'targets'} onClick={() => setActiveTab('targets')} icon={Server} label="System Management" />
          <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={History} label="Transmission History" />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats Section */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Dispatched" value={deliveries.length} icon={Database} color="blue" trend={12} />
                <StatCard title="Configured Systems" value={targets.length} icon={Server} color="orange" trend={0} />
                <StatCard title="Success Rate" value={`${deliveries.length > 0 ? Math.round((deliveries.filter(d => d.status === 'SUCCESS').length / deliveries.length) * 100) : 100}%`} icon={CheckCircle2} color="emerald" trend={2} />
                <StatCard title="Average Latency" value="1.2s" icon={Clock} color="indigo" trend={-5} />
              </div>

              {/* Manual Distribution Panel */}
              <div className="lg:col-span-1 flex flex-col gap-8">
                <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col gap-6">
                    <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2 whitespace-nowrap">On-Demand Dispatch</h2>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Select a validated batch and a target destination to trigger a secure distribution task.</p>
                    </div>

                    <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Select Destination</label>
                        <select 
                        value={manualTargetId}
                        onChange={(e) => setManualTargetId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                        >
                        <option value="">Choose external system...</option>
                        {targets.map(t => (
                            <option key={t.id} value={t.id}>{t.name} (Format: {t.format})</option>
                        ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Select Blacklist</label>
                        <select 
                        value={manualBatchId}
                        onChange={(e) => setManualBatchId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                        >
                        <option value="">Choose validated batch...</option>
                        {validBlacklists.map(b => (
                            <option key={b.id} value={b.id}>{b.source} - v{b.version || '1.0'} ({b.entriesCount || b.entries} entries)</option>
                        ))}
                        </select>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3">
                        <AlertCircle className="text-orange-600 shrink-0" size={18} />
                        <p className="text-[11px] text-orange-900 leading-relaxed font-bold">
                        Manual distribution generates data in the system's preferred format. All files are signed with <span className="font-extrabold text-orange-600">HMAC-SHA256</span> for security.
                        </p>
                    </div>

                    <button 
                        disabled={isManualLoading || !manualBatchId || !manualTargetId}
                        onClick={handleManualDistribute}
                        className="w-full bg-[#FF7A00] disabled:bg-slate-200 disabled:shadow-none text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
                    >
                        {isManualLoading ? <RefreshCw className="animate-spin" size={18} /> : <ExternalLink size={18} />}
                        Confirm & Dispatch
                    </button>
                    </div>
                </div>

                {/* Connection Status Peek */}
                {selectedTarget && (
                    <div className="bg-[#031124] text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Shield size={60} />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-4">Target Details</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-white/10 pb-3">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">System</span>
                                    <span className="text-sm font-black">{selectedTarget.name}</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-white/10 pb-3">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">File Format</span>
                                    <span className="text-sm font-black flex items-center gap-2 text-emerald-400">
                                        {getFormatIcon(selectedTarget.format)}
                                        {selectedTarget.format}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Security</span>
                                    <span className="text-[10px] font-mono text-orange-400">SHA256-SIGNED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
              </div>

              {/* Ready for Distribution Table */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                   <h2 className="text-xl font-bold text-slate-900">Valid Blacklists</h2>
                   <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input type="text" placeholder="Filter batches..." className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-semibold" />
                   </div>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                        <th className="px-8 py-4">Source & ID</th>
                        <th className="px-8 py-4 text-center">Data Points</th>
                        <th className="px-8 py-4 text-center">Quality Score</th>
                        <th className="px-8 py-4 text-right pr-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {validBlacklists.map(batch => (
                        <tr key={batch.id} className={`group hover:bg-slate-50/50 transition-colors ${manualBatchId === batch.id ? 'bg-orange-50/30' : ''}`}>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-base">{batch.source}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">UUID: {batch.id.substring(0, 8)}... • v{batch.version || '1.0'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-widest">
                               {batch.entriesCount || batch.entries || 0} ENTRIES
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex items-center justify-center gap-1">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                ))}
                            </div>
                            <span className="text-[10px] text-emerald-600 font-bold uppercase mt-1">High</span>
                          </td>
                          <td className="px-8 py-5 text-right pr-12">
                             <button 
                                onClick={() => setManualBatchId(batch.id)}
                                className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${manualBatchId === batch.id ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'}`}
                             >
                               {manualBatchId === batch.id ? 'Selected' : 'Select Batch'}
                             </button>
                          </td>
                        </tr>
                      ))}
                      {validBlacklists.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-20">
                             <div className="flex flex-col items-center gap-4 text-slate-300">
                               <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                 <AlertCircle size={40} strokeWidth={1} />
                               </div>
                               <span className="text-sm font-bold uppercase tracking-widest">No valid data found</span>
                               <p className="text-xs text-slate-400 font-medium max-w-[200px]">Mark a blacklist as 'VALID' in the main list to enable distribution.</p>
                             </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'targets' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {targets.map(target => (
                  <div key={target.id} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:border-orange-200 transition-all relative overflow-hidden group">
                     {/* subtle glow */}
                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all" />
                     
                     <div className="flex items-start justify-between mb-6">
                        <div className={`p-4 rounded-2xl ${target.isActive ? 'bg-orange-100 text-orange-600 shadow-lg shadow-orange-500/10' : 'bg-slate-100 text-slate-400'}`}>
                           <Server size={24} />
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${target.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                             {target.isActive ? 'Active' : 'Offline'}
                           </span>
                           <button 
                            onClick={() => { setEditingTarget(target); setIsModalOpen(true); }}
                            className="p-2 text-slate-300 hover:text-slate-900 transition-colors bg-slate-50 border border-slate-100 rounded-lg"
                           >
                              <Settings size={18} />
                           </button>
                        </div>
                     </div>

                     <div className="mb-8">
                        <h3 className="text-xl font-black text-slate-900 mb-1">{target.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{target.url}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Standard</span>
                           <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase">
                              {getFormatIcon(target.format)}
                              {target.format}
                           </span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Security</span>
                           <span className="text-[9px] font-black text-emerald-600 uppercase">HMAC SIGNED</span>
                        </div>
                     </div>

                     <button className="w-full py-4 bg-[#031124] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95">
                       Test Connection
                     </button>
                  </div>
                ))}

                {targets.length === 0 && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50">
                        <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm mb-6">
                            <Server size={40} className="text-slate-200" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">No destination systems configured</h4>
                        <p className="text-sm text-slate-400 mt-2 font-medium">Add your internal banking systems or external gateways to start distributing.</p>
                        <button 
                            onClick={() => { setEditingTarget(null); setIsModalOpen(true); }}
                            className="mt-8 flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                        >
                            <Plus size={18} /> Configure First System
                        </button>
                    </div>
                )}
             </div>
          )}

          {activeTab === 'logs' && (
             <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                   <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-900">Transmission History</h2>
                        <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">{deliveries.length} TOTAL</span>
                   </div>
                   <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input type="text" placeholder="Search logs..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/20 w-64" />
                        </div>
                        <button className="px-5 py-2.5 bg-[#031124] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center gap-2">
                            <FileSpreadsheet size={14} /> Export CSV
                        </button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                           <th className="px-8 py-5">Status & Timestamp</th>
                           <th className="px-8 py-5">Destination System</th>
                           <th className="px-8 py-5">Event Type</th>
                           <th className="px-8 py-5 text-center">Batch ID</th>
                           <th className="px-8 py-5 text-right pr-10">Data Size</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-sm">
                         {deliveries.map(log => (
                           <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${log.status === 'SUCCESS' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : log.status === 'FAILED' ? 'text-red-600 bg-red-50 border border-red-100' : 'text-orange-600 bg-orange-50 border border-orange-100'}`}>
                                       {log.status === 'SUCCESS' ? <CheckCircle2 size={16} /> : log.status === 'FAILED' ? <XCircle size={16} /> : <RefreshCw size={16} className="animate-spin" />}
                                    </div>
                                    <div className="flex flex-col">
                                       <span className={`font-black uppercase tracking-widest text-[10px] ${log.status === 'SUCCESS' ? 'text-emerald-600' : log.status === 'FAILED' ? 'text-red-600' : 'text-orange-600'}`}>{log.status}</span>
                                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{new Date(log.createdAt).toLocaleString()}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-400">
                                        <Server size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">{log.target?.name || 'External System'}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">HTTP {log.responseStatus || '---'}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    {log.eventType}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <span className="font-mono text-[10px] text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                    {log.payload?.batch?.id?.substring(0, 8) || 'Unknown'}...
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-right pr-10">
                                 <button className="text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest shadow-sm shadow-orange-500/10">
                                    View Payload
                                 </button>
                              </td>
                           </tr>
                         ))}
                         {deliveries.length === 0 && (
                           <tr>
                             <td colSpan="5" className="text-center py-32 flex flex-col items-center justify-center">
                                <History size={40} className="text-slate-100 mb-4" />
                                <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">No transmission history</span>
                             </td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

        </div>
      </main>

      {/* Add Destination Modal */}
      <AddDestinationModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTarget(null); }}
        onSave={handleSaveTarget}
        target={editingTarget}
      />
    </div>
  );
}