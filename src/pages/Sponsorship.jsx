import { Check, Star, Award, Crown } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { sponsorshipPackages } from '../data/mockData';

export default function Sponsorship() {
    const handleContact = (tier) => {
        alert(`Thank you for your interest in ${tier} sponsorship! Our team will contact you soon.`);
    };

    return (
        <div className="pb-16">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-20">
                <div className="container-custom text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6">
                        Become a Sponsor
                    </h1>
                    <p className="text-xl sm:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
                        Partner with BookNSmash and reach thousands of active sports enthusiasts
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Button variant="secondary" size="lg">
                            View Packages
                        </Button>
                        <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                            Contact Us
                        </Button>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="container-custom py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
                        Why Sponsor BookNSmash?
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Gain visibility and connect with an engaged community of athletes
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            icon: Star,
                            title: 'Brand Visibility',
                            description: 'Get your brand in front of 10,000+ active users monthly',
                        },
                        {
                            icon: Award,
                            title: 'Community Engagement',
                            description: 'Connect with passionate sports enthusiasts and athletes',
                        },
                        {
                            icon: Crown,
                            title: 'Premium Placement',
                            description: 'Featured positioning across our platform and events',
                        },
                        {
                            icon: Check,
                            title: 'Measurable Results',
                            description: 'Track your sponsorship impact with detailed analytics',
                        },
                    ].map((benefit, idx) => (
                        <Card key={idx} className="p-6 text-center hover:shadow-xl transition-all">
                            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <benefit.icon className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                            <p className="text-gray-600 text-sm">{benefit.description}</p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Sponsorship Packages */}
            <section className="bg-gray-50 py-16">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
                            Sponsorship Packages
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Choose the package that best fits your marketing goals
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {sponsorshipPackages.map((pkg) => (
                            <Card
                                key={pkg.id}
                                className={`p-8 relative ${pkg.popular ? 'ring-4 ring-primary-500 shadow-2xl scale-105' : ''
                                    }`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="px-4 py-1 bg-primary-600 text-white rounded-full text-sm font-semibold shadow-lg">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className={`w-16 h-16 bg-gradient-to-br ${pkg.color} rounded-2xl flex items-center justify-center mb-6`}>
                                    <Award className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.tier}</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">
                                        PKR {pkg.price.toLocaleString()}
                                    </span>
                                    <span className="text-gray-600">/year</span>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {pkg.benefits.map((benefit, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    variant={pkg.popular ? 'primary' : 'outline'}
                                    className="w-full"
                                    onClick={() => handleContact(pkg.tier)}
                                >
                                    Get Started
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Branding Placements */}
            <section className="container-custom py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
                        Your Brand Everywhere
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Strategic placement across our platform for maximum visibility
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        {
                            title: 'Event Sponsorship',
                            description: 'Your logo prominently displayed at all sponsored events, on promotional materials, and in event communications.',
                            placements: ['Event banners', 'Email campaigns', 'Social media posts', 'Event programs'],
                        },
                        {
                            title: 'Digital Presence',
                            description: 'Featured placement across our website and mobile app, reaching thousands of daily active users.',
                            placements: ['Homepage banner', 'Event pages', 'Email newsletters', 'Mobile app'],
                        },
                        {
                            title: 'Venue Branding',
                            description: 'Physical branding at partner venues and facilities during tournaments and regular play.',
                            placements: ['Venue signage', 'Court/field banners', 'Scoreboard displays', 'Facility materials'],
                        },
                        {
                            title: 'Community Engagement',
                            description: 'Connect directly with our community through exclusive sponsor content and activations.',
                            placements: ['Sponsored content', 'Community features', 'Player profiles', 'Team pages'],
                        },
                    ].map((placement, idx) => (
                        <Card key={idx} className="p-6 hover:shadow-xl transition-all">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{placement.title}</h3>
                            <p className="text-gray-700 mb-4">{placement.description}</p>
                            <div className="space-y-2">
                                {placement.placements.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container-custom">
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                        Contact our sponsorship team to discuss custom packages tailored to your needs
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Button variant="secondary" size="lg">
                            Schedule a Call
                        </Button>
                        <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                            Download Prospectus
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
