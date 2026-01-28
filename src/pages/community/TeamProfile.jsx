import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Upload, Users, UserPlus, UserMinus, Trophy } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import { teams, sportsCategories, players } from '../../data/mockData';

export default function TeamProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);

    const team = id === 'new' ? null : teams.find(t => t.id === parseInt(id));

    const [formData, setFormData] = useState(team || {
        name: '',
        sport: '',
        description: '',
        captain: '',
        logo: 'https://i.pravatar.cc/150?img=60',
        members: 0,
        wins: 0,
        losses: 0,
    });

    const [errors, setErrors] = useState({});
    const [selectedPlayer, setSelectedPlayer] = useState('');

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) newErrors.name = 'Team name is required';
        if (!formData.sport) newErrors.sport = 'Sport is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (formData.description && formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';
        if (!formData.captain) newErrors.captain = 'Captain name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            alert('Team saved successfully!');
            setIsEditing(false);
            if (id === 'new') {
                navigate('/community');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleInvitePlayer = () => {
        if (selectedPlayer) {
            alert(`Invitation sent to ${selectedPlayer}!`);
            setSelectedPlayer('');
        }
    };

    if (!team && id !== 'new') {
        return (
            <div className="container-custom py-16 text-center">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Not Found</h2>
                <p className="text-gray-600 mb-6">The team you're looking for doesn't exist.</p>
                <Button onClick={() => navigate('/community')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Community
                </Button>
            </div>
        );
    }

    const isNewTeam = id === 'new';
    const isViewMode = !isNewTeam && !isEditing;

    // Mock team members
    const teamMembers = players.slice(0, 5);

    return (
        <div className="container-custom py-8 max-w-5xl">
            <Button
                variant="ghost"
                onClick={() => navigate('/community')}
                className="mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Community
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Team Card */}
                <div className="lg:col-span-1">
                    <Card className="p-6 text-center sticky top-24">
                        <div className="relative inline-block mb-4">
                            <img
                                src={formData.logo}
                                alt={formData.name || 'Team'}
                                className="w-32 h-32 rounded-lg mx-auto object-cover ring-4 ring-primary-100"
                            />
                            {!isViewMode && (
                                <button
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors shadow-lg"
                                >
                                    <Upload className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {isViewMode && (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{formData.name}</h2>
                                <p className="text-gray-600 mb-4">{formData.sport}</p>

                                <div className="grid grid-cols-3 gap-2 mb-6">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="text-2xl font-bold text-gray-900">{formData.members}</div>
                                        <div className="text-xs text-gray-600">Members</div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3">
                                        <div className="text-2xl font-bold text-green-600">{formData.wins}</div>
                                        <div className="text-xs text-gray-600">Wins</div>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-3">
                                        <div className="text-2xl font-bold text-red-600">{formData.losses}</div>
                                        <div className="text-xs text-gray-600">Losses</div>
                                    </div>
                                </div>

                                <div className="mb-6 pb-6 border-b border-gray-200">
                                    <div className="text-sm text-gray-600">Team Captain</div>
                                    <div className="font-semibold text-gray-900">{formData.captain}</div>
                                </div>

                                <div className="space-y-2">
                                    <Button
                                        variant="primary"
                                        className="w-full"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Team
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setShowManageModal(true)}
                                    >
                                        <Users className="w-4 h-4 mr-2" />
                                        Manage Members
                                    </Button>
                                </div>
                            </>
                        )}
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {isViewMode ? (
                        <>
                            {/* About */}
                            <Card className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">About the Team</h3>
                                <p className="text-gray-700 leading-relaxed">{formData.description}</p>
                            </Card>

                            {/* Team Members */}
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Team Members</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowManageModal(true)}
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Invite
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {teamMembers.map((member, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={member.avatar}
                                                    alt={member.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                                <div>
                                                    <div className="font-semibold text-gray-900">{member.name}</div>
                                                    <div className="text-sm text-gray-600">{member.skillLevel}</div>
                                                </div>
                                            </div>
                                            {idx === 0 && (
                                                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                                                    Captain
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Recent Matches */}
                            <Card className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Matches</h3>
                                <div className="space-y-3">
                                    {[
                                        { opponent: 'Team Alpha', result: 'Win', score: '3-1', date: '2 days ago' },
                                        { opponent: 'Team Beta', result: 'Loss', score: '1-2', date: '5 days ago' },
                                        { opponent: 'Team Gamma', result: 'Win', score: '2-0', date: '1 week ago' },
                                    ].map((match, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Trophy className={`w-8 h-8 ${match.result === 'Win' ? 'text-green-600' : 'text-red-600'}`} />
                                                <div>
                                                    <div className="font-semibold text-gray-900">vs {match.opponent}</div>
                                                    <div className="text-sm text-gray-600">{match.date}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-bold ${match.result === 'Win' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {match.result}
                                                </div>
                                                <div className="text-sm text-gray-600">{match.score}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </>
                    ) : (
                        <Card className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                                {isNewTeam ? 'Create Team' : 'Edit Team'}
                            </h3>
                            <div className="space-y-6">
                                <FormInput
                                    label="Team Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={errors.name}
                                    placeholder="Thunder Strikers"
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sport <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="sport"
                                        value={formData.sport}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.sport ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select a sport</option>
                                        {sportsCategories.map(sport => (
                                            <option key={sport.id} value={sport.name}>{sport.name}</option>
                                        ))}
                                    </select>
                                    {errors.sport && <p className="mt-1 text-sm text-red-500">{errors.sport}</p>}
                                </div>

                                <FormInput
                                    label="Captain Name"
                                    name="captain"
                                    value={formData.captain}
                                    onChange={handleChange}
                                    error={errors.captain}
                                    placeholder="Full Name"
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Team Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Describe your team, playing style, and what you're looking for in new members..."
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                    <p className="mt-1 text-sm text-gray-500">
                                        {formData.description.length}/500 characters (minimum 20)
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        variant="ghost"
                                        className="flex-1"
                                        onClick={() => {
                                            if (isNewTeam) {
                                                navigate('/community');
                                            } else {
                                                setIsEditing(false);
                                            }
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        onClick={handleSave}
                                    >
                                        {isNewTeam ? 'Create Team' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Manage Members Modal */}
            {showManageModal && (
                <Modal
                    isOpen={showManageModal}
                    onClose={() => setShowManageModal(false)}
                    title="Manage Team Members"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Invite Player
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedPlayer}
                                    onChange={(e) => setSelectedPlayer(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Select a player</option>
                                    {players.map(player => (
                                        <option key={player.id} value={player.name}>{player.name}</option>
                                    ))}
                                </select>
                                <Button
                                    variant="primary"
                                    onClick={handleInvitePlayer}
                                    disabled={!selectedPlayer}
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Invite
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3">Current Members</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {teamMembers.map((member, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={member.avatar}
                                                alt={member.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-900 text-sm">{member.name}</div>
                                                <div className="text-xs text-gray-600">{member.skillLevel}</div>
                                            </div>
                                        </div>
                                        {idx !== 0 && (
                                            <button className="text-red-600 hover:text-red-700 p-2">
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
