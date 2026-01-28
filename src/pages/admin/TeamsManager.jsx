import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Users } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

/**
 * TeamsManager Component
 * Admin interface for managing Teams
 * Full CRUD operations: Create, Read, Update, Delete
 */
export default function TeamsManager() {
    const { teams, addTeam, updateTeam, deleteTeam } = useData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        sport: '',
        logo: '',
        members: 0,
        wins: 0,
        losses: 0,
        captain: '',
        description: '',
    });

    // Filter teams based on search
    const filteredTeams = (teams || []).filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.captain.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Open form for creating new team
    const handleCreate = () => {
        setEditingTeam(null);
        setFormData({
            name: '',
            sport: '',
            logo: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
            members: 1,
            wins: 0,
            losses: 0,
            captain: '',
            description: '',
        });
        setIsFormOpen(true);
    };

    // Open form for editing existing team
    const handleEdit = (team) => {
        setEditingTeam(team);
        setFormData({
            name: team.name,
            sport: team.sport,
            logo: team.logo,
            members: team.members,
            wins: team.wins,
            losses: team.losses,
            captain: team.captain,
            description: team.description,
        });
        setIsFormOpen(true);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingTeam) {
            // Update existing team
            updateTeam({
                ...editingTeam,
                ...formData,
                members: parseInt(formData.members),
                wins: parseInt(formData.wins),
                losses: parseInt(formData.losses),
            });
        } else {
            // Create new team
            addTeam({
                id: Date.now(),
                ...formData,
                members: parseInt(formData.members),
                wins: parseInt(formData.wins),
                losses: parseInt(formData.losses),
            });
        }

        setIsFormOpen(false);
        setEditingTeam(null);
    };

    // Handle delete
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this team?')) {
            deleteTeam(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Teams Manager
                    </h1>
                    <p className="text-gray-600">Manage all teams</p>
                </div>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Team
                </Button>
            </div>

            {/* Search */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search teams by name, sport, or captain..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </Card>

            {/* Teams List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => (
                    <Card key={team.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={team.logo}
                                    alt={team.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div>
                                    <h3 className="font-bold text-gray-900">{team.name}</h3>
                                    <p className="text-sm text-gray-600">{team.sport}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(team)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(team.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="text-gray-600">
                                <strong>Captain:</strong> {team.captain}
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Members: {team.members}</span>
                                <span className="text-green-600 font-semibold">W: {team.wins}</span>
                                <span className="text-red-600 font-semibold">L: {team.losses}</span>
                            </div>
                            {team.description && (
                                <p className="text-gray-600 text-xs line-clamp-2">{team.description}</p>
                            )}
                            {team.createdBy && (
                                <div className="pt-2 mt-2 border-t border-gray-100 text-[10px] text-gray-400">
                                    Created by User ID: {team.createdBy}
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {filteredTeams.length === 0 && (
                <Card className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No teams found</h3>
                    <p className="text-gray-600">Try adjusting your search or add a new team</p>
                </Card>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingTeam ? 'Edit Team' : 'Add New Team'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Team Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="Thunder Strikers"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Sport *
                                    </label>
                                    <input
                                        type="text"
                                        name="sport"
                                        value={formData.sport}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                        placeholder="Football"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Captain *
                                    </label>
                                    <input
                                        type="text"
                                        name="captain"
                                        value={formData.captain}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                        placeholder="Captain Name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Members
                                    </label>
                                    <input
                                        type="number"
                                        name="members"
                                        value={formData.members}
                                        onChange={handleChange}
                                        min="1"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Wins
                                    </label>
                                    <input
                                        type="number"
                                        name="wins"
                                        value={formData.wins}
                                        onChange={handleChange}
                                        min="0"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Losses
                                    </label>
                                    <input
                                        type="number"
                                        name="losses"
                                        value={formData.losses}
                                        onChange={handleChange}
                                        min="0"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="input-field"
                                    placeholder="Team description..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" variant="primary" className="flex-1">
                                    {editingTeam ? 'Update Team' : 'Create Team'}
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
