import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Calendar, MapPin, Users, DollarSign, Trophy } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { upcomingEvents, sportsCategories } from '../../data/mockData';

export default function Events() {
    const [filters, setFilters] = useState({
        sport: '',
        status: '',
        priceRange: 'all',
    });

    const filteredEvents = upcomingEvents.filter(event => {
        if (filters.sport && event.sport !== filters.sport) return false;
        if (filters.status && event.status !== filters.status) return false;
        if (filters.priceRange === 'free' && event.price > 0) return false;
        if (filters.priceRange === 'paid' && event.price === 0) return false;
        return true;
    });

    return (
        <div className="container-custom py-8 space-y-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
                    Events & Tournaments
                </h1>
                <p className="text-lg text-gray-600">
                    Compete in exciting tournaments and join community events
                </p>
            </div>

            {/* Filters */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sport
                        </label>
                        <select
                            value={filters.sport}
                            onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">All Sports</option>
                            {sportsCategories.map(sport => (
                                <option key={sport.id} value={sport.name}>{sport.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="Open">Open for Registration</option>
                            <option value="Full">Full</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price
                        </label>
                        <select
                            value={filters.priceRange}
                            onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="all">All Events</option>
                            <option value="free">Free Events</option>
                            <option value="paid">Paid Events</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setFilters({ sport: '', status: '', priceRange: 'all' })}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
                Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                    <Link key={event.id} to={`/events/${event.id}`}>
                        <Card className="group cursor-pointer h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="relative h-56 rounded-t-xl overflow-hidden">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${event.status === 'Open'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-red-500 text-white'
                                        }`}>
                                        {event.status}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-2 text-white">
                                        <Trophy className="w-5 h-5" />
                                        <span className="text-sm font-semibold">{event.sport}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">
                                    {event.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {event.description}
                                </p>
                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-primary-600" />
                                        {new Date(event.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                                        {event.location}
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-2 text-primary-600" />
                                        {event.participants}/{event.maxParticipants} registered
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    {event.price > 0 ? (
                                        <div>
                                            <div className="text-xs text-gray-500">Entry Fee</div>
                                            <div className="text-2xl font-bold text-primary-600">
                                                ${event.price}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-lg font-bold text-green-600">
                                            FREE
                                        </div>
                                    )}
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="group-hover:shadow-lg"
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

            {filteredEvents.length === 0 && (
                <div className="text-center py-16">
                    <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-600">Try adjusting your filters to see more events</p>
                </div>
            )}
        </div>
    );
}
