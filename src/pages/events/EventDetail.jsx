import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Trophy, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import api from '../../services/api';

export default function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { events, venues, loading } = useData();
    const { currentUser } = useAuth();

    // Find event with UUID-safe matching
    const event = (events || []).find(e => String(e.id) === String(id));

    // Find associated venue
    const venue = (venues || []).find(v => v.id === event?.venueId);

    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    if (loading.events && !event) {
        return (
            <div className="container-custom py-32 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                <p className="text-gray-600 font-medium">Loading event details...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container-custom py-16 text-center">
                <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
                <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been moved.</p>
                <Button onClick={() => navigate('/events')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Events
                </Button>
            </div>
        );
    }

    // Mock tournament bracket data
    const brackets = [
        {
            round: 'Quarter Finals', matches: [
                { team1: 'Team A', team2: 'Team B', score: '3-1' },
                { team1: 'Team C', team2: 'Team D', score: '2-3' },
                { team1: 'Team E', team2: 'Team F', score: '3-0' },
                { team1: 'Team G', team2: 'Team H', score: '1-3' },
            ]
        },
        {
            round: 'Semi Finals', matches: [
                { team1: 'Team A', team2: 'Team D', score: 'TBD' },
                { team1: 'Team E', team2: 'Team H', score: 'TBD' },
            ]
        },
        {
            round: 'Finals', matches: [
                { team1: 'Winner 1', team2: 'Winner 2', score: 'TBD' },
            ]
        },
    ];

    // Mock schedule
    const schedule = [
        { time: '09:00 AM', match: 'Team A vs Team B', court: 'Court 1' },
        { time: '10:30 AM', match: 'Team C vs Team D', court: 'Court 2' },
        { time: '12:00 PM', match: 'Team E vs Team F', court: 'Court 1' },
        { time: '01:30 PM', match: 'Team G vs Team H', court: 'Court 2' },
        { time: '03:00 PM', match: 'Semi Final 1', court: 'Court 1' },
        { time: '04:30 PM', match: 'Semi Final 2', court: 'Court 2' },
        { time: '06:00 PM', match: 'Finals', court: 'Main Court' },
    ];

    // ─── Register for event via backend API ───────────────────────────────────
    const handleRegister = async () => {
        if (!currentUser) {
            setMessage({ type: 'error', text: 'Please log in to register for events.' });
            return;
        }

        setRegistering(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await api.post(`/events/${event.id}/register`);
            const data = await res.json();

            if (res.status === 201) {
                setMessage({ type: 'success', text: 'Registration successful! You are now registered for this event.' });
                setTimeout(() => {
                    setShowRegistrationModal(false);
                    setMessage({ type: '', text: '' });
                }, 2500);
            } else if (res.status === 409) {
                setMessage({ type: 'error', text: 'You are already registered for this event.' });
            } else if (res.status === 400) {
                setMessage({ type: 'error', text: 'This event is full. No more spots available.' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Registration failed. Please try again.' });
            }
        } catch (error) {
            console.error('❌ Registration error:', error);
            setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
        } finally {
            setRegistering(false);
        }
    };

    const participants = event.participantCount || event.participants || 0;
    const maxParticipants = event.maxParticipants || 50;
    const spotsRemaining = maxParticipants - participants;
    const percentFilled = (participants / maxParticipants) * 100;

    // Handle both field names (legacy vs DB)
    const eventDate = event.startDate || event.date;
    const eventTime = event.startDate ? new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : event.time;

    // Default image based on sport
    const defaultEventImage = `https://images.unsplash.com/photo-${event.sport?.toLowerCase().includes('tennis') ? '1554068865-24cecd4e34b8' :
        event.sport?.toLowerCase().includes('basketball') ? '1546519638-68e109498ffc' :
            event.sport?.toLowerCase().includes('football') ? '1579952363873-27f3bade9f55' :
                '1554068865-24cecd4e34b8'
        }?w=1200`;

    return (
        <div className="pb-16">
            {/* Hero Section */}
            <div className="relative h-96 bg-gray-900">
                <img
                    src={event.image || defaultEventImage}
                    alt={event.title}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute inset-0 flex items-end">
                    <div className="container-custom pb-12">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/events')}
                            className="mb-6 text-white hover:bg-white/20"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Events
                        </Button>
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${(event.status === 'Open' || event.status === 'UPCOMING')
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                                }`}>
                                {event.status}
                            </span>
                            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white/20 text-white backdrop-blur-sm">
                                {event.sport}
                            </span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
                            {event.title}
                        </h1>
                        <p className="text-xl text-gray-200 max-w-3xl">
                            {event.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container-custom py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Event Details */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="text-sm text-gray-600">Date</div>
                                        <div className="font-semibold text-gray-900">
                                            {eventDate ? new Date(eventDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'TBD'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="text-sm text-gray-600">Time</div>
                                        <div className="font-semibold text-gray-900">{eventTime || 'TBD'}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="text-sm text-gray-600">Location</div>
                                        <div className="font-semibold text-gray-900">{venue?.name || event.location || 'TBD'}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <DollarSign className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="text-sm text-gray-600">Entry Fee</div>
                                        <div className="font-semibold text-gray-900">
                                            {parseFloat(event.entryFee || event.price) > 0 ? formatCurrency(event.entryFee || event.price) : 'FREE'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Tournament Brackets */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tournament Bracket</h2>
                            <div className="space-y-6 overflow-x-auto">
                                {brackets.map((bracket, idx) => (
                                    <div key={idx}>
                                        <h3 className="font-semibold text-lg text-gray-900 mb-3">{bracket.round}</h3>
                                        <div className="space-y-2">
                                            {bracket.matches.map((match, matchIdx) => (
                                                <div key={matchIdx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">{match.team1}</div>
                                                        <div className="text-sm text-gray-600">vs</div>
                                                        <div className="font-medium text-gray-900">{match.team2}</div>
                                                    </div>
                                                    <div className="text-xl font-bold text-primary-600">
                                                        {match.score}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Match Schedule */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Match Schedule</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Time</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Match</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Court</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedule.map((item, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-gray-900 font-medium">{item.time}</td>
                                                <td className="py-3 px-4 text-gray-700">{item.match}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.court}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Registration Card */}
                        <Card className="p-6 sticky top-24">
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Registration</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {participants}/{maxParticipants}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(percentFilled, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    {spotsRemaining > 0 ? `${spotsRemaining} ${spotsRemaining === 1 ? 'spot' : 'spots'} remaining` : 'Event is full'}
                                </p>
                            </div>

                            {parseFloat(event.entryFee || event.price) > 0 && (
                                <div className="mb-6 pb-6 border-b border-gray-200">
                                    <div className="text-sm text-gray-600 mb-1">Entry Fee</div>
                                    <div className="text-3xl font-bold text-primary-600">{formatCurrency(event.entryFee || event.price)}</div>
                                </div>
                            )}

                            <Button
                                variant="primary"
                                className="w-full mb-4"
                                onClick={() => setShowRegistrationModal(true)}
                                disabled={event.status !== 'Open' && event.status !== 'UPCOMING'}
                            >
                                {(event.status === 'Open' || event.status === 'UPCOMING') ? 'Register Now' : 'Registration Closed'}
                            </Button>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">Instant confirmation</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">Email updates</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">Free cancellation 48h before</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Registration Modal — calls backend API */}
            {showRegistrationModal && (
                <Modal
                    isOpen={showRegistrationModal}
                    onClose={() => { setShowRegistrationModal(false); setMessage({ type: '', text: '' }); }}
                    title="Event Registration"
                >
                    <div className="space-y-4">
                        {message.text && (
                            <div
                                className={`p-4 rounded-lg flex items-start space-x-3 ${message.type === 'success'
                                    ? 'bg-green-50 text-green-800'
                                    : 'bg-red-50 text-red-800'
                                    }`}
                            >
                                {message.type === 'success' ? (
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                )}
                                <p className="text-sm font-medium">{message.text}</p>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                                <div>{eventDate ? new Date(eventDate).toLocaleDateString() : 'TBD'} {eventTime ? `at ${eventTime}` : ''}</div>
                                <div>{venue?.name || event.location || 'Location TBD'}</div>
                                {parseFloat(event.entryFee || event.price) > 0 && <div className="font-semibold text-primary-600">Entry Fee: {formatCurrency(event.entryFee || event.price)}</div>}
                            </div>
                        </div>

                        {!currentUser && (
                            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                                <p className="text-sm font-medium">Please <Link to="/login" className="underline font-bold">log in</Link> to register for this event.</p>
                            </div>
                        )}

                        {currentUser && (
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    Registering as <span className="font-semibold">{currentUser.name || currentUser.email}</span>
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={() => { setShowRegistrationModal(false); setMessage({ type: '', text: '' }); }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handleRegister}
                                disabled={registering || !currentUser}
                            >
                                {registering ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Registering...
                                    </>
                                ) : (
                                    'Confirm Registration'
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
