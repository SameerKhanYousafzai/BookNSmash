import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, DollarSign, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import FormInput from '../../components/common/FormInput';
import { sportsCategories, venues } from '../../data/mockData';

export default function CreateMatch() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        sport: '',
        date: '',
        time: '',
        venue: '',
        skillLevel: 'Intermediate',
        maxPlayers: 4,
        price: 0,
        description: '',
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });

    const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.sport) newErrors.sport = 'Sport is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';
        if (!formData.venue) newErrors.venue = 'Venue is required';
        if (formData.maxPlayers < 2) newErrors.maxPlayers = 'Minimum 2 players required';
        if (formData.maxPlayers > 50) newErrors.maxPlayers = 'Maximum 50 players allowed';
        if (formData.price < 0) newErrors.price = 'Price cannot be negative';
        if (!formData.description) newErrors.description = 'Description is required';
        if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            // Mock create match
            setMessage({ type: 'success', text: 'Match created successfully! Redirecting...' });
            setTimeout(() => {
                navigate('/matches');
            }, 1500);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        // Clear error for this field
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };

    return (
        <div className="container-custom py-8 max-w-3xl">
            <Button
                variant="ghost"
                onClick={() => navigate('/matches')}
                className="mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Matches
            </Button>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-2">
                    Create a Match
                </h1>
                <p className="text-gray-600">Organize a game and find players to join</p>
            </div>

            <Card className="p-6 sm:p-8">
                {message.text && (
                    <div
                        className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${message.type === 'success'
                            ? 'bg-green-50 text-green-800'
                            : 'bg-red-50 text-red-800'
                            }`}
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sport Selection */}
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
                                <option key={sport.id} value={sport.name}>
                                    {sport.icon} {sport.name}
                                </option>
                            ))}
                        </select>
                        {errors.sport && <p className="mt-1 text-sm text-red-500">{errors.sport}</p>}
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.time ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time}</p>}
                        </div>
                    </div>

                    {/* Venue */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Venue <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.venue ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">Select a venue</option>
                            {venues.map(venue => (
                                <option key={venue.id} value={venue.name}>
                                    {venue.name} - {venue.location}
                                </option>
                            ))}
                        </select>
                        {errors.venue && <p className="mt-1 text-sm text-red-500">{errors.venue}</p>}
                    </div>

                    {/* Skill Level and Max Players */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <Users className="w-4 h-4 inline mr-1" />
                                Max Players <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="maxPlayers"
                                value={formData.maxPlayers}
                                onChange={handleChange}
                                min="2"
                                max="50"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.maxPlayers ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.maxPlayers && <p className="mt-1 text-sm text-red-500">{errors.maxPlayers}</p>}
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <DollarSign className="w-4 h-4 inline mr-1" />
                            Price per Person (RS)
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.price ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                        <p className="mt-1 text-sm text-gray-500">Set to 0 for free matches</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Describe the match, any special requirements, or what players should bring..."
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                        <p className="mt-1 text-sm text-gray-500">
                            {formData.description.length}/500 characters (minimum 20)
                        </p>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1"
                            onClick={() => navigate('/matches')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                        >
                            Create Match
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
