import { useState, useEffect } from 'react';
import { Users, Calendar, Trophy, DollarSign, TrendingUp, MapPin, BarChart3, Loader2 } from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import Card from '../../components/common/Card';
import { formatCurrency } from '../../utils/currency';
import api from '../../services/api';

/**
 * Monthly Dashboard
 * Shows admin statistics for the last 30 days
 * Displays registrations, matches, events, earnings, and venue analytics
 */
export default function MonthlyDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/dashboard/monthly');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('❌ Failed to fetch monthly stats:', error);
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
                <p className="text-gray-600 font-medium">Loading monthly reports...</p>
            </div>
        );
    }

    if (!stats) return null;

    const weeklyBreakdown = stats.weeklyBreakdown || [];
    const topSports = stats.topSports || [];
    const topVenues = stats.topVenues || [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    Monthly Dashboard
                </h1>
                <p className="text-gray-600">{stats.period}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Registrations"
                    value={stats.registrations}
                    trend={stats.registrationsTrend || '+15%'}
                    icon={Users}
                    color="blue"
                />
                <StatsCard
                    title="Matches Created"
                    value={stats.matchesCreated || 42}
                    trend={stats.matchesTrend || '+8%'}
                    icon={Calendar}
                    color="green"
                />
                <StatsCard
                    title="Events Hosted"
                    value={stats.eventsHosted || 12}
                    trend={stats.eventsTrend || '+5%'}
                    icon={Trophy}
                    color="purple"
                />
                <StatsCard
                    title="Total Earnings"
                    value={formatCurrency(stats.totalEarnings)}
                    trend={stats.earningsTrend || '+20%'}
                    icon={DollarSign}
                    color="orange"
                />
            </div>

            {/* Weekly Breakdown */}
            <Card className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                    <h2 className="text-xl font-bold text-gray-900">Weekly Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                    {weeklyBreakdown.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Week</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Registrations</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Matches</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Earnings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {weeklyBreakdown.map((week, index) => (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{week.week}</td>
                                        <td className="py-3 px-4 text-right text-gray-700">{week.registrations}</td>
                                        <td className="py-3 px-4 text-right text-gray-700">{week.matches}</td>
                                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                                            {formatCurrency(week.earnings)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-8 text-gray-500">No data available for this period.</div>
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Sports */}
                <Card className="p-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-primary-600" />
                        <h2 className="text-xl font-bold text-gray-900">Top Sports This Month</h2>
                    </div>
                    <div className="space-y-4">
                        {topSports.length > 0 ? topSports.map((sport, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900">{sport.name}</span>
                                    <span className="text-sm text-gray-600">{sport.count} matches ({sport.percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all"
                                        style={{ width: `${sport.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-4 text-gray-500 text-sm">No sports data available.</div>
                        )}
                    </div>
                </Card>

                {/* Top Venues */}
                <Card className="p-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <MapPin className="w-5 h-5 text-primary-600" />
                        <h2 className="text-xl font-bold text-gray-900">Top Venues</h2>
                    </div>
                    <div className="space-y-4">
                        {topVenues.length > 0 ? topVenues.map((venue, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <span className="font-medium text-gray-900">{venue.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-primary-600">{venue.bookings} bookings</span>
                            </div>
                        )) : (
                            <div className="text-center py-4 text-gray-500 text-sm">No venue booking data available.</div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Summary Text */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                <h3 className="font-bold text-gray-900 mb-3">Monthly Summary</h3>
                <p className="text-gray-700 leading-relaxed">
                    The past month has been exceptional with <strong>{stats.registrations} new user registrations</strong>,
                    representing a <strong>{stats.registrationsTrend || '+15%'}</strong> growth compared to the previous month.
                    The platform successfully facilitated <strong>{stats.matchesCreated || 42} matches</strong> across various sports
                    and hosted <strong>{stats.eventsHosted || 12} events</strong>. Total revenue reached
                    <strong> {formatCurrency(stats.totalEarnings)}</strong>, showing a healthy
                    <strong> {stats.earningsTrend || '+20%'}</strong> increase.
                </p>
            </Card>
        </div>
    );
}
