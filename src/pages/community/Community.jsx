import { Link } from 'react-router-dom';
import { Users, Trophy } from 'lucide-react';
import Card from '../../components/common/Card';
import { teams } from '../../data/mockData';
import { useData } from '../../context/DataContext';

export default function Community() {
    const { players } = useData();
    return (
        <div className="container-custom py-8 space-y-12">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
                    Sports Community
                </h1>
                <p className="text-lg text-gray-600">
                    Connect with players and teams in your area
                </p>
            </div>

            {/* Players Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Players</h2>
                        <p className="text-gray-600">Find playing partners and connect with athletes</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {players.map((player) => (
                        <Link key={player.id} to={`/community/player/${player.id}`}>
                            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="p-6 text-center">
                                    <div className="relative inline-block mb-4">
                                        <img
                                            src={player.avatar}
                                            alt={player.name}
                                            className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-primary-100 group-hover:ring-primary-300 transition-all"
                                        />
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                                        {player.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">{player.skillLevel}</p>

                                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                                        {player.sports.map((sport, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold"
                                            >
                                                {sport}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{player.matchesPlayed}</div>
                                            <div className="text-xs text-gray-600">Matches</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-primary-600">{player.winRate}%</div>
                                            <div className="text-xs text-gray-600">Win Rate</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Teams Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Teams</h2>
                        <p className="text-gray-600">Join or create competitive teams</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <Link key={team.id} to={`/community/team/${team.id}`}>
                            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <img
                                            src={team.logo}
                                            alt={team.name}
                                            className="w-16 h-16 rounded-lg object-cover ring-2 ring-gray-200 group-hover:ring-primary-300 transition-all"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                                                {team.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">{team.sport}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                                        {team.description}
                                    </p>

                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-gray-900">{team.members}</div>
                                            <div className="text-xs text-gray-600">Members</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-green-600">{team.wins}</div>
                                            <div className="text-xs text-gray-600">Wins</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-red-600">{team.losses}</div>
                                            <div className="text-xs text-gray-600">Losses</div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="text-sm text-gray-600">
                                            Captain: <span className="font-semibold text-gray-900">{team.captain}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 text-center text-white">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <h2 className="text-3xl font-display font-bold mb-4">
                    Join Our Community
                </h2>
                <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                    Browse player profiles and teams to find your perfect match
                </p>
            </section>
        </div>
    );
}
