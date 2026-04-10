import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Calendar as CalendarIcon, TrendingUp, Trophy, MapPin, Loader2, X, Users, Activity } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import SportDistributionChart from '../../components/admin/SportDistributionChart';

const StatsCard = ({ title, value, icon: Icon, trend, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
                    {trend && (
                        <span className="text-sm font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {trend}
                        </span>
                    )}
                </div>
            </div>
            <div className={`p-4 rounded-xl ${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

export default function Dashboard() {
    const { isAuthenticated, currentUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [range, setRange] = useState('month'); 
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Drilldown State
    const [drilldownLoading, setDrilldownLoading] = useState(false);
    const [drilldownData, setDrilldownData] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            let queryParams = `range=${range}`;
            if (startDate && endDate) {
                queryParams += `&startDate=${startDate}&endDate=${endDate}`;
            }
            const res = await api.get(`/admin/dashboard?${queryParams}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchDashboard();
        }
    }, [isAuthenticated, range, startDate, endDate]);

    const handleChartClick = async (dataPoint) => {
        if (!dataPoint) return;
        let targetDate = dataPoint.activePayload?.[0]?.payload?.fullDate; 
        if(!targetDate) return;
        setModalTitle(`Details for ${dataPoint.activeLabel}`);
        setModalOpen(true);
        setDrilldownLoading(true);
        try {
            const res = await api.get(`/admin/dashboard/date-details?date=${targetDate}&range=${range}`);
            if (res.ok) {
                const data = await res.json();
                setDrilldownData(data);
            }
        } catch (error) {
            console.error('Failed to fetch drilldown:', error);
        } finally {
            setDrilldownLoading(false);
        }
    };

    const clearCustomDates = () => {
        setStartDate('');
        setEndDate('');
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {greeting}, {currentUser?.name?.split(' ')[0] || 'Admin'} 👋
                    </h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        {stats?.period} Platform Overview
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={range}
                        onChange={(e) => {
                            setRange(e.target.value);
                            clearCustomDates();
                        }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 font-medium shadow-sm"
                        disabled={startDate && endDate}
                    >
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                        <option value="all">All Time</option>
                    </select>

                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 shadow-sm">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <input 
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-900 dark:text-white py-2 w-auto"
                        />
                        <span className="text-gray-500 font-medium">to</span>
                        <input 
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-900 dark:text-white py-2 w-auto"
                        />
                        {(startDate || endDate) && (
                            <button onClick={clearCustomDates} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-red-500">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Unified Top Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
                <StatsCard
                    title="Total Users"
                    value={stats?.totalUsers?.toLocaleString() || '0'}
                    icon={Users}
                    colorClass="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                />
                <StatsCard
                    title="Active Events"
                    value={stats?.activeEvents?.toLocaleString() || '0'}
                    icon={CalendarIcon}
                    colorClass="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                />
                <StatsCard
                    title="Total Revenue"
                    value={`Rs ${stats?.totalEarnings?.toLocaleString() || '0'}`}
                    icon={MapPin}
                    colorClass="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                />
                <StatsCard
                    title="Teams"
                    value={stats?.totalTeams?.toLocaleString() || '0'}
                    icon={Trophy}
                    colorClass="bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                />
                <StatsCard
                    title="Total Registrations"
                    value={stats?.registrations?.toLocaleString() || '0'}
                    icon={TrendingUp}
                    colorClass="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                />
                <StatsCard
                    title="Matches Created"
                    value={stats?.matchesCreated?.toLocaleString() || '0'}
                    icon={Activity}
                    colorClass="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
                />
                <StatsCard
                    title="Events Hosted"
                    value={stats?.eventsHosted?.toLocaleString() || '0'}
                    icon={CalendarIcon}
                    colorClass="bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {stats?.chartData && stats.chartData.length > 0 && !(startDate && endDate) && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Trend Analytics (Registrations & Matches)</h2>
                                <span className="text-xs font-semibold text-gray-500">(Click any bar for details)</span>
                            </div>
                            <div className="w-full h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.chartData} onClick={handleChartClick}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
                                        <XAxis 
                                            dataKey="label" 
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis 
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <RechartsTooltip 
                                            cursor={{fill: 'rgba(99, 102, 241, 0.1)'}}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="registrations" name="Registrations" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        <Bar dataKey="matches" name="Matches" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
                
                {stats?.topSports && stats.topSports.length > 0 && (
                    <div className="lg:col-span-1 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                        <SportDistributionChart data={stats.topSports} />
                    </div>
                )}
            </div>

            {/* Drilldown Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{modalTitle}</h3>
                            <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-8">
                            {drilldownLoading ? (
                                <div className="flex justify-center items-center py-10">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                </div>
                            ) : drilldownData ? (
                                <>
                                    {/* Registrations List */}
                                    <div>
                                        <h4 className="font-bold text-md mb-4 text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5" /> 
                                            Registrations ({drilldownData.registrations?.length || 0})
                                        </h4>
                                        {drilldownData.registrations?.length > 0 ? (
                                            <ul className="space-y-3">
                                            {drilldownData.registrations.map(r => (
                                                <li key={r.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{r.user}</span>
                                                    <span className="text-xs text-gray-500">{new Date(r.registeredAt).toLocaleTimeString()}</span>
                                                </li>
                                            ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No registrations found.</p>
                                        )}
                                    </div>

                                    {/* Matches List */}
                                    <div>
                                        <h4 className="font-bold text-md mb-4 text-purple-600 dark:text-purple-400 flex items-center gap-2">
                                            <Trophy className="w-5 h-5" /> 
                                            Matches Created ({drilldownData.matches?.length || 0})
                                        </h4>
                                        {drilldownData.matches?.length > 0 ? (
                                            <ul className="space-y-3">
                                            {drilldownData.matches.map(m => (
                                                <li key={m.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 gap-2">
                                                    <div>
                                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{m.event}</p>
                                                        <p className="text-xs font-medium text-purple-500 uppercase">{m.status}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-black font-mono text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-700 px-3 py-[2px] rounded-md">
                                                            {m.score || 'vs'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">{new Date(m.date).toLocaleTimeString()}</span>
                                                    </div>
                                                </li>
                                            ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No matches found.</p>
                                        )}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
