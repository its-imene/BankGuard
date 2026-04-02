import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, List, ArrowUpRight, TrendingUp } from 'lucide-react';
import dashboardService from "../../services/dashboardService";

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon size={24} className="group-hover:scale-110 transition-transform" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
          <TrendingUp size={12} />
          {trend}%
        </div>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
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
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">System Overview</h1>
          <p className="text-slate-500 text-lg">Real-time monitoring of your blacklist ecosystem.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-400">Last updated</p>
          <p className="text-sm font-bold text-slate-700">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-[#031124] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Welcome to SIMS v2.0</h2>
            <p className="text-slate-400 max-w-md mb-8">
              All systems are operational. You have 3 pending reviews and 1 new regulatory update available from OFAC.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2">
              Review Now <ArrowUpRight size={20} />
            </button>
          </div>
          {/* Abstract background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <button className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-4 group">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Shield size={20} className="text-blue-600" />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-800">New Blacklist</span>
                <span className="block text-[10px] text-slate-500">Upload or manual entry</span>
              </div>
            </button>
            <button className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-4 group">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Users size={20} className="text-amber-600" />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-800">Invite Team</span>
                <span className="block text-[10px] text-slate-500">Add new users or roles</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
