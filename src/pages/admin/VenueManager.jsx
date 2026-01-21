import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, MapPin } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

/**
 * VenueManager Component
 * Admin interface for managing Venues
 * Full CRUD operations: Create, Read, Update, Delete
 */
export default function VenueManager() {
    const { venues, addVenue, updateVenue, deleteVenue } = useData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVenue, setEditingVenue] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        rating: 0,
        reviews: 0,
        sports: [],
        image: '',
        amenities: [],
        hours: '',
        priceRange: '',
        description: '',
    });

    // Filter venues based on search
    const filteredVenues = venues.filter(venue =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.sports.some(sport => sport.toLowerCase().includes(searchTerm.toLowerCase()))
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

    // Handle amenities multi-select
    const handleAmenitiesChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            amenities: value ? value.split(',').map(s => s.trim()) : []
        }));
    };

    // Open form for creating new venue
    const handleCreate = () => {
        setEditingVenue(null);
        setFormData({
            name: '',
            location: '',
            rating: 4.5,
            reviews: 0,
            sports: [],
            image: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=800',
            amenities: [],
            hours: 'Mon-Sun: 6:00 AM - 10:00 PM',
            priceRange: 'RS8,000-9,999/hour',
            description: '',
        });
        setIsFormOpen(true);
    };

    // Open form for editing existing venue
    const handleEdit = (venue) => {
        setEditingVenue(venue);
        setFormData({
            name: venue.name,
            location: venue.location,
            rating: venue.rating,
            reviews: venue.reviews,
            sports: venue.sports,
            image: venue.image,
            amenities: venue.amenities || [],
            hours: venue.hours,
            priceRange: venue.priceRange,
            description: venue.description,
        });
        setIsFormOpen(true);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingVenue) {
            // Update existing venue
            updateVenue({
                ...editingVenue,
                ...formData,
                rating: parseFloat(formData.rating),
                reviews: parseInt(formData.reviews),
                sports: Array.isArray(formData.sports) ? formData.sports : formData.sports.split(',').map(s => s.trim()),
                amenities: Array.isArray(formData.amenities) ? formData.amenities : formData.amenities.split(',').map(s => s.trim()),
            });
        } else {
            // Create new venue
            addVenue({
                id: Date.now(),
                ...formData,
                rating: parseFloat(formData.rating),
                reviews: parseInt(formData.reviews),
                sports: Array.isArray(formData.sports) ? formData.sports : formData.sports.split(',').map(s => s.trim()),
                amenities: Array.isArray(formData.amenities) ? formData.amenities : formData.amenities.split(',').map(s => s.trim()),
                images: [formData.image],
            });
        }

        setIsFormOpen(false);
        setEditingVenue(null);
    };

    // Handle delete
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this venue?')) {
            deleteVenue(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Venue Manager
                    </h1>
                    <p className="text-gray-600">Manage all venues</p>
                </div>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Venue
                </Button>
            </div>

            {/* Search */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search venues by name or sport..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </Card>

            {/* Venues List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map((venue) => (
                    <Card key={venue.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-gray-900">{venue.name}</h3>
                                <p className="text-sm text-gray-600">{venue.location}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(venue)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(venue.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex flex-wrap gap-1">
                                {venue.sports.map((sport, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold"
                                    >
                                        {sport}
                                    </span>
                                ))}
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Rating: {venue.rating}⭐</span>
                                <span>{venue.reviews} reviews</span>
                            </div>
                            <div className="text-gray-600">
                                <strong>Price:</strong> {venue.priceRange}
                            </div>
                            {venue.description && (
                                <p className="text-gray-600 text-xs line-clamp-2">{venue.description}</p>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {filteredVenues.length === 0 && (
                <Card className="p-12 text-center">
                    <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues found</h3>
                    <p className="text-gray-600">Try adjusting your search or add a new venue</p>
                </Card>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingVenue ? 'Edit Venue' : 'Add New Venue'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Venue Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="Khan Sports Complex"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Address/Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="123 Main Street, Karachi"
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

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Rating (0-5)
                                    </label>
                                    <input
                                        type="number"
                                        name="rating"
                                        value={formData.rating}
                                        onChange={handleChange}
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Reviews Count
                                    </label>
                                    <input
                                        type="number"
                                        name="reviews"
                                        value={formData.reviews}
                                        onChange={handleChange}
                                        min="0"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Price Range
                                    </label>
                                    <input
                                        type="text"
                                        name="priceRange"
                                        value={formData.priceRange}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="RS8,000-9,999/hour"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Amenities (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={Array.isArray(formData.amenities) ? formData.amenities.join(', ') : formData.amenities}
                                    onChange={handleAmenitiesChange}
                                    className="input-field"
                                    placeholder="Parking, Changing Rooms, WiFi"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Operating Hours
                                </label>
                                <input
                                    type="text"
                                    name="hours"
                                    value={formData.hours}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Mon-Sun: 6:00 AM - 10:00 PM"
                                />
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
                                    placeholder="Venue details and description..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" variant="primary" className="flex-1">
                                    {editingVenue ? 'Update Venue' : 'Create Venue'}
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
