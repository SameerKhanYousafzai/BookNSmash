import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Upload, Trophy, Target, TrendingUp, Calendar, User } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import { players, sportsCategories } from '../../data/mockData';

export default function PlayerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    // Mock player data - in real app, would fetch from API
    const player = id === 'new' ? null : players.find(p => p.id === parseInt(id));

    const [formData, setFormData] = useState(player || {
        name: '',
        email: '',
        phone: '',
        bio: '',
        sports: [],
        skillLevel: 'Intermediate',
        avatar: 'https://i.pravatar.cc/150?img=12',
        matchesPlayed: 0,
        winRate: 0,
    });

    const [errors, setErrors] = useState({});

    const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.bio) newErrors.bio = 'Bio is required';
        if (formData.bio && formData.bio.length < 20) newErrors.bio = 'Bio must be at least 20 characters';
        if (formData.sports.length === 0) newErrors.sports = 'Select at least one sport';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            // Mock save
            alert('Profile saved successfully!');
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

    const toggleSport = (sport) => {
        const newSports = formData.sports.includes(sport)
            ? formData.sports.filter(s => s !== sport)
            : [...formData.sports, sport];
        setFormData({ ...formData, sports: newSports });
        if (errors.sports) {
            setErrors({ ...errors, sports: '' });
        }
    };

    const handlePhotoUpload = () => {
        // Mock photo upload
        alert('Photo upload functionality would be implemented here');
        setShowPhotoModal(false);
    };

    if (!player && id !== 'new') {
        return (
            <div className="container-custom py-16 text-center">
                <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Player Not Found</h2>
                <p className="text-gray-600 mb-6">The player profile you're looking for doesn't exist.</p>
                <Button onClick={() => navigate('/community')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Community
                </Button>
            </div>
        );
    }

    const isNewProfile = id === 'new';
    const isViewMode = !isNewProfile && !isEditing;

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
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <Card className="p-6 text-center sticky top-24">
                        <div className="relative inline-block mb-4">
                            <img
                                src={formData.avatar}
                                alt={formData.name || 'Player'}
                                className="w-32 h-32 rounded-full mx-auto object-cover ring-4 ring-primary-100"
                            />
                            {!isViewMode && (
                                <button
                                    onClick={() => setShowPhotoModal(true)}
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors shadow-lg"
                                >
                                    <Upload className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {isViewMode && (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{formData.name}</h2>
                                <p className="text-gray-600 mb-4">{formData.skillLevel}</p>

                                <div className="flex flex-wrap gap-2 justify-center mb-6">
                                    {formData.sports.map((sport, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold"
                                        >
                                            {sport}
                                        </span>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="text-3xl font-bold text-gray-900">{formData.matchesPlayed}</div>
                                        <div className="text-sm text-gray-600">Matches</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="text-3xl font-bold text-primary-600">{formData.winRate}%</div>
                                        <div className="text-sm text-gray-600">Win Rate</div>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                            </>
                        )}

                        {!isViewMode && (
                            <div className="text-left space-y-4">
                                <h3 className="font-semibold text-gray-900 text-center">
                                    {isNewProfile ? 'Create Your Profile' : 'Edit Profile'}
                                </h3>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {isViewMode ? (
                        <>
                            {/* About */}
                            <Card className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
                                <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
                            </Card>

                            {/* Stats */}
                            <Card className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Statistics</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Trophy className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">12</div>
                                            <div className="text-sm text-gray-600">Tournaments</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Target className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">8</div>
                                            <div className="text-sm text-gray-600">Wins</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <TrendingUp className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">1250</div>
                                            <div className="text-sm text-gray-600">Rating</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Recent Activity */}
                            <Card className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    {[
                                        { event: 'Won Tennis Match', date: '2 days ago', icon: Trophy },
                                        { event: 'Joined Basketball Tournament', date: '5 days ago', icon: Calendar },
                                        { event: 'Completed Badminton Match', date: '1 week ago', icon: Target },
                                    ].map((activity, idx) => (
                                        <div key={idx} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <activity.icon className="w-5 h-5 text-primary-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900">{activity.event}</div>
                                                <div className="text-sm text-gray-600">{activity.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </>
                    ) : (
                        <Card className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                                {isNewProfile ? 'Player Information' : 'Edit Information'}
                            </h3>
                            <div className="space-y-6">
                                <FormInput
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={errors.name}
                                    placeholder="John Doe"
                                    required
                                />

                                <FormInput
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    placeholder="you@example.com"
                                    required
                                />

                                <FormInput
                                    label="Phone Number"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Skill Level
                                    </label>
                                    <select
                                        name="skillLevel"
                                        value={formData.skillLevel}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    >
                                        {skillLevels.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sports <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {sportsCategories.map(sport => (
                                            <button
                                                key={sport.id}
                                                type="button"
                                                onClick={() => toggleSport(sport.name)}
                                                className={`p-3 rounded-lg border-2 transition-all ${formData.sports.includes(sport.name)
                                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-1">{sport.icon}</div>
                                                <div className="text-xs font-semibold">{sport.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.sports && <p className="mt-2 text-sm text-red-500">{errors.sports}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bio <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Tell us about yourself, your experience, and what you're looking for..."
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.bio ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.bio && <p className="mt-1 text-sm text-red-500">{errors.bio}</p>}
                                    <p className="mt-1 text-sm text-gray-500">
                                        {formData.bio.length}/500 characters (minimum 20)
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        variant="ghost"
                                        className="flex-1"
                                        onClick={() => {
                                            if (isNewProfile) {
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
                                        {isNewProfile ? 'Create Profile' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Photo Upload Modal */}
            {showPhotoModal && (
                <Modal
                    isOpen={showPhotoModal}
                    onClose={() => setShowPhotoModal(false)}
                    title="Upload Profile Photo"
                >
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                            <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={() => setShowPhotoModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handlePhotoUpload}
                            >
                                Upload
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
