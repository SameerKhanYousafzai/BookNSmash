import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Calendar, MapPin, Clock, Info, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, X, Users } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';

/**
 * EventManager Component
 * Admin interface for managing Events
 * Full CRUD operations: Create, Read, Update, Delete
 */
export default function EventManager() {
    const { events = [], venues = [], addEvent, updateEvent, deleteEvent, refreshEvents, refreshVenues, loading = {} } = useData();

    // Force refresh on mount to ensure fresh data after backend restart
    useEffect(() => {
        refreshEvents();
        refreshVenues(); // Also refresh venues to ensure dropdown is accurate
    }, [refreshEvents, refreshVenues]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusMessage, setStatusMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Registrants Tracking
    const [registrants, setRegistrants] = useState(null);
    const [loadingRegistrants, setLoadingRegistrants] = useState(false);

    const fetchRegistrants = async (eventId) => {
        const targetEvent = events.find(e => e.id === eventId);
        if (!targetEvent) return;

        setRegistrants({ event: targetEvent, data: [] });
        setLoadingRegistrants(true);

        try {
            const res = await api.get(`/events/${eventId}/registrations`);
            if (res.ok) {
                const data = await res.json();
                setRegistrants({ event: targetEvent, data: data.registrations || [] });
            } else {
                setStatusMessage({ type: 'error', text: 'Failed to fetch registrants.' });
                setRegistrants(null);
            }
        } catch (err) {
            console.error("Registrants error:", err);
            setStatusMessage({ type: 'error', text: 'Error fetching registrants.' });
            setRegistrants(null);
        } finally {
            setLoadingRegistrants(false);
        }
    };

    const [formData, setFormData] = useState({
        title: '',
        sport: '',
        date: '',
        time: '',
        venueId: '',
        maxParticipants: 64,
        description: '',
        entryFee: 0,
        status: 'UPCOMING',
    });

    // Helper: Find venue name by ID
    const getVenueName = (venueId) => {
        const venue = venues.find(v => v.id === venueId);
        return venue ? venue.name : 'Unknown Venue';
    };

    // Filter events based on search
    const filteredEvents = (events || []).filter(event =>
        (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        getVenueName(event.venueId).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Open form for creating new event
    const handleCreate = () => {
        setEditingEvent(null);
        setFormData({
            title: '',
            sport: '',
            date: '',
            time: '',
            venueId: venues[0]?.id || '',
            maxParticipants: 64,
            description: '',
            entryFee: 0,
            status: 'UPCOMING',
            image_url: '',
        });
        setIsFormOpen(true);
        setStatusMessage(null);
    };

    // Open form for editing existing event
    const handleEdit = (event) => {
        setEditingEvent(event);
        const startDate = new Date(event.startDate);
        setFormData({
            title: event.title,
            sport: event.sport,
            date: startDate.toISOString().split('T')[0],
            time: startDate.toTimeString().split(' ')[0].substring(0, 5),
            venueId: event.venueId,
            maxParticipants: event.maxParticipants,
            description: event.description || '',
            entryFee: parseFloat(event.entryFee) || 0,
            status: event.status,
            image_url: event.imageUrl || '',
        });
        setIsFormOpen(true);
        setStatusMessage(null);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        console.log('🚀 [EventManager] Form submission attempt');
        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            // Validate all required fields
            if (!formData.title || !formData.sport || !formData.date || !formData.time || !formData.venueId) {
                console.warn('⚠️ [EventManager] Validation failed: missing fields', formData);
                throw new Error('Please fill in all required fields (Title, Sport, Date, Time, Venue)');
            }

            // Construct ISO dates
            const startDateTime = new Date(`${formData.date}T${formData.time}`);
            if (isNaN(startDateTime.getTime())) {
                throw new Error('Invalid date or time format selected');
            }

            // Default duration 2 hours
            const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);

            const payload = {
                title: formData.title.trim(),
                description: (formData.description || '').trim(),
                sport: formData.sport.trim(),
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                venueId: formData.venueId,
                maxParticipants: parseInt(formData.maxParticipants) || 1,
                entryFee: parseFloat(formData.entryFee) || 0,
                status: formData.status || 'UPCOMING',
                image_url: (formData.image_url || '').trim()
            };

            const token = localStorage.getItem('accessToken');
            const role = localStorage.getItem('userRole');
            console.log('🔑 [EventManager] Pre-flight Check - Token exists:', !!token, 'Role:', role);

            console.log('🌏 [EventManager] Dispatching API request...', payload);

            if (editingEvent) {
                    await updateEvent(editingEvent.id, payload);
                    setStatusMessage({ type: 'success', text: 'Event updated successfully.' });
                } else {
                    const result = await addEvent(payload);
                    if (result?.warning) {
                        setStatusMessage({ type: 'warning', text: `Event created! Note: ${result.warning}` });
                    } else {
                        setStatusMessage({ type: 'success', text: 'Event created successfully.' });
                    }
                }

            console.log('✅ [EventManager] Persistence successful');

            // Close after short delay
            setTimeout(() => {
                setIsFormOpen(false);
                setEditingEvent(null);
            }, 1500);

        } catch (error) {
            console.error('❌ [EventManager] Submission failed:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to save event. Check your connection.';
            setStatusMessage({ type: 'error', text: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                await deleteEvent(id);
            } catch (error) {
                alert('Failed to delete event: ' + error.message);
            }
        }
    };

    if (loading.events) {
        return (
            <div className="container-custom py-16 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                <p className="text-gray-600 font-medium">Loading events...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Event Manager
                    </h1>
                    <p className="text-gray-600">Schedule and manage sports events</p>
                </div>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Event
                </Button>
            </div>

            {/* Search */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search events by title or venue..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </Card>

            {/* Events List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <Card key={event.id} className="group overflow-hidden flex flex-col">
                            {event.imageUrl ? (
                                <div className="h-48 w-full overflow-hidden bg-gray-100 shrink-0">
                                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            ) : (
                                <div className="h-48 w-full bg-gray-100 flex flex-col items-center justify-center shrink-0 border-b border-gray-100">
                                    <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
                                    <span className="text-xs text-gray-400 font-medium tracking-wide">NO COVER IMAGE</span>
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-wider rounded">
                                                {event.sport}
                                            </span>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${event.status === 'UPCOMING' ? 'bg-green-50 text-green-700' :
                                                event.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                                                    'bg-blue-50 text-blue-700'
                                                }`}>
                                                {event.status}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{event.title}</h3>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); fetchRegistrants(event.id); }}
                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                            title="View Registrants"
                                        >
                                            <Users className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(event)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Edit Event"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(event.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete Event"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 py-3 border-t border-gray-100">
                                    <div className="flex items-center text-sm text-gray-600 gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>{new Date(event.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="truncate">{getVenueName(event.venueId)}</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="text-xs text-gray-400">
                                        {event.registeredCount || event.participantCount || 0} / {event.maxParticipants > 0 ? event.maxParticipants : '∞'} spots filled
                                    </div>
                                    <div className="text-sm font-bold text-primary-600">
                                        {parseFloat(event.entryFee) > 0 ? `Rs ${parseFloat(event.entryFee).toLocaleString()}` : 'FREE'}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full">
                        <Card className="p-16 text-center">
                            <Calendar className="w-20 h-20 mx-auto text-gray-200 mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No events found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">Try adjusting your search criteria or create a new event for the community.</p>
                            <Button onClick={handleCreate} variant="outline" className="mt-8">
                                Add First Event
                            </Button>
                        </Card>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl max-h-[95vh] overflow-y-auto p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                            <h2 className="text-2xl font-display font-bold text-gray-900">
                                {editingEvent ? 'Update Event Details' : 'Create New Sports Event'}
                            </h2>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        {statusMessage && (
                            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-top duration-300 ${
                                statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                                statusMessage.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                <p className="text-sm font-medium">{statusMessage.text}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                                    Event Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="input-field-new"
                                    placeholder="e.g. Summer Tennis Championship"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                                        Sport Category
                                    </label>
                                    <input
                                        type="text"
                                        name="sport"
                                        value={formData.sport}
                                        onChange={handleChange}
                                        required
                                        className="input-field-new"
                                        placeholder="e.g. Tennis, Cricket"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                                        Initial Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        required
                                        className="input-field-new"
                                    >
                                        <option value="UPCOMING">Upcoming</option>
                                        <option value="ONGOING">Ongoing</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="input-field-new"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        required
                                        className="input-field-new"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                                    Venue Selection
                                </label>
                                <select
                                    name="venueId"
                                    value={formData.venueId}
                                    onChange={handleChange}
                                    required
                                    className="input-field-new"
                                >
                                    <option value="" disabled>Select a venue...</option>
                                    {venues.map(venue => (
                                        <option key={venue.id} value={venue.id}>
                                            {venue.name} — {venue.location}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                                        Max Participants
                                    </label>
                                    <input
                                        type="number"
                                        name="maxParticipants"
                                        value={formData.maxParticipants}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                        className="input-field-new"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                                        Entry Fee (Rs)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs</span>
                                        <input
                                            type="number"
                                            name="entryFee"
                                            value={formData.entryFee}
                                            onChange={handleChange}
                                            min="0"
                                            className="input-field-new pl-12"
                                            placeholder="0 for FREE"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                                    Description & Rules
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="input-field-new resize-none"
                                    placeholder="Enter event details, registration requirements, or tournament rules..."
                                />
                            </div>

                            {/* Image URL Area */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                                    Image URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    name="image_url"
                                    value={formData.image_url || ''}
                                    onChange={handleChange}
                                    className="input-field-new"
                                    placeholder="https://images.unsplash.com/... or cloud storage link"
                                />
                                {formData.image_url && (
                                    <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                                        <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover" onError={(e) => {e.target.style.display = 'none'}} />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1 py-4 text-lg font-bold"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                            Processing...
                                        </span>
                                    ) : (
                                        editingEvent ? 'Update Event Profile' : 'Create Event Now'
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 py-4 text-lg border border-gray-200"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Registrants Modal */}
            {registrants && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-2xl font-display font-bold text-gray-900">
                                    Registrants for {registrants.event.title}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {registrants.data.length} / {registrants.event.maxParticipants > 0 ? registrants.event.maxParticipants : '∞'} slots currently booked
                                </p>
                            </div>
                            <button
                                onClick={() => setRegistrants(null)}
                                className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all p-2"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto flex-1 bg-gray-50 rounded-xl border border-gray-100">
                            {loadingRegistrants ? (
                                <div className="p-12 flex flex-col items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-4" />
                                    <p className="text-gray-500 font-medium tracking-wide">Fetching live registry...</p>
                                </div>
                            ) : registrants.data.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-100/80 sticky top-0 backdrop-blur-sm shadow-sm z-10">
                                        <tr>
                                            <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Player Name</th>
                                            <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Registered At</th>
                                            <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {registrants.data.map((reg, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{reg.userName || 'Unknown'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.userEmail || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(reg.registeredAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded">
                                                        {reg.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-16 text-center flex flex-col items-center justify-center">
                                    <Users className="w-16 h-16 text-gray-200 mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Registrants Yet</h3>
                                    <p className="text-gray-500">This event hasn't received any bookings.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            <style>{`
                .input-field-new {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background-color: #f9fafb;
                    border: 2px solid #e5e7eb;
                    border-radius: 0.75rem;
                    color: #111827;
                    transition: all 0.2s;
                    font-size: 1rem;
                }
                .input-field-new:focus {
                    outline: none;
                    border-color: #0d9488;
                    background-color: #fff;
                    box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
                }
            `}</style>
        </div>
    );
}
