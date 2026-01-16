import React from 'react';
import { Users, Calendar, Trophy, DollarSign, TrendingUp, Activity } from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import Card from '../../components/common/Card';
import { adminStats } from '../../data/authMockData';

/**
 * Weekly Dashboard
 * Shows admin statistics for the last 7 days
 * Displays registrations, matches, events, and earnings
 */
export default function WeeklyDashboard() {
    const stats = adminStats.weekly;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    Weekly Dashboard
                </h1>
                <p className="text-gray-600">{stats.period}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Registrations"
                    value={stats.registrations}
                    trend={stats.registrationsTrend}
                    icon={Users}
                    color="blue"
                />
                <StatsCard
                    title="Matches Created"
                    value={stats.matchesCreated}
                    trend={stats.matchesTrend}
                    icon={Calendar}
                    color="green"
                />
                <StatsCard
                    title="Events Hosted"
                    value={stats.eventsHosted}
                    trend={stats.eventsTrend}
                    icon={Trophy}
                    color="purple"
                />
                <StatsCard
                    title="Total Earnings"
                    value={`$${stats.totalEarnings.toLocaleString()}`}
                    trend={stats.earningsTrend}
                    icon={DollarSign}
                    color="orange"
                />
            </div>

            {/* Daily Breakdown */}
            <Card className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <Activity className="w-5 h-5 text-primary-600" />
                    <h2 className="text-xl font-bold text-gray-900">Daily Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Day</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Registrations</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Matches</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Earnings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.dailyBreakdown.map((day, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium text-gray-900">{day.day}</td>
                                    <td className="py-3 px-4 text-right text-gray-700">{day.registrations}</td>
                                    <td className="py-3 px-4 text-right text-gray-700">{day.matches}</td>
                                    <td className="py-3 px-4 text-right font-semibold text-green-600">
                                        ${day.earnings.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Top Sports */}
            <Card className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                    <h2 className="text-xl font-bold text-gray-900">Top Sports This Week</h2>
                </div>
                <div className="space-y-4">
                    {stats.topSports.map((sport, index) => (
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
                    ))}
                </div>
            </Card>

            {/* Summary Text */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3">Weekly Summary</h3>
                <p className="text-gray-700 leading-relaxed">
                    This week showed strong performance with <strong>{stats.registrations} new registrations</strong>,
                    marking a <strong>{stats.registrationsTrend}</strong> increase from last week.
                    The platform facilitated <strong>{stats.matchesCreated} matches</strong> and
                    hosted <strong>{stats.eventsHosted} events</strong>, generating total earnings of
                    <strong> ${stats.totalEarnings.toLocaleString()}</strong>. Tennis continues to be the most
                    popular sport, followed by Basketball and Football.
                </p>
            </Card>
        </div>
    );
}
