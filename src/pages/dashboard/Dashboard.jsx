import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, List, ArrowUpRight, TrendingUp } from 'lucide-react';
import dashboardService from "../../services/dashboardService";

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 ease-out group flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${color} ring-4 ring-slate-50 transition-all duration-300 group-hover:scale-105`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
          <TrendingUp size={14} />
          {trend}%
        </div>
      )}
    </div>
    <div className="space-y-1.5">
      <h3 className="text-slate-500 text-sm font-medium tracking-wide uppercase">{title}</h3>
      <p className="text-4xl font-extrabold text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBlacklists: 0,
    totalEntries: 0,
    activeUsers: 0,
    recentActivity: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setIsLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: "Total Blacklists",
      value: stats.totalBlacklists,
      icon: Shield,
      color: "bg-blue-50 text-blue-600",
      trend: 12
    },
    {
      title: "Total Entries",
      value: stats.totalEntries.toLocaleString(),
      icon: List,
      color: "bg-purple-50 text-purple-600",
      trend: 8
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: Users,
      color: "bg-amber-50 text-amber-600",
      trend: 5
    },
    {
      title: "Recent Activities",
      value: stats.recentActivity,
      icon: Activity,
      color: "bg-rose-50 text-rose-600",
      trend: 15
    }
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 text-base">Real-time monitoring of your blacklist ecosystem.</p>
        </div>
        <div className="text-left sm:text-right bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm inline-block">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Last updated</p>
          <p className="text-sm font-bold text-slate-700">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {dashboardCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-[#031124] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/10 flex flex-col justify-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-bold mb-6 border border-indigo-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All systems operational
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">Welcome to SIMS v2.0</h2>
            <p className="text-slate-300 max-w-lg mb-8 text-lg leading-relaxed">
              You have 3 pending reviews and 1 new regulatory update available from OFAC.
            </p>
            <button className="h-12 bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 focus-visible:ring-4 focus-visible:ring-indigo-500/50">
              Review Now <ArrowUpRight size={20} />
            </button>
          </div>
          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full -mr-20 -mt-20 blur-3xl transition-transform duration-1000 hover:scale-110"></div>
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-500/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">⚡</span>
            Quick Actions
          </h3>
          <div className="space-y-4 flex-1">
            <button className="w-full text-left p-5 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-md transition-all duration-200 flex items-center gap-4 group focus-visible:ring-2 focus-visible:ring-indigo-500">
              <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-200 ring-1 ring-slate-100">
                <Shield size={22} className="text-blue-600" />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-800 mb-0.5">New Blacklist</span>
                <span className="block text-xs text-slate-500">Upload or manual entry</span>
              </div>
            </button>
            <button className="w-full text-left p-5 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-md transition-all duration-200 flex items-center gap-4 group focus-visible:ring-2 focus-visible:ring-indigo-500">
              <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-200 ring-1 ring-slate-100">
                <Users size={22} className="text-amber-600" />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-800 mb-0.5">Invite Team</span>
                <span className="block text-xs text-slate-500">Add new users or roles</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
