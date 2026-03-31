import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, MapPin, Clock, Star, Info, CheckCircle, AlertCircle, Loader2, Camera } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

/**
 * VenueManager Component
 * Admin interface for managing sports venues
 * Full CRUD operations with proper schema mapping
 */
export default function VenueManager() {
    const { venues = [], addVenue, updateVenue, deleteVenue, refreshVenues, loading = {} } = useData();

    // Force refresh on mount to ensure fresh data after backend restart
    useEffect(() => {
        refreshVenues();
    }, [refreshVenues]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVenue, setEditingVenue] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusMessage, setStatusMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const AVAILABLE_SPORTS = [
        'Tennis', 'Badminton', 'Basketball', 'Football',
        'Swimming', 'Cricket', 'Volleyball', 'Table Tennis'
    ];

    const AVAILABLE_AMENITIES = [
        'Parking', 'Changing Rooms', 'WiFi', 'Showers',
        'Cafeteria', 'Equipment Rental', 'Night Lights', 'Locker Room'
    ];

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        sports: [],
        amenities: [],
        pricePerHour: 0,
        openTime: '06:00',
        closeTime: '22:00',
        images: [],
        description: '',
    });

    // Filter venues based on search
    const filteredVenues = (venues || []).filter(venue =>
        (venue.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (venue.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Toggle items in arrays (sports/amenities)
    const toggleItem = (field, item) => {
        setFormData(prev => {
            const current = [...prev[field]];
            const index = current.indexOf(item);
            if (index > -1) {
                current.splice(index, 1);
            } else {
                current.push(item);
            }
            return { ...prev, [field]: current };
        });
    };

    // Open form for creating new venue
    const handleCreate = () => {
        setEditingVenue(null);
        setFormData({
            name: '',
            location: '',
            sports: [],
            amenities: [],
            pricePerHour: 2000,
            openTime: '06:00',
            closeTime: '22:00',
            images: [],
            description: '',
        });
        setIsFormOpen(true);
        setStatusMessage(null);
    };

    // Open form for editing existing venue
    const handleEdit = (venue) => {
        setEditingVenue(venue);
        setFormData({
            name: venue.name,
            location: venue.location,
            sports: venue.sports || [],
            amenities: venue.amenities || [],
            pricePerHour: parseFloat(venue.pricePerHour) || 0,
            openTime: venue.operatingHours?.open || '06:00',
            closeTime: venue.operatingHours?.close || '22:00',
            images: venue.images || [],
            description: venue.description || '',
        });
        setIsFormOpen(true);
        setStatusMessage(null);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            // Validate sports
            if (formData.sports.length === 0) {
                throw new Error('Please select at least one sport');
            }

            const payload = {
                name: formData.name,
                location: formData.location,
                sports: formData.sports,
                amenities: formData.amenities,
                pricePerHour: parseFloat(formData.pricePerHour),
                operatingHours: {
                    open: formData.openTime,
                    close: formData.closeTime
                },
                images: formData.images,
                description: formData.description
            };

            if (editingVenue) {
                await updateVenue(editingVenue.id, payload);
                setStatusMessage({ type: 'success', text: 'Venue updated successfully!' });
            } else {
                await addVenue(payload);
                setStatusMessage({ type: 'success', text: 'Venue created successfully!' });
            }

            // Close after short delay
            setTimeout(() => {
                setIsFormOpen(false);
                setEditingVenue(null);
            }, 1500);

        } catch (error) {
            console.error('❌ Venue save error:', error);
            setStatusMessage({
                type: 'error',
                text: error.message || 'Failed to save venue'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this venue? All associated events and bookings may be affected.')) {
            try {
                await deleteVenue(id);
            } catch (error) {
                alert('Failed to delete venue: ' + error.message);
            }
        }
    };

    if (loading.venues) {
        return (
            <div className="container-custom py-16 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                <p className="text-gray-600 font-medium">Loading venues...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Venue Manager
                    </h1>
                    <p className="text-gray-600">Manage sports complexes and facilities</p>
                </div>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Facility
                </Button>
            </div>

            {/* Search */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search venues by name or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </Card>

            {/* Venues List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.length > 0 ? (
                    filteredVenues.map((venue) => (
                        <Card key={venue.id} className="group overflow-hidden flex flex-col">
                            <div className="h-48 overflow-hidden relative bg-gray-100 flex items-center justify-center">
                                {venue.images?.length > 0 ? (
                                    <img
                                        src={venue.images[0]}
                                        alt={venue.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <Camera className="w-8 h-8 mb-2" />
                                        <span className="text-xs uppercase font-bold">No Image</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-1">
                                    <button
                                        onClick={() => handleEdit(venue)}
                                        className="p-2 bg-white/90 backdrop-blur shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                                        title="Edit Venue"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(venue.id)}
                                        className="p-2 bg-white/90 backdrop-blur shadow-sm text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                        title="Delete Venue"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{venue.name}</h3>
                                <div className="flex items-center text-xs text-gray-500 gap-1 mb-3">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{venue.location}</span>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {venue.sports?.slice(0, 3).map((sport, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                                            {sport}
                                        </span>
                                    ))}
                                    {venue.sports?.length > 3 && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-bold rounded">
                                            +{venue.sports.length - 3} MORE
                                        </span>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs text-gray-500">{venue.operatingHours?.open} - {venue.operatingHours?.close}</span>
                                    </div>
                                    <div className="text-sm font-bold text-primary-600">
                                        Rs {parseFloat(venue.pricePerHour).toLocaleString()}/hr
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full">
                        <Card className="p-16 text-center">
                            <MapPin className="w-20 h-20 mx-auto text-gray-200 mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No venues found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">Register new sports complexes to make them available for community bookings.</p>
                            <Button onClick={handleCreate} variant="outline" className="mt-8">
                                Register First Venue
                            </Button>
                        </Card>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-3xl max-h-[95vh] overflow-y-auto p-8 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                            <h2 className="text-2xl font-display font-bold text-gray-900">
                                {editingVenue ? 'Update Venue Profile' : 'Register New Sports Venue'}
                            </h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        {statusMessage && (
                            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <p className="text-sm font-medium">{statusMessage.text}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                        Venue Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="venue-input"
                                        placeholder="e.g. Royal Sports Arena"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        className="venue-input"
                                        placeholder="e.g. Plot 42, Block 4, Karachi"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
                                    Supported Sports
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_SPORTS.map(sport => (
                                        <button
                                            key={sport}
                                            type="button"
                                            onClick={() => toggleItem('sports', sport)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${formData.sports.includes(sport)
                                                ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                                                : 'bg-white border-gray-200 text-gray-500 hover:border-primary-400'
                                                }`}
                                        >
                                            {sport}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                        Price Per Hour (Rs)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Rs</span>
                                        <input
                                            type="number"
                                            name="pricePerHour"
                                            value={formData.pricePerHour}
                                            onChange={handleChange}
                                            min="0"
                                            required
                                            className="venue-input pl-10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                        Opening Time
                                    </label>
                                    <input
                                        type="time"
                                        name="openTime"
                                        value={formData.openTime}
                                        onChange={handleChange}
                                        required
                                        className="venue-input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                        Closing Time
                                    </label>
                                    <input
                                        type="time"
                                        name="closeTime"
                                        value={formData.closeTime}
                                        onChange={handleChange}
                                        required
                                        className="venue-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
                                    Available Amenities
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {AVAILABLE_AMENITIES.map(amenity => (
                                        <label key={amenity} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.amenities.includes(amenity)}
                                                onChange={() => toggleItem('amenities', amenity)}
                                                className="hidden"
                                            />
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.amenities.includes(amenity) ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300 group-hover:border-primary-400'
                                                }`}>
                                                {formData.amenities.includes(amenity) && <Plus className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <span className="text-sm text-gray-600">{amenity}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Venue Photo URL
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="url"
                                            name="image"
                                            value={formData.images[0] || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, images: [e.target.value] }))}
                                            className="venue-input pl-10"
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                    </div>
                                    {formData.images[0] && (
                                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Public Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="venue-input resize-none"
                                    placeholder="Write a brief overview of the venue facilities..."
                                />
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-gray-100">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1 py-4 font-bold"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingVenue ? 'Update Profile' : 'Create Listing')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 py-4 border border-gray-200"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <style>{`
                .venue-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background-color: #fcfcfd;
                    border: 1px solid #e0e0e0;
                    border-radius: 0.75rem;
                    color: #1a1a1a;
                    transition: all 0.2s;
                    font-size: 0.95rem;
                }
                .venue-input:focus {
                    outline: none;
                    border-color: #0d9488;
                    background-color: #fff;
                    box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.05);
                }
            `}</style>
        </div>
    );
}
