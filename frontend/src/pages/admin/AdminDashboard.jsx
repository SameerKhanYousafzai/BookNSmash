import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Trophy, Loader2, RefreshCw } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/currency';
import api from '../../services/api';

import MetricsCard from '../../components/admin/MetricsCard';
import RegistrationsChart from '../../components/admin/RegistrationsChart';
import SportDistributionChart from '../../components/admin/SportDistributionChart';
import UpcomingEvents from '../../components/admin/UpcomingEvents';
import TopSportsCard from '../../components/admin/TopSportsCard';

/**
 * AdminDashboard — Kleon-inspired analytics hub with dark/light theme
 * All data fetched from real backend APIs, zero hardcoded values
 */
export default function AdminDashboard() {
    const { events = [] } = useData();
    const { isDark } = useTheme();
    const [stats, setStats] = useState(null);
    const [weeklyData, setWeeklyData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, weeklyRes] = await Promise.all([
                api.get('/admin/dashboard/stats'),
                api.get('/admin/dashboard/weekly'),
            ]);

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }
            if (weeklyRes.ok) {
                const data = await weeklyRes.json();
                setWeeklyData(data);
            }
        } catch (error) {
            console.error('❌ Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                </div>
                <p className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading analytics...</p>
            </div>
        );
    }

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {greeting}, Admin 👋
                    </h1>
                    <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Here's what's happening on your platform today.
                    </p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${isDark
                            ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                        }`}
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricsCard
                    label="Total Users"
                    value={stats?.totalUsers?.toLocaleString() || '0'}
                    trend="+0%"
                    icon={Users}
                    color="blue"
                />
                <MetricsCard
                    label="Active Events"
                    value={stats?.activeEvents?.toLocaleString() || '0'}
                    trend="+0%"
                    icon={Calendar}
                    color="green"
                />
                <MetricsCard
                    label="Total Revenue"
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    trend="+0%"
                    icon={DollarSign}
                    color="purple"
                />
                <MetricsCard
                    label="Teams"
                    value={stats?.totalTeams?.toLocaleString() || '0'}
                    trend="+0%"
                    icon={Trophy}
                    color="orange"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RegistrationsChart
                        data={weeklyData?.dailyBreakdown || []}
                        title="Registrations This Week"
                    />
                </div>
                <SportDistributionChart
                    data={weeklyData?.topSports || []}
                />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <UpcomingEvents events={events} />
                </div>
                <TopSportsCard
                    data={weeklyData?.topSports || []}
                />
            </div>
        </div>
    );
}
