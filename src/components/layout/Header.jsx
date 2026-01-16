import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogIn, LogOut, UserCircle } from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { isAuthenticated, currentUser, logout } = useAuth();

    const navigation = [
        { name: 'Home', path: '/' },
        { name: 'Matches', path: '/matches' },
        { name: 'Events', path: '/events' },
        { name: 'Venues', path: '/venues' },
        { name: 'Community', path: '/community' },
        { name: 'Shop', path: '/shop' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-40 glass-effect shadow-md">
            <nav className="container-custom">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <span className="text-2xl font-bold text-white">B</span>
                        </div>
                        <span className="text-2xl font-display font-bold text-gradient hidden sm:block">
                            BookNSmash
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${isActive(item.path)
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden lg:flex items-center space-x-3">
                        {isAuthenticated ? (
                            <>
                                <Link to="/profile">
                                    <Button variant="ghost" size="sm">
                                        <UserCircle className="w-4 h-4 mr-2" />
                                        {currentUser?.name}
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={logout} className="text-red-600 hover:bg-red-50">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" size="sm">
                                        <User className="w-4 h-4 mr-2" />
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-gray-200 animate-slide-down">
                        <div className="flex flex-col space-y-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${isActive(item.path)
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-gray-200 space-y-2">
                                {isAuthenticated ? (
                                    <>
                                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="ghost" className="w-full justify-center">
                                                <UserCircle className="w-4 h-4 mr-2" />
                                                Profile
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-center text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                logout();
                                            }}
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="ghost" className="w-full justify-center">
                                                <LogIn className="w-4 h-4 mr-2" />
                                                Login
                                            </Button>
                                        </Link>
                                        <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="primary" className="w-full justify-center">
                                                <User className="w-4 h-4 mr-2" />
                                                Sign Up
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
