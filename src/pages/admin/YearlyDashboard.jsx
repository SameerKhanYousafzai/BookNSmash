import React from 'react';
import { Users, Calendar, Trophy, DollarSign, TrendingUp, Activity, Target } from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import Card from '../../components/common/Card';
import { adminStats } from '../../data/authMockData';

/**
 * Yearly Dashboard
 * Shows admin statistics for the last 12 months
 * Displays comprehensive annual analytics and user growth metrics
 */
export default function YearlyDashboard() {
    const stats = adminStats.yearly;

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
                    trend={stats.registrationsTrend}
                    icon={Users}
                    color="blue"
                />
                <StatsCard
                    title="Matches Created"
                    value={stats.matchesCreated.toLocaleString()}
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

            {/* User Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center space-x-3 mb-3">
                        <Users className="w-6 h-6" />
                        <h3 className="font-semibold">Total Users</h3>
                    </div>
                    <p className="text-3xl font-bold">{stats.userGrowth.totalUsers.toLocaleString()}</p>
                    <p className="text-sm text-blue-100 mt-2">Registered members</p>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <div className="flex items-center space-x-3 mb-3">
                        <Activity className="w-6 h-6" />
                        <h3 className="font-semibold">Active Users</h3>
                    </div>
                    <p className="text-3xl font-bold">{stats.userGrowth.activeUsers.toLocaleString()}</p>
                    <p className="text-sm text-green-100 mt-2">Monthly active users</p>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <div className="flex items-center space-x-3 mb-3">
                        <Target className="w-6 h-6" />
                        <h3 className="font-semibold">Retention Rate</h3>
                    </div>
                    <p className="text-3xl font-bold">{stats.userGrowth.retentionRate}%</p>
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
                            {stats.monthlyBreakdown.map((month, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium text-gray-900">{month.month}</td>
                                    <td className="py-3 px-4 text-right text-gray-700">{month.registrations}</td>
                                    <td className="py-3 px-4 text-right text-gray-700">{month.matches}</td>
                                    <td className="py-3 px-4 text-right font-semibold text-green-600">
                                        ${month.earnings.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-gray-50 font-bold">
                                <td className="py-3 px-4 text-gray-900">Total</td>
                                <td className="py-3 px-4 text-right text-gray-900">{stats.registrations.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right text-gray-900">{stats.matchesCreated.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right text-green-600">
                                    ${stats.totalEarnings.toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Top Sports Annual */}
            <Card className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <Trophy className="w-5 h-5 text-primary-600" />
                    <h2 className="text-xl font-bold text-gray-900">Top Sports of the Year</h2>
                </div>
                <div className="space-y-4">
                    {stats.topSports.map((sport, index) => (
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
                    ))}
                </div>
            </Card>

            {/* Annual Summary */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <h3 className="font-bold text-gray-900 mb-3">Annual Summary & Insights</h3>
                <div className="space-y-3 text-gray-700 leading-relaxed">
                    <p>
                        <strong>Outstanding Year:</strong> The platform achieved remarkable growth with
                        <strong> {stats.registrations.toLocaleString()} new registrations</strong>, representing a
                        <strong> {stats.registrationsTrend}</strong> year-over-year increase.
                    </p>
                    <p>
                        <strong>Match Activity:</strong> A total of <strong>{stats.matchesCreated.toLocaleString()} matches</strong> were
                        organized across all sports categories, with December showing peak activity at 107 matches.
                    </p>
                    <p>
                        <strong>Revenue Performance:</strong> Annual earnings reached
                        <strong> ${stats.totalEarnings.toLocaleString()}</strong>, marking a
                        <strong> {stats.earningsTrend}</strong> growth. July was the highest-earning month with $50,200.
                    </p>
                    <p>
                        <strong>User Engagement:</strong> With <strong>{stats.userGrowth.retentionRate}% retention rate</strong> and
                        <strong> {stats.userGrowth.activeUsers.toLocaleString()} active users</strong>, the platform demonstrates
                        strong user satisfaction and engagement.
                    </p>
                    <p>
                        <strong>Sport Trends:</strong> Tennis dominated with 425 matches (31%), followed by Basketball (28%)
                        and Football (24%), showing diverse user interests across multiple sports.
                    </p>
                </div>
            </Card>
        </div>
    );
}
