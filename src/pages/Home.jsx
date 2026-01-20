import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, Trophy, MapPin } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { sportsCategories, upcomingEvents } from '../data/mockData';
import { useState } from 'react';

export default function Home() {
    const [selectedSport, setSelectedSport] = useState(null);

    const filteredEvents = selectedSport
        ? upcomingEvents.filter(event => event.sport === selectedSport)
        : upcomingEvents;

    return (
        <div className="space-y-16 pb-16">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

                <div className="container-custom relative py-20 lg:py-32">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 animate-fade-in">
                            Book Your Game,<br />
                            <span className="text-secondary-00">Smash Your Goals</span>
                        </h1>
                        <p className="text-xl sm:text-2xl text-primary-100 mb-8 animate-fade-in-delay">
                            Join the ultimate sports community. Find matches, book venues, and compete in tournaments.
                        </p>
                        <div className="flex flex-wrap gap-4 animate-fade-in-delay-2">
                            <Link to="/matches">
                                <Button variant="secondary" size="lg" className="shadow-xl hover:shadow-2xl">
                                    Find a Match
                                </Button>
                            </Link>
                            <Link to="/events">
                                <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                                    Browse Events
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="container-custom relative pb-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Users, label: 'Active Players', value: '10K+' },
                            { icon: Calendar, label: 'Events/Month', value: '500+' },
                            { icon: MapPin, label: 'Venues', value: '150+' },
                            { icon: Trophy, label: 'Tournaments', value: '50+' },
                        ].map((stat, index) => (
                            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center transform hover:scale-105 transition-transform">
                                <stat.icon className="w-8 h-8 mx-auto mb-3 text-secondary-300" />
                                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                <div className="text-sm text-primary-100">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sports Categories */}
            <section className="container-custom">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
                        Choose Your Sport
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Filter events and matches by your favorite sports
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                    {sportsCategories.map((sport) => (
                        <button
                            key={sport.id}
                            onClick={() => setSelectedSport(selectedSport === sport.name ? null : sport.name)}
                            className={`group p-6 rounded-2xl text-center transition-all transform hover:scale-105 ${selectedSport === sport.name
                                ? `${sport.color} text-white shadow-xl scale-105`
                                : 'bg-white hover:shadow-lg'
                                }`}
                        >
                            <div className="text-4xl mb-3">{sport.icon}</div>
                            <div className={`font-semibold text-sm ${selectedSport === sport.name ? 'text-white' : 'text-gray-700'
                                }`}>
                                {sport.name}
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Upcoming Events */}
            <section className="container-custom">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
                        {selectedSport ? `${selectedSport} Events` : 'Upcoming Events'}
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Join exciting tournaments and competitions
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredEvents.map((event) => (
                        <Link key={event.id} to={`/events/${event.id}`}>
                            <Card className="group cursor-pointer h-full hover:shadow-xl transition-all duration-300 overflow-hidden">
                                {/* Image Section */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />

                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${event.status === 'Open'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-red-500 text-white'
                                            }`}>
                                            {event.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-5">
                                    {/* Title - Centered */}
                                    <h3 className="text-center font-bold text-lg mb-3 text-gray-900 group-hover:text-primary-600 transition-colors leading-tight">
                                        {event.title}
                                    </h3>

                                    {/* Description - Left Aligned */}
                                    <p className="text-left text-xs text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                        {event.description}
                                    </p>

                                    {/* Metadata - Left Aligned with consistent spacing */}
                                    <div className="space-y-2.5 mb-4">
                                        <div className="flex items-center text-[10px] text-gray-700">
                                            <Calendar className="w-3.5 h-3.5 mr-2 text-primary-600 flex-shrink-0" />
                                            <span className="leading-none whitespace-nowrap">
                                                {new Date(event.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })} at {event.time}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-[10px] text-gray-700">
                                            <MapPin className="w-3.5 h-3.5 mr-2 text-primary-600 flex-shrink-0" />
                                            <span className="leading-none truncate">{event.location}</span>
                                        </div>

                                        <div className="flex items-center text-[10px] text-gray-700">
                                            <Users className="w-3.5 h-3.5 mr-2 text-primary-600 flex-shrink-0" />
                                            <span className="leading-none">
                                                {event.participants}/{event.maxParticipants} participants
                                            </span>
                                        </div>
                                    </div>

                                    {/* Price - Only show if paid */}
                                    {event.price > 0 && (
                                        <div className="pt-4 border-t border-gray-100 text-center">
                                            <span className="text-xs text-gray-500 mr-2">Entry Fee</span>
                                            <span className="text-lg font-bold text-primary-600">
                                                Rs{event.price}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link to="/events">
                        <Button variant="primary" size="lg" className="px-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                            View All
                        </Button>
                    </Link>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container-custom">
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

                    <div className="relative max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl text-primary-100 mb-8">
                            Join thousands of athletes and sports enthusiasts in your area
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link to="/register">
                                <Button variant="secondary" size="lg" className="shadow-xl">
                                    Create Account
                                </Button>
                            </Link>
                            <Link to="/venues">
                                <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                                    Explore Venues
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
