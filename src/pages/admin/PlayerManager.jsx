import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, User } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

/**
 * PlayerManager Component
 * Admin interface for managing Community player profiles
 * Full CRUD operations: Create, Read, Update, Delete
 */
export default function PlayerManager() {
    const { players, addPlayer, updatePlayer, deletePlayer } = useData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        sports: [],
        skillLevel: 'Beginner',
        matchesPlayed: 0,
        winRate: 0,
        bio: '',
        avatar: '',
    });

    // Filter players based on search
    const filteredPlayers = players.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.sports.some(sport => sport.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle sports multi-select
    const handleSportsChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            sports: value ? value.split(',').map(s => s.trim()) : []
        }));
    };

    // Open form for creating new player
    const handleCreate = () => {
        setEditingPlayer(null);
        setFormData({
            name: '',
            sports: [],
            skillLevel: 'Beginner',
            matchesPlayed: 0,
            winRate: 0,
            bio: '',
            avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        });
        setIsFormOpen(true);
    };

    // Open form for editing existing player
    const handleEdit = (player) => {
        setEditingPlayer(player);
        setFormData({
            name: player.name,
            sports: player.sports,
            skillLevel: player.skillLevel,
            matchesPlayed: player.matchesPlayed,
            winRate: player.winRate,
            bio: player.bio,
            avatar: player.avatar,
        });
        setIsFormOpen(true);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingPlayer) {
            // Update existing player
            updatePlayer({
                ...editingPlayer,
                ...formData,
                sports: Array.isArray(formData.sports) ? formData.sports : formData.sports.split(',').map(s => s.trim()),
            });
        } else {
            // Create new player
            addPlayer({
                id: Date.now(),
                ...formData,
                sports: Array.isArray(formData.sports) ? formData.sports : formData.sports.split(',').map(s => s.trim()),
            });
        }

        setIsFormOpen(false);
        setEditingPlayer(null);
    };

    // Handle delete
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this player profile?')) {
            deletePlayer(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Player Manager
                    </h1>
                    <p className="text-gray-600">Manage Community player profiles</p>
                </div>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Player
                </Button>
            </div>

            {/* Search */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search players by name or sport..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </Card>

            {/* Players List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers.map((player) => (
                    <Card key={player.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={player.avatar}
                                    alt={player.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="font-bold text-gray-900">{player.name}</h3>
                                    <p className="text-sm text-gray-600">{player.skillLevel}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(player)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(player.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex flex-wrap gap-1">
                                {player.sports.map((sport, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold"
                                    >
                                        {sport}
                                    </span>
                                ))}
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Matches: {player.matchesPlayed}</span>
                                <span>Win Rate: {player.winRate}%</span>
                            </div>
                            {player.bio && (
                                <p className="text-gray-600 text-xs line-clamp-2">{player.bio}</p>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {filteredPlayers.length === 0 && (
                <Card className="p-12 text-center">
                    <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No players found</h3>
                    <p className="text-gray-600">Try adjusting your search or add a new player</p>
                </Card>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingPlayer ? 'Edit Player' : 'Add New Player'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="Muhammad Sameer Khan"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Sports (comma-separated) *
                                </label>
                                <input
                                    type="text"
                                    value={Array.isArray(formData.sports) ? formData.sports.join(', ') : formData.sports}
                                    onChange={handleSportsChange}
                                    required
                                    className="input-field"
                                    placeholder="Tennis, Badminton, Basketball"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Skill Level *
                                    </label>
                                    <select
                                        name="skillLevel"
                                        value={formData.skillLevel}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="Professional">Professional</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Matches Played
                                    </label>
                                    <input
                                        type="number"
                                        name="matchesPlayed"
                                        value={formData.matchesPlayed}
                                        onChange={handleChange}
                                        min="0"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Win Rate (%)
                                </label>
                                <input
                                    type="number"
                                    name="winRate"
                                    value={formData.winRate}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="3"
                                    className="input-field"
                                    placeholder="Tell us about this player..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" variant="primary" className="flex-1">
                                    {editingPlayer ? 'Update Player' : 'Create Player'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsFormOpen(false)}
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
