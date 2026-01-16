import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Filter, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { venues, sportsCategories } from '../../data/mockData';

export default function Venues() {
    const [filters, setFilters] = useState({
        sport: '',
        search: '',
        rating: 0,
    });

    const filteredVenues = venues.filter(venue => {
        if (filters.sport && !venue.sports.includes(filters.sport)) return false;
        if (filters.search && !venue.name.toLowerCase().includes(filters.search.toLowerCase()) &&
            !venue.location.toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (filters.rating && venue.rating < filters.rating) return false;
        return true;
    });

    return (
        <div className="container-custom py-8 space-y-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
                    Find Your Perfect Venue
                </h1>
                <p className="text-lg text-gray-600">
                    Discover top-rated sports facilities in your area
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
                            <Search className="w-4 h-4 inline mr-1" />
                            Search
                        </label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            placeholder="Venue name or location..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
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
                            Minimum Rating
                        </label>
                        <select
                            value={filters.rating}
                            onChange={(e) => setFilters({ ...filters, rating: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="0">Any Rating</option>
                            <option value="4.0">4.0+ Stars</option>
                            <option value="4.5">4.5+ Stars</option>
                            <option value="4.8">4.8+ Stars</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setFilters({ sport: '', search: '', rating: 0 })}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
                Showing {filteredVenues.length} {filteredVenues.length === 1 ? 'venue' : 'venues'}
            </div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map((venue) => (
                    <Link key={venue.id} to={`/venues/${venue.id}`}>
                        <Card className="group cursor-pointer h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="relative h-56 rounded-t-xl overflow-hidden">
                                <img
                                    src={venue.image}
                                    alt={venue.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-1 flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold text-gray-900">{venue.rating}</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">
                                    {venue.name}
                                </h3>
                                <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary-600" />
                                    <span>{venue.location}</span>
                                </div>

                                {/* Sports Tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {venue.sports.slice(0, 3).map((sport, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold"
                                        >
                                            {sport}
                                        </span>
                                    ))}
                                    {venue.sports.length > 3 && (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                                            +{venue.sports.length - 3} more
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {venue.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div>
                                        <div className="text-xs text-gray-500">Price Range</div>
                                        <div className="font-semibold text-gray-900">{venue.priceRange}</div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {venue.reviews} reviews
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

            {filteredVenues.length === 0 && (
                <div className="text-center py-16">
                    <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues found</h3>
                    <p className="text-gray-600">Try adjusting your filters to see more venues</p>
                </div>
            )}
        </div>
    );
}
