import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Clock, DollarSign, Check, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { venues } from '../../data/mockData';

export default function VenueDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const venue = venues.find(v => v.id === parseInt(id));
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!venue) {
        return (
            <div className="container-custom py-16 text-center">
                <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Venue Not Found</h2>
                <p className="text-gray-600 mb-6">The venue you're looking for doesn't exist.</p>
                <Button onClick={() => navigate('/venues')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Venues
                </Button>
            </div>
        );
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % venue.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + venue.images.length) % venue.images.length);
    };

    return (
        <div className="pb-16">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="container-custom py-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/venues')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Venues
                    </Button>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-2">
                                {venue.name}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold text-gray-900">{venue.rating}</span>
                                    <span>({venue.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-5 h-5 text-primary-600" />
                                    <span>{venue.location}</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="primary" size="lg">
                            Book Now
                        </Button>
                    </div>
                </div>
            </div>

            {/* Image Gallery */}
            <div className="container-custom py-8">
                <div className="relative h-96 sm:h-[500px] rounded-2xl overflow-hidden bg-gray-900">
                    <img
                        src={venue.images[currentImageIndex]}
                        alt={`${venue.name} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                    />

                    {/* Navigation Buttons */}
                    {venue.images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-900" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg"
                            >
                                <ChevronRight className="w-6 h-6 text-gray-900" />
                            </button>
                        </>
                    )}

                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {venue.images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex
                                        ? 'bg-white w-8'
                                        : 'bg-white/50 hover:bg-white/75'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Thumbnail Gallery */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                    {venue.images.map((image, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`relative h-24 rounded-lg overflow-hidden ${idx === currentImageIndex
                                    ? 'ring-4 ring-primary-500'
                                    : 'opacity-60 hover:opacity-100'
                                } transition-all`}
                        >
                            <img
                                src={image}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="container-custom">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Venue</h2>
                            <p className="text-gray-700 leading-relaxed">{venue.description}</p>
                        </Card>

                        {/* Sports Available */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sports Available</h2>
                            <div className="flex flex-wrap gap-3">
                                {venue.sports.map((sport, idx) => (
                                    <span
                                        key={idx}
                                        className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-semibold"
                                    >
                                        {sport}
                                    </span>
                                ))}
                            </div>
                        </Card>

                        {/* Amenities */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {venue.amenities.map((amenity, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-5 h-5 text-green-600" />
                                        </div>
                                        <span className="text-gray-700">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Location Map */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
                            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4">
                                <div className="text-center text-gray-600">
                                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                                    <p className="font-semibold">{venue.location}</p>
                                    <p className="text-sm mt-2">Interactive map would be displayed here</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 text-gray-700">
                                <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                <span>{venue.location}</span>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Booking Card */}
                        <Card className="p-6 sticky top-24">
                            <div className="mb-6">
                                <div className="text-sm text-gray-600 mb-1">Price Range</div>
                                <div className="text-3xl font-bold text-primary-600">{venue.priceRange}</div>
                                <div className="text-sm text-gray-600 mt-1">per hour</div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Clock className="w-5 h-5 text-primary-600" />
                                    <div>
                                        <div className="text-sm text-gray-600">Hours</div>
                                        <div className="font-semibold">{venue.hours}</div>
                                    </div>
                                </div>
                            </div>

                            <Button variant="primary" className="w-full mb-3">
                                Book This Venue
                            </Button>
                            <Button variant="outline" className="w-full">
                                Check Availability
                            </Button>

                            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                                <h3 className="font-semibold text-gray-900">Contact Information</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-primary-600" />
                                    <span>+1 (555) 123-4567</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="w-4 h-4 text-primary-600" />
                                    <span>info@{venue.name.toLowerCase().replace(/\s+/g, '')}.com</span>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Info */}
                        <Card className="p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">Online booking available</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">Equipment rental available</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">Professional coaching</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">Free parking</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
