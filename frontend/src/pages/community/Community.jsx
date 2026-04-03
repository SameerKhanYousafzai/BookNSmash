import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Plus, Loader2, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function Community() {
    const { players = [], teams = [], addTeam, updateTeam, loading = {}, error: dataError } = useData();
    const { currentUser } = useAuth();
    const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [teamFormData, setTeamFormData] = useState({
        name: '',
        sport: '',
        description: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState(null);

    // Check if user has already created a team
    // Robustly handle teams array and currentUser
    const hasCreatedTeam = currentUser && (teams || []).some(t =>
        t.creatorUserId === currentUser.id ||
        t.createdBy === currentUser.id
    );

    const handleTeamFormChange = (e) => {
        const { name, value } = e.target;
        setTeamFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        setIsSubmitting(true);
        setLocalError(null);

        try {
            if (isEditing) {
                // Find existing team to update
                const existingTeam = (teams || []).find(t =>
                    t.creatorUserId === currentUser.id ||
                    t.createdBy === currentUser.id
                );

                if (existingTeam) {
                    await updateTeam({
                        ...existingTeam,
                        ...teamFormData,
                    });
                } else {
                    throw new Error('Could not find your team to update.');
                }
            } else {
                // Create new team
                const newTeam = {
                    name: teamFormData.name,
                    sport: teamFormData.sport,
                    description: teamFormData.description,
                    logo: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
                    members: 1,
                    wins: 0,
                    losses: 0,
                    captain: currentUser.name || 'Anonymous',
                    creatorUserId: currentUser.id,
                    createdBy: currentUser.id,
                };

                await addTeam(newTeam);
            }

            setIsTeamFormOpen(false);
            setTeamFormData({ name: '', sport: '', description: '' });
            setIsEditing(false);
        } catch (err) {
            console.error('❌ Team operation failed:', err);
            setLocalError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setTeamFormData({ name: '', sport: '', description: '' });
        setLocalError(null);
        setIsTeamFormOpen(true);
    };

    const openEditModal = (e, team) => {
        e.preventDefault();
        setIsEditing(true);
        setTeamFormData({
            name: team.name || '',
            sport: team.sport || '',
            description: team.description || '',
        });
        setLocalError(null);
        setIsTeamFormOpen(true);
    };

    // Loading State
    if (loading.players || loading.teams) {
        return (
            <div className="container-custom py-16 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                <p className="text-gray-600 font-medium">Loading community data...</p>
            </div>
        );
    }

    // Global Data Error
    if (dataError) {
        return (
            <div className="container-custom py-16 text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
                <p className="text-gray-600 mb-6">{dataError}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

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

                {players.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">No players found yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {players.map((player) => (
                            <Link key={player.id} to={`/community/player/${player.id}`}>
                                <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="p-6 text-center">
                                        <div className="relative inline-block mb-4">
                                            <img
                                                src={player.avatar || `https://i.pravatar.cc/150?u=${player.id}`}
                                                alt={player.name}
                                                className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-primary-100 group-hover:ring-primary-300 transition-all"
                                            />
                                            {player.isOnline && (
                                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                                            {player.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">{player.skillLevel || 'Intermediate'}</p>

                                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                                            {(player.sports || []).map((sport, idx) => (
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
                                                <div className="text-2xl font-bold text-gray-900">{player.matchesPlayed || 0}</div>
                                                <div className="text-xs text-gray-600">Matches</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-primary-600">{player.winRate || 0}%</div>
                                                <div className="text-xs text-gray-600">Win Rate</div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Teams Section */}
            <section className="space-y-8">
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Teams</h2>
                        <p className="text-gray-600 font-medium">Join or create competitive teams to elevate your game</p>
                    </div>
                    {!hasCreatedTeam && currentUser && (
                        <div className="flex justify-center w-full">
                            <Button onClick={openCreateModal} className="flex items-center gap-2 px-6 py-2.5 shadow-md hover:shadow-lg transition-all">
                                <Plus className="w-5 h-5" />
                                Create Your Team
                            </Button>
                        </div>
                    )}
                </div>

                {teams.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">No teams found yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map((team) => (
                            <Link key={team.id} to={`/community/team/${team.id}`}>
                                <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="p-6">
                                        <div className="flex items-start gap-4 mb-4">
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
                                                <div className="text-xl font-bold text-gray-900">{team.members || 0}</div>
                                                <div className="text-xs text-gray-600">Members</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl font-bold text-green-600">{team.wins || 0}</div>
                                                <div className="text-xs text-gray-600">Wins</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl font-bold text-red-600">{team.losses || 0}</div>
                                                <div className="text-xs text-gray-600">Losses</div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                            <div className="text-sm text-gray-600">
                                                Captain: <span className="font-semibold text-gray-900">{team.captain || 'Anonymous'}</span>
                                            </div>
                                            {currentUser && (team.creatorUserId === currentUser.id || team.createdBy === currentUser.id) ? (
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
                )}
            </section>

            {/* CTA Section */}
            {!currentUser && (
                <section className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 text-center text-white">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <h2 className="text-3xl font-display font-bold mb-4">
                        Join Our Community
                    </h2>
                    <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
                        Browse player profiles and teams to find your perfect match
                    </p>
                    <Link to="/login">
                        <Button variant="outline" className="text-white border-white hover:bg-white/10">
                            Sign In to Collaborate
                        </Button>
                    </Link>
                </section>
            )}

            {/* Team Creation/Edit Modal */}
            {isTeamFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-lg p-6 shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {isEditing ? 'Update Your Team' : 'Create Your Team'}
                        </h2>

                        {localError && (
                            <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-2 border border-red-100">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">{localError}</p>
                            </div>
                        )}

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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Tell us about your team..."
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> {isEditing ? 'Updating your team details.' : 'You can only create one team. You will be set as the captain.'}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        isEditing ? 'Update Team' : 'Create Team'
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsTeamFormOpen(false)}
                                    className="flex-1"
                                    disabled={isSubmitting}
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
