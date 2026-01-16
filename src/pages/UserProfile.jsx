import React from 'react';
import { Trophy, Calendar, MapPin, Award, TrendingUp, Clock } from 'lucide-react';
import Card from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import { userMatchHistory } from '../data/authMockData';

/**
 * UserProfile Page
 * Displays user information and match history
 * Shows completed matches with results and upcoming matches
 */
export default function UserProfile() {
    const { currentUser } = useAuth();

    const completedMatches = userMatchHistory.filter(match => match.status === 'Completed');
    const upcomingMatches = userMatchHistory.filter(match => match.status === 'Upcoming');

    const totalMatches = completedMatches.length;
    const wins = completedMatches.filter(match => match.result === 'Won').length;
    const losses = completedMatches.filter(match => match.result === 'Lost').length;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    return (
        <div className="container-custom py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-2">
                        My Profile
                    </h1>
                    <p className="text-gray-600">View your match history and performance</p>
                </div>
            </div>

            {/* User Info Card */}
            <Card className="p-6">
                <div className="flex items-center space-x-6">
                    <img
                        src={currentUser?.avatar || 'https://i.pravatar.cc/150?img=12'}
                        alt={currentUser?.name}
                        className="w-24 h-24 rounded-full border-4 border-primary-200"
                    />
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentUser?.name}</h2>
                        <p className="text-gray-600 mb-4">{currentUser?.email}</p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2 text-sm">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <span className="text-gray-700"><strong>{wins}</strong> Wins</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span className="text-gray-700"><strong>{totalMatches}</strong> Matches Played</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span className="text-gray-700"><strong>{winRate}%</strong> Win Rate</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100">
                    <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <p className="text-3xl font-bold text-gray-900">{totalMatches}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Matches</p>
                </Card>
                <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100">
                    <Trophy className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <p className="text-3xl font-bold text-gray-900">{wins}</p>
                    <p className="text-sm text-gray-600 mt-1">Wins</p>
                </Card>
                <Card className="p-6 text-center bg-gradient-to-br from-red-50 to-red-100">
                    <Award className="w-8 h-8 text-red-600 mx-auto mb-3" />
                    <p className="text-3xl font-bold text-gray-900">{losses}</p>
                    <p className="text-sm text-gray-600 mt-1">Losses</p>
                </Card>
                <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100">
                    <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <p className="text-3xl font-bold text-gray-900">{winRate}%</p>
                    <p className="text-sm text-gray-600 mt-1">Win Rate</p>
                </Card>
            </div>

            {/* Upcoming Matches */}
            {upcomingMatches.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <Clock className="w-6 h-6 mr-2 text-primary-600" />
                        Upcoming Matches
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {upcomingMatches.map((match) => (
                            <Card key={match.id} className="p-6 border-l-4 border-primary-500">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{match.sport}</h3>
                                        <span className="inline-block px-3 py-1 mt-2 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                            {match.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2 text-primary-600" />
                                        {new Date(match.date).toLocaleDateString()} at {match.time}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                                        {match.venue}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Match History */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Trophy className="w-6 h-6 mr-2 text-primary-600" />
                    Match History
                </h2>
                <div className="space-y-4">
                    {completedMatches.map((match) => (
                        <Card key={match.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-4 mb-3">
                                        <h3 className="text-xl font-bold text-gray-900">{match.sport}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${match.result === 'Won'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {match.result}
                                        </span>
                                        {match.position === 1 && (
                                            <Trophy className="w-5 h-5 text-yellow-500" />
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2 text-primary-600" />
                                            {new Date(match.date).toLocaleDateString()} at {match.time}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                                            {match.venue}
                                        </div>
                                        {match.score && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Award className="w-4 h-4 mr-2 text-primary-600" />
                                                Score: {match.score}
                                            </div>
                                        )}
                                        {match.position && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Trophy className="w-4 h-4 mr-2 text-primary-600" />
                                                Position: {match.position} of {match.totalPlayers}
                                            </div>
                                        )}
                                    </div>
                                    {match.opponent && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            Opponent: <span className="font-medium">{match.opponent}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
