import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Plus } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function Community() {
    const { players, teams, addTeam, updateTeam } = useData();
    const { currentUser } = useAuth();
    const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [teamFormData, setTeamFormData] = useState({
        name: '',
        sport: '',
        description: '',
    });

    // Check if user has already created a team
    const userTeams = JSON.parse(localStorage.getItem('user_created_teams') || '{}');
    const hasCreatedTeam = currentUser && (
        userTeams[currentUser.id] ||
        teams.some(t => t.creatorUserId === currentUser.id || t.createdBy === currentUser.id)
    );

    const handleTeamFormChange = (e) => {
        const { name, value } = e.target;
        setTeamFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateTeam = (e) => {
        e.preventDefault();

        if (!currentUser) return;

        if (isEditing) {
            // Update existing team
            const teamId = userTeams[currentUser.id];
            const existingTeam = (teams || []).find(t => t.id === teamId || t.creatorUserId === currentUser.id || t.createdBy === currentUser.id);

            if (existingTeam) {
                const updatedTeam = {
                    ...existingTeam,
                    ...teamFormData,
                };
                updateTeam(updatedTeam);

                // Also update in booknsmash_teams for the profile page
                const allTeams = JSON.parse(localStorage.getItem('booknsmash_teams') || '[]');
                const updatedBooknsmashTeams = allTeams.map(t => t.id === existingTeam.id ? updatedTeam : t);
                localStorage.setItem('booknsmash_teams', JSON.stringify(updatedBooknsmashTeams));
            }
        } else {
            // Create new team
            const newTeam = {
                id: Date.now(),
                ...teamFormData,
                logo: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
                members: 1,
                wins: 0,
                losses: 0,
                captain: currentUser.name,
                creatorUserId: currentUser.id,
                createdBy: currentUser.id,
            };

            addTeam(newTeam);

            // Mark user as having created a team
            const updatedUserTeams = { ...userTeams, [currentUser.id]: newTeam.id };
            localStorage.setItem('user_created_teams', JSON.stringify(updatedUserTeams));

            // Also save to booknsmash_teams for the profile page
            const allTeams = JSON.parse(localStorage.getItem('booknsmash_teams') || '[]');
            localStorage.setItem('booknsmash_teams', JSON.stringify([...allTeams, newTeam]));
        }

        setIsTeamFormOpen(false);
        setTeamFormData({ name: '', sport: '', description: '' });
        setIsEditing(false);
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setTeamFormData({ name: '', sport: '', description: '' });
        setIsTeamFormOpen(true);
    };

    const openEditModal = (e, team) => {
        e.preventDefault(); // Prevent navigation
        setIsEditing(true);
        setTeamFormData({
            name: team.name,
            sport: team.sport,
            description: team.description || '',
        });
        setIsTeamFormOpen(true);
    };

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
            <section className="space-y-8">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Players</h2>
                    <p className="text-gray-600 font-medium">Find playing partners and connect with athletes around you</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(players || []).map((player) => (
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
            <section className="space-y-8">
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Teams</h2>
                        <p className="text-gray-600 font-medium">Join or create competitive teams to elevate your game</p>
                    </div>
                    {!hasCreatedTeam && (
                        <div className="flex justify-center w-full">
                            <Button onClick={openCreateModal} className="flex items-center gap-2 px-6 py-2.5 shadow-md hover:shadow-lg transition-all">
                                <Plus className="w-5 h-5" />
                                Create Your Team
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(teams || []).filter(team => team.creatorUserId !== currentUser?.id && team.createdBy !== currentUser?.id).map((team) => (
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

                                    <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            Captain: <span className="font-semibold text-gray-900">{team.captain}</span>
                                        </div>
                                        {currentUser && (team.creatorUserId === currentUser.id || team.createdBy === currentUser.id || team.id === userTeams[currentUser.id]) ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => openEditModal(e, team)}
                                                className="relative z-10"
                                            >
                                                Update Team
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                className="relative z-10"
                                                onClick={(e) => e.preventDefault()}
                                            >
                                                Join Team
                                            </Button>
                                        )}
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

            {/* Team Creation/Edit Modal */}
            {isTeamFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {isEditing ? 'Update Your Team' : 'Create Your Team'}
                        </h2>

                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Team Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={teamFormData.name}
                                    onChange={handleTeamFormChange}
                                    required
                                    className="input-field"
                                    placeholder="Thunder Strikers"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Sport *
                                </label>
                                <input
                                    type="text"
                                    name="sport"
                                    value={teamFormData.sport}
                                    onChange={handleTeamFormChange}
                                    required
                                    className="input-field"
                                    placeholder="Football"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={teamFormData.description}
                                    onChange={handleTeamFormChange}
                                    rows="3"
                                    className="input-field"
                                    placeholder="Tell us about your team..."
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> {isEditing ? 'Updating your team details.' : 'You can only create one team. You will be set as the captain.'}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" variant="primary" className="flex-1">
                                    {isEditing ? 'Update Team' : 'Create Team'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsTeamFormOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
