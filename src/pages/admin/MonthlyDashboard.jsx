import React from 'react';
import { Users, Calendar, Trophy, DollarSign, TrendingUp, MapPin, BarChart3 } from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import Card from '../../components/common/Card';
import { adminStats } from '../../data/authMockData';

/**
 * Monthly Dashboard
 * Shows admin statistics for the last 30 days
 * Displays registrations, matches, events, earnings, and venue analytics
 */
export default function MonthlyDashboard() {
    const stats = adminStats.monthly;

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

            {/* Weekly Breakdown */}
            <Card className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                    <h2 className="text-xl font-bold text-gray-900">Weekly Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
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
                            {stats.weeklyBreakdown.map((week, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium text-gray-900">{week.week}</td>
                                    <td className="py-3 px-4 text-right text-gray-700">{week.registrations}</td>
                                    <td className="py-3 px-4 text-right text-gray-700">{week.matches}</td>
                                    <td className="py-3 px-4 text-right font-semibold text-green-600">
                                        ${week.earnings.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

                {/* Top Venues */}
                <Card className="p-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <MapPin className="w-5 h-5 text-primary-600" />
                        <h2 className="text-xl font-bold text-gray-900">Top Venues</h2>
                    </div>
                    <div className="space-y-4">
                        {stats.topVenues.map((venue, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <span className="font-medium text-gray-900">{venue.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-primary-600">{venue.bookings} bookings</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Summary Text */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                <h3 className="font-bold text-gray-900 mb-3">Monthly Summary</h3>
                <p className="text-gray-700 leading-relaxed">
                    The past month has been exceptional with <strong>{stats.registrations} new user registrations</strong>,
                    representing a <strong>{stats.registrationsTrend}</strong> growth compared to the previous month.
                    The platform successfully facilitated <strong>{stats.matchesCreated} matches</strong> across various sports
                    and hosted <strong>{stats.eventsHosted} events</strong>. Total revenue reached
                    <strong> ${stats.totalEarnings.toLocaleString()}</strong>, showing a healthy
                    <strong> {stats.earningsTrend}</strong> increase. Week 3 showed the highest activity with 52 registrations.
                    Khan Sports Complex led venue bookings with 28 reservations this month.
                </p>
            </Card>
        </div>
    );
}
