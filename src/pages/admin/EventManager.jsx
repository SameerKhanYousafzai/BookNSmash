import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Calendar } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

/**
 * EventManager Component
 * Admin interface for managing Events
 * Full CRUD operations: Create, Read, Update, Delete
 */
export default function EventManager() {
    const { events, addEvent, updateEvent, deleteEvent } = useData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        sport: '',
        date: '',
        time: '',
        location: '',
        participants: 0,
        maxParticipants: 0,
        image: '',
        price: 0,
        status: 'Open',
        description: '',
    });

    // Filter events based on search
    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
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
            location: '',
            participants: 0,
            maxParticipants: 64,
            image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
            price: 0,
            status: 'Open',
            description: '',
        });
        setIsFormOpen(true);
    };

    // Open form for editing existing event
    const handleEdit = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            sport: event.sport,
            date: event.date,
            time: event.time,
            location: event.location,
            participants: event.participants,
            maxParticipants: event.maxParticipants,
            image: event.image,
            price: event.price,
            status: event.status,
            description: event.description,
        });
        setIsFormOpen(true);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingEvent) {
            // Update existing event
            updateEvent({
                ...editingEvent,
                ...formData,
                participants: parseInt(formData.participants),
                maxParticipants: parseInt(formData.maxParticipants),
                price: parseFloat(formData.price),
            });
        } else {
            // Create new event
            addEvent({
                id: Date.now(),
                ...formData,
                participants: parseInt(formData.participants),
                maxParticipants: parseInt(formData.maxParticipants),
                price: parseFloat(formData.price),
            });
        }

        setIsFormOpen(false);
        setEditingEvent(null);
    };

    // Handle delete
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            deleteEvent(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Event Manager
                    </h1>
                    <p className="text-gray-600">Manage all events</p>
                </div>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Event
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
                {filteredEvents.map((event) => (
                    <Card key={event.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-gray-900">{event.title}</h3>
                                <p className="text-sm text-gray-600">{event.sport}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(event)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="text-gray-600">
                                <strong>Date:</strong> {event.date}
                            </div>
                            <div className="text-gray-600">
                                <strong>Venue:</strong> {event.location}
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Participants: {event.participants}/{event.maxParticipants}</span>
                                <span className={event.price > 0 ? 'text-primary-600 font-semibold' : 'text-green-600 font-semibold'}>
                                    {event.price > 0 ? `Rs${event.price}` : 'FREE'}
                                </span>
                            </div>
                            {event.description && (
                                <p className="text-gray-600 text-xs line-clamp-2">{event.description}</p>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {filteredEvents.length === 0 && (
                <Card className="p-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-600">Try adjusting your search or add a new event</p>
                </Card>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingEvent ? 'Edit Event' : 'Add New Event'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Event Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="Summer Tennis Championship"
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
                                        placeholder="Tennis"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                    >
                                        <option value="Open">Open</option>
                                        <option value="Full">Full</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Time *
                                    </label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Venue/Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="Central Sports Complex"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Current Participants
                                    </label>
                                    <input
                                        type="number"
                                        name="participants"
                                        value={formData.participants}
                                        onChange={handleChange}
                                        min="0"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Max Participants
                                    </label>
                                    <input
                                        type="number"
                                        name="maxParticipants"
                                        value={formData.maxParticipants}
                                        onChange={handleChange}
                                        min="1"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Entry Fee (Rs)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
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
                                    placeholder="Event details and description..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" variant="primary" className="flex-1">
                                    {editingEvent ? 'Update Event' : 'Create Event'}
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
