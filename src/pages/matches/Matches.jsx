import { useState } from 'react';
import { FaMoneyBillWave } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { Filter, MapPin, Calendar, Users, DollarSign, Plus, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { matches, sportsCategories } from '../../data/mockData';


export default function Matches() {
    const [filters, setFilters] = useState({
        sport: '',
        date: '',
        location: '',
    });
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [showJoinModal, setShowJoinModal] = useState(false);

    const filteredMatches = matches.filter(match => {
        if (filters.sport && match.sport !== filters.sport) return false;
        if (filters.date && match.date !== filters.date) return false;
        if (filters.location && !match.venue.toLowerCase().includes(filters.location.toLowerCase())) return false;
        return true;
    });

    const handleJoinMatch = (match) => {
        setSelectedMatch(match);
        setShowJoinModal(true);
    };

    const confirmJoin = () => {
        // Mock join action
        alert(`Successfully joined ${selectedMatch.sport} match!`);
        setShowJoinModal(false);
        setSelectedMatch(null);
    };

    return (
        <div className="container-custom py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-2">
                        Find a Match
                    </h1>
                    <p className="text-gray-600">Join pickup games and find playing partners</p>
                </div>
                <Link to="/matches/create">
                    <Button variant="primary" size="lg">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Match
                    </Button>
                </Link>
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
                            Date
                        </label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            placeholder="Search location..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setFilters({ sport: '', date: '', location: '' })}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
                Showing {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'}
            </div>

            {/* Matches Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredMatches.map((match) => (
                    <Card key={match.id} className="p-6 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-2xl">
                                    {sportsCategories.find(s => s.name === match.sport)?.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{match.sport}</h3>
                                    <p className="text-sm text-gray-600">{match.skillLevel}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${match.status === 'Open'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {match.status}
                            </span>
                        </div>

                        <p className="text-gray-700 mb-4">{match.description}</p>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2 text-primary-600" />
                                {new Date(match.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2 text-primary-600" />
                                {match.time}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                                {match.venue}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Users className="w-4 h-4 mr-2 text-primary-600" />
                                {match.currentPlayers}/{match.maxPlayers} players
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <DollarSign className="w-4 h-4 mr-2 text-primary-600" />

                                PKR {match.price} per person
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                                Organized by <span className="font-semibold text-gray-900">{match.organizer}</span>
                            </div>
                            <Button
                                variant={match.status === 'Open' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => handleJoinMatch(match)}
                                disabled={match.status !== 'Open'}
                            >
                                {match.status === 'Open' ? 'Join Match' : 'Full'}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Join Match Modal */}
            {showJoinModal && selectedMatch && (
                <Modal
                    isOpen={showJoinModal}
                    onClose={() => setShowJoinModal(false)}
                    title="Join Match"
                >
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">{selectedMatch.sport} Match</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date:</span>
                                    <span className="font-medium">{new Date(selectedMatch.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Time:</span>
                                    <span className="font-medium">{selectedMatch.time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Venue:</span>
                                    <span className="font-medium">{selectedMatch.venue}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Skill Level:</span>
                                    <span className="font-medium">{selectedMatch.skillLevel}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Available Slots:</span>
                                    <span className="font-medium text-green-600">
                                        {selectedMatch.maxPlayers - selectedMatch.currentPlayers} remaining
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                    <span className="text-gray-600">Cost:</span>
                                    <span className="font-bold text-lg text-primary-600">PKR {selectedMatch.price}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> You'll receive a confirmation email with venue details and payment instructions.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={() => setShowJoinModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={confirmJoin}
                            >
                                Confirm & Join
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
