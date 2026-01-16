import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

export default function Footer() {
    const quickLinks = [
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
    ];

    const sportsLinks = [
        { name: 'Tennis', path: '/matches?sport=tennis' },
        { name: 'Basketball', path: '/matches?sport=basketball' },
        { name: 'Football', path: '/matches?sport=football' },
        { name: 'Badminton', path: '/matches?sport=badminton' },
    ];

    const socialLinks = [
        { icon: Facebook, href: '#', label: 'Facebook' },
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Instagram, href: '#', label: 'Instagram' },
        { icon: Youtube, href: '#', label: 'YouTube' },
    ];

    return (
        <footer className="bg-gray-900 text-gray-300 mt-20">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                                <span className="text-xl font-bold text-white">B</span>
                            </div>
                            <span className="text-xl font-display font-bold text-white">
                                BookNSmash
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            Your ultimate platform for sports events, matches, and community building.
                        </p>
                        <div className="flex space-x-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-sm hover:text-primary-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Sports */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Popular Sports</h3>
                        <ul className="space-y-2">
                            {sportsLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-sm hover:text-primary-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Stay Updated</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Subscribe to our newsletter for updates and exclusive offers.
                        </p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-r-lg transition-colors">
                                <Mail className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} BookNSmash. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
