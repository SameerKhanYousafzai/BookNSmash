import { useState, useEffect } from 'react';
import { Users, Calendar, Trophy, DollarSign, TrendingUp, Activity, Target, Loader2 } from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import Card from '../../components/common/Card';
import { formatCurrency } from '../../utils/currency';
import api from '../../services/api';

/**
 * Yearly Dashboard
 * Shows admin statistics for the last 12 months
 * Displays comprehensive annual analytics and user growth metrics
 */
export default function YearlyDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/dashboard/yearly');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('❌ Failed to fetch yearly stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="container-custom py-16 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                <p className="text-gray-600 font-medium">Loading annual reports...</p>
            </div>
        );
    }

    if (!stats) return null;

    const monthlyBreakdown = stats.monthlyBreakdown || [];
    const topSports = stats.topSports || [];
    const userGrowth = stats.userGrowth || {
        totalUsers: 0,
        activeUsers: 0,
        retentionRate: 0
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    Yearly Dashboard
                </h1>
                <p className="text-gray-600">{stats.period}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Registrations"
                    value={stats.registrations.toLocaleString()}
                    trend={stats.registrationsTrend || '+25%'}
                    icon={Users}
                    color="blue"
                />
                <StatsCard
                    title="Matches Created"
                    value={stats.matchesCreated?.toLocaleString() || '0'}
                    trend={stats.matchesTrend || '0%'}
                    icon={Calendar}
                    color="green"
                />
                <StatsCard
                    title="Events Hosted"
                    value={stats.eventsHosted?.toLocaleString() || '0'}
                    trend={stats.eventsTrend || '0%'}
                    icon={Trophy}
                    color="purple"
                />
                <StatsCard
                    title="Total Earnings"
                    value={formatCurrency(stats.totalEarnings)}
                    trend={stats.earningsTrend || '+32%'}
                    icon={DollarSign}
                    color="orange"
                />
            </div>

            {/* User Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center space-x-3 mb-3">
                        <Users className="w-6 h-6" />
                        <h3 className="font-semibold">Total Users</h3>
                    </div>
                    <p className="text-3xl font-bold">{userGrowth.totalUsers.toLocaleString()}</p>
                    <p className="text-sm text-blue-100 mt-2">Registered members</p>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <div className="flex items-center space-x-3 mb-3">
                        <Activity className="w-6 h-6" />
                        <h3 className="font-semibold">Active Users</h3>
                    </div>
                    <p className="text-3xl font-bold">{userGrowth.activeUsers.toLocaleString()}</p>
                    <p className="text-sm text-green-100 mt-2">Monthly active users</p>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <div className="flex items-center space-x-3 mb-3">
                        <Target className="w-6 h-6" />
                        <h3 className="font-semibold">Retention Rate</h3>
                    </div>
                    <p className="text-3xl font-bold">{userGrowth.retentionRate}%</p>
                    <p className="text-sm text-purple-100 mt-2">User retention</p>
                </Card>
            </div>

            {/* Monthly Breakdown */}
            <Card className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                    <h2 className="text-xl font-bold text-gray-900">Monthly Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                    {monthlyBreakdown.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Month</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Registrations</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Matches</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Earnings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyBreakdown.map((month, index) => (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{month.month}</td>
                                        <td className="py-3 px-4 text-right text-gray-700">{month.registrations}</td>
                                        <td className="py-3 px-4 text-right text-gray-700">{month.matches}</td>
                                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                                            {formatCurrency(month.earnings)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-8 text-gray-500">No data available for this year yet.</div>
                    )}
                </div>
            </Card>

            {/* Top Sports Annual */}
            <Card className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <Trophy className="w-5 h-5 text-primary-600" />
                    <h2 className="text-xl font-bold text-gray-900">Top Sports of the Year</h2>
                </div>
                <div className="space-y-4">
                    {topSports.length > 0 ? topSports.map((sport, index) => (
                        <div key={index}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                    <span className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                    </span>
                                    <span className="font-medium text-gray-900">{sport.name}</span>
                                </div>
                                <span className="text-sm text-gray-600">{sport.count} matches ({sport.percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all"
                                    style={{ width: `${sport.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-4 text-gray-500 text-sm">No sports data available.</div>
                    )}
                </div>
            </Card>

            {/* Annual Summary */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <h3 className="font-bold text-gray-900 mb-3">Annual Summary & Insights</h3>
                <div className="space-y-3 text-gray-700 leading-relaxed">
                    <p>
                        The platform achieved healthy growth this year with
                        <strong> {stats.registrations.toLocaleString()} new registrations</strong>. Total revenue reached
                        <strong> {formatCurrency(stats.totalEarnings)}</strong>, showing consistent performance across all venues and events.
                    </p>
                </div>
            </Card>
        </div>
    );
}
