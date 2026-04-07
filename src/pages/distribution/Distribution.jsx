import React, { useState, useEffect, useMemo, memo } from 'react';
import { 
  Search, Server, Database, Activity, 
  Plus, CheckCircle2, XCircle, Clock, X,
  ExternalLink, Settings, History, Shield, 
  ChevronRight, RefreshCw, AlertCircle, FileJson, FileCode, FileSpreadsheet,
  TrendingUp, Zap, Eye, Filter, Download, Copy, CheckCircle
} from 'lucide-react';
import webhookService from '../../services/webhookService';
import { blacklistService } from '../../services/blacklistService';
import { toast } from 'react-hot-toast';
import AddDestinationModal from './components/AddDestinationModal';

/* ─── Reusable Components ─── */

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:border-slate-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg text-white bg-gradient-to-br ${
        color === 'blue' ? 'from-blue-500 to-blue-600' :
        color === 'green' ? 'from-emerald-500 to-emerald-600' :
        color === 'orange' ? 'from-orange-500 to-orange-600' :
        'from-slate-500 to-slate-600'
      }`}>
        <Icon size={20} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
          trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          <TrendingUp size={12} />
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-sm font-medium text-slate-600">{title}</h3>
    <div className="text-3xl font-bold text-slate-900 mt-2">{value}</div>
    {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative border-b-2 ${
      active 
        ? 'border-orange-500 text-orange-600 bg-orange-50/30' 
        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`}
  >
    <Icon size={16} />
    {label}
    {badge && (
      <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
        {badge}
      </span>
    )}
  </button>
);

const StatusBadge = ({ status }) => {
  const styles = {
    SUCCESS: { bg: 'emerald-50', border: 'emerald-200', text: 'emerald-700', icon: CheckCircle2 },
    FAILED: { bg: 'red-50', border: 'red-200', text: 'red-700', icon: XCircle },
    PENDING: { bg: 'orange-50', border: 'orange-200', text: 'orange-700', icon: Clock }
  };
  const style = styles[status] || styles.PENDING;
  const IconComponent = style.icon;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 bg-${style.bg} border border-${style.border} rounded-lg`}>
      <IconComponent size={14} className={`text-${style.text}`} />
      <span className={`text-xs font-bold uppercase tracking-wide text-${style.text}`}>{status}</span>
    </div>
  );
};

const JsonView = memo(({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { highlighted, linesDisplay, isTruncated, totalLines } = useMemo(() => {
    if (!data) return { highlighted: '', linesDisplay: '', isTruncated: false, totalLines: 0 };
    
    const rawString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const lines = rawString.split('\n');
    const LIMIT = 500; // Snappier initial load
    
    const needsTruncation = lines.length > LIMIT && !isExpanded;
    const finalLines = needsTruncation ? lines.slice(0, LIMIT) : lines;
    
    const highlight = (str) => {
      return str.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'text-blue-300';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'text-emerald-400' : 'text-amber-200';
        } else if (/true|false/.test(match)) {
          cls = 'text-orange-400';
        } else if (/null/.test(match)) {
          cls = 'text-slate-400';
        }
        return `<span class="${cls}">${match}</span>`;
      });
    };

    return {
      highlighted: finalLines.map(line => highlight(line)).join('\n'),
      linesDisplay: Array.from({ length: finalLines.length }, (_, i) => i + 1).join('\n'),
      totalLines: lines.length,
      isTruncated: needsTruncation
    };
  }, [data, isExpanded]);

  if (!data) return null;

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-[11px] leading-relaxed overflow-hidden border border-white/5 rounded-xl">
      <div className="flex flex-1 overflow-auto custom-scrollbar" style={{ contain: 'content' }}>
        {/* Gutter (Single Block) */}
        <pre className="bg-slate-900/50 border-r border-white/5 text-slate-600 text-right pr-4 pl-6 py-8 select-none shrink-0 sticky left-0 z-10 m-0">
          {linesDisplay}
        </pre>
        {/* Code Area (Single Block) */}
        <div className="flex-1 py-8 px-6 min-w-0">
          <pre 
            className="whitespace-pre m-0"
            style={{ contentVisibility: 'auto' }}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
          {isTruncated && (
            <div className="mt-8 p-10 border-2 border-dashed border-slate-800 rounded-3xl text-center bg-slate-900/20">
              <p className="text-slate-500 mb-6 font-black uppercase tracking-[0.2em] text-[10px]">Large Payload • Showing 500 of {totalLines} lines</p>
              <button 
                onClick={() => setIsExpanded(true)}
                className="px-10 py-3 bg-orange-500 text-white rounded-xl shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all font-black text-[11px] uppercase tracking-widest"
              >
                Expand Full Payload
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default function Distribution() {
  const [activeTab, setActiveTab] = useState('overview');
  const [targets, setTargets] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [blacklists, setBlacklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [modalTab, setModalTab] = useState('payload'); // 'payload' | 'response' | 'headers'

  const [manualBatchId, setManualBatchId] = useState('');
  const [manualTargetId, setManualTargetId] = useState('');

  const validBlacklists = blacklists.filter(b => b.status === 'VALID' || b.status === 'valid');
  const selectedTarget = targets.find(t => t.id === manualTargetId);
  const selectedBatch = validBlacklists.find(b => b.id === manualBatchId);

  // Stats computation
  const stats = useMemo(() => {
    const total = deliveries.length;
    const successful = deliveries.filter(d => d.status === 'SUCCESS').length;
    const failed = deliveries.filter(d => d.status === 'FAILED').length;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 100;

    return { total, successful, failed, successRate };
  }, [deliveries]);

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      const matchesStatus = filterStatus === 'ALL' || d.status === filterStatus;
      const matchesSearch = searchQuery === '' || 
        (d.target?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.payload?.batch?.id || '').includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [deliveries, filterStatus, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [targetsRes, deliveriesRes, blacklistsRes] = await Promise.all([
        webhookService.getTargets(),
        webhookService.getDeliveries(),
        blacklistService.getBlacklists()
      ]);
      setTargets(targetsRes.data || []);
      setDeliveries(deliveriesRes.data || []);
      setBlacklists(blacklistsRes || []);
    } catch (err) {
      console.error('Failed to fetch distribution data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTarget = async (data) => {
    try {
      if (editingTarget) {
        await webhookService.updateTarget(editingTarget.id, data);
        toast.success(`${data.name} updated successfully`);
      } else {
        await webhookService.createTarget(data);
        toast.success(`${data.name} target created`);
      }
      setIsModalOpen(false);
      setEditingTarget(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save destination');
    }
  };

  const handleManualDistribute = async () => {
    if (!manualBatchId || !manualTargetId) {
      toast.error('Select both batch and target system');
      return;
    }
    
    setIsManualLoading(true);
    try {
      await webhookService.testDelivery(manualBatchId, manualTargetId, 'BATCH_VALIDATED');
      toast.success('Distribution task executed');
      setActiveTab('logs');
      fetchData();
    } catch (err) {
      toast.error('Distribution failed');
    } finally {
      setIsManualLoading(false);
    }
  };

  const handleTestConnection = async (id) => {
    try {
      setIsManualLoading(true);
      const sampleBatch = validBlacklists[0];
      if (!sampleBatch) {
        toast.error('No validated batch available for test');
        return;
      }

      await webhookService.testDelivery(sampleBatch.id, id);
      toast.success('Test connection signal sent');
      fetchData();
    } catch (err) {
      toast.error('Connection test failed');
    } finally {
      setIsManualLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredDeliveries.length === 0) {
      toast.error('No logs to export');
      return;
    }

    const headers = ['Timestamp', 'Status', 'Target', 'Event', 'Batch ID', 'Response Code'];
    const rows = filteredDeliveries.map(d => [
      new Date(d.createdAt).toLocaleString(),
      d.status,
      d.target?.name || 'Unknown',
      d.eventType,
      d.payload?.batch?.id?.substring(0, 8) || 'Unknown',
      d.responseStatus || '---'
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `distribution-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success('Logs exported successfully');
  };

  const copyCurrentTabContent = () => {
    const content = modalTab === 'payload' ? selectedLog.payload : selectedLog.responseBody;
    const label = modalTab === 'payload' ? 'Payload' : 'Response';
    
    if (!content) {
      toast.error(`No ${label} content to copy`);
      return;
    }

    const textToCopy = typeof content === 'object' ? JSON.stringify(content, null, 2) : content;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
    toast.success(`${label} copied to clipboard`);
  };

  const downloadPayloadAsJSON = (payload, filename) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    toast.success('Payload downloaded');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Distribution</h1>
            <p className="text-slate-500 mt-2">Manage external system integrations and data transmission</p>
          </div>
          <button 
            onClick={() => { setIsModalOpen(true); setEditingTarget(null); }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            <Plus size={20} /> Add Target
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="Active Targets"
            value={targets.filter(t => t.isActive).length}
            icon={Server}
            color="blue"
            subtitle={`of ${targets.length} total`}
          />
          <StatCard 
            title="Total Deliveries"
            value={stats.total}
            icon={Zap}
            color="orange"
            subtitle="All time"
          />
          <StatCard 
            title="Success Rate"
            value={`${stats.successRate}%`}
            icon={CheckCircle2}
            color="green"
            subtitle={`${stats.successful} successful`}
          />
          <StatCard 
            title="Failed"
            value={stats.failed}
            icon={AlertCircle}
            color="orange"
            trend={stats.failed > 0 ? -5 : 0}
          />
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-slate-200 rounded-lg overflow-hidden">
          <div className="flex gap-6 px-6 border-b border-slate-100">
            <TabButton 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
              icon={Activity}
              label="Overview"
            />
            <TabButton 
              active={activeTab === 'targets'} 
              onClick={() => setActiveTab('targets')}
              icon={Server}
              label="Targets"
              badge={targets.length}
            />
            <TabButton 
              active={activeTab === 'logs'} 
              onClick={() => setActiveTab('logs')}
              icon={History}
              label="History"
              badge={deliveries.length}
            />
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Manual Distribute Section */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-50/50 border-2 border-orange-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-orange-900 mb-4">Quick Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Select Batch
                      </label>
                      <select 
                        value={manualBatchId}
                        onChange={(e) => setManualBatchId(e.target.value)}
                        className="w-full bg-white border-2 border-orange-200 rounded-lg px-4 py-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      >
                        <option value="">Choose a batch...</option>
                        {validBlacklists.map(batch => (
                          <option key={batch.id} value={batch.id}>
                            {batch.source} • {batch.entriesCount} entries
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Select Target
                      </label>
                      <select 
                        value={manualTargetId}
                        onChange={(e) => setManualTargetId(e.target.value)}
                        className="w-full bg-white border-2 border-orange-200 rounded-lg px-4 py-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      >
                        <option value="">Choose a target...</option>
                        {targets.filter(t => t.isActive).map(target => (
                          <option key={target.id} value={target.id}>
                            {target.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button 
                        onClick={handleManualDistribute}
                        disabled={!manualBatchId || !manualTargetId || isManualLoading}
                        className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {isManualLoading ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            Distributing...
                          </>
                        ) : (
                          <>
                            <Zap size={16} />
                            Distribute Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {deliveries.slice(0, 5).map(log => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all">
                        <div className="flex items-center gap-3 flex-1">
                          <StatusBadge status={log.status} />
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{log.target?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setSelectedLog(log); setIsPayloadModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    ))}
                    {deliveries.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        <History size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-medium">No activity yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Targets Tab */}
            {activeTab === 'targets' && (
              <div className="space-y-4">
                {targets.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300">
                    <Server size={48} className="mx-auto mb-3 text-slate-300" />
                    <h3 className="text-lg font-bold text-slate-700 mb-2">No targets configured</h3>
                    <p className="text-slate-500 mb-6">Create your first distribution target to get started</p>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all inline-flex items-center gap-2"
                    >
                      <Plus size={18} /> Create First Target
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {targets.map(target => (
                      <div key={target.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-orange-200 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                              <Server size={20} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-bold text-slate-900">{target.name}</h3>
                                <div className={`w-2 h-2 rounded-full ${target.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              </div>
                              <p className="text-sm text-slate-600 mb-1">{target.description || 'No description'}</p>
                              <p className="text-xs text-slate-500 font-mono">{target.url}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setEditingTarget(target); setIsModalOpen(true); }}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <Settings size={18} />
                            </button>
                            <button 
                              onClick={() => handleTestConnection(target.id)}
                              disabled={isManualLoading}
                              className="px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-50 transition-all"
                            >
                              Test
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Format: {target.format}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {deliveries.filter(d => d.targetId === target.id).length} deliveries
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                {/* Filter Bar */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search by target, batch ID..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500"
                    />
                  </div>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="ALL">All Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="PENDING">Pending</option>
                  </select>
                  <button 
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all text-sm"
                  >
                    <Download size={16} /> Export
                  </button>
                </div>

                {/* Logs Table */}
                {filteredDeliveries.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                    <History size={32} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-medium">No transmission history</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Target System</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Event</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Batch ID</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Timestamp</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredDeliveries.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <StatusBadge status={log.status} />
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-900">
                              {log.target?.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wide">
                                {log.eventType}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-600">
                              {log.payload?.batch?.id?.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-xs">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => { setSelectedLog(log); setIsPayloadModalOpen(true); }}
                                className="text-orange-600 hover:text-orange-700 font-semibold text-sm"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddDestinationModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTarget(null); }}
        onSave={handleSaveTarget}
        target={editingTarget}
      />

      {/* Payload Viewer Modal */}
      {isPayloadModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-3xl overflow-hidden flex flex-col scale-in-center">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-white relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                  <FileJson size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">Transmission Inspector</h3>
                    <StatusBadge status={selectedLog.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Target: <span className="text-slate-900 font-bold">{targets.find(t => t.id === selectedLog.targetId)?.name || 'Unknown System'}</span> • {new Date(selectedLog.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={copyCurrentTabContent}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    copiedPayload 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {copiedPayload ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copiedPayload ? 'Copied' : `Copy ${modalTab === 'payload' ? 'Payload' : 'Response'}`}
                </button>
                <button 
                  onClick={() => downloadPayloadAsJSON(selectedLog.payload, `payload_${selectedLog.id.substring(0, 8)}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-all"
                >
                  <Download size={14} />
                  Download
                </button>
                <button 
                  onClick={() => setIsPayloadModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
              {/* Left Column: Metadata */}
              <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-6 space-y-6 shrink-0">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Event Identity</h4>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Event Type</p>
                      <p className="text-xs font-black text-indigo-600">{selectedLog.eventType}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Batch ID</p>
                      <p className="text-xs font-mono font-bold text-slate-600 truncate">{selectedLog.payload?.batch?.id}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Network Summary</h4>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">HTTP Status</p>
                      <p className={`text-xs font-black ${selectedLog.responseStatus === 200 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {selectedLog.responseStatus || 'No Response'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Format</p>
                      <p className="text-xs font-black text-slate-700 uppercase">
                        {targets.find(t => t.id === selectedLog.targetId)?.format || '??'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Code Viewer with Tabs */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
                {/* Tab Header */}
                <div className="flex bg-slate-900 border-b border-white/10 shrink-0">
                  <button 
                    onClick={() => setModalTab('payload')}
                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                      modalTab === 'payload' ? 'text-emerald-400 border-emerald-400 bg-emerald-400/5' : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                  >
                    Request Payload
                  </button>
                  <button 
                    onClick={() => setModalTab('response')}
                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                      modalTab === 'response' ? 'text-blue-400 border-blue-400 bg-blue-400/5' : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                  >
                    System Response
                  </button>
                  <button 
                    onClick={() => setModalTab('headers')}
                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                      modalTab === 'headers' ? 'text-orange-400 border-orange-400 bg-orange-400/5' : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                  >
                    Network Headers
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                  {modalTab === 'payload' && (
                    <div className="animate-in fade-in duration-200 h-full">
                      <JsonView data={selectedLog.payload} />
                    </div>
                  )}

                  {modalTab === 'response' && (
                    <div className="animate-in fade-in duration-200 h-full">
                      {selectedLog.responseBody ? (
                        <JsonView data={selectedLog.responseBody} />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-slate-600">
                          <XCircle size={32} className="mb-3 opacity-20" />
                          <p className="text-xs font-bold uppercase tracking-widest text-center">No Response Body Recorded</p>
                          <p className="text-[10px] mt-2 opacity-50 max-w-[200px] text-center italic">The destination system did not return any content or the request timed out.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {modalTab === 'headers' && (
                    <div className="p-8 space-y-8 animate-in fade-in duration-200">
                       <div>
                         <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                           Security & Protocol
                         </h5>
                         <div className="bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden">
                            <table className="w-full text-left text-[11px] font-mono">
                               <tbody className="divide-y divide-white/5">
                                  <tr className="hover:bg-white/5">
                                    <td className="px-4 py-3 text-slate-400 w-48">Content-Type</td>
                                    <td className="px-4 py-3 text-orange-200">application/json</td>
                                  </tr>
                                  <tr className="hover:bg-white/5">
                                    <td className="px-4 py-3 text-slate-400 w-48">X-Blacklist-Event</td>
                                    <td className="px-4 py-3 text-indigo-300">{selectedLog.eventType}</td>
                                  </tr>
                                  <tr className="hover:bg-white/5">
                                    <td className="px-4 py-3 text-slate-400 w-48">X-Blacklist-Signature</td>
                                    <td className="px-4 py-3 text-slate-500 italic break-all">hmac-sha256 [HIDDEN]</td>
                                  </tr>
                                  <tr className="hover:bg-white/5">
                                    <td className="px-4 py-3 text-slate-400 w-48">User-Agent</td>
                                    <td className="px-4 py-3 text-slate-500">Blacklist-Distribution-Node/2.0</td>
                                  </tr>
                               </tbody>
                            </table>
                         </div>
                       </div>

                       <div>
                         <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                           System Diagnosis
                         </h5>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                               <p className="text-[9px] text-slate-500 uppercase mb-1">Attempt Count</p>
                               <p className="text-xl font-black text-white">{selectedLog.attemptCount || 1}</p>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                               <p className="text-[9px] text-slate-500 uppercase mb-1">Time Elapsed</p>
                               <p className="text-xl font-black text-white">~42ms</p>
                            </div>
                         </div>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 bg-white border-t border-slate-200 flex justify-end shrink-0">
              <button 
                onClick={() => setIsPayloadModalOpen(false)}
                className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all text-sm"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}