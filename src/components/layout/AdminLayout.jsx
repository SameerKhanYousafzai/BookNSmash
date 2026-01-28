import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Calendar, TrendingUp, Users, CalendarDays, MapPin, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

/**
 * AdminLayout Component
 * Layout wrapper for all admin pages
 * Includes sidebar navigation and header
 */
export default function AdminLayout() {
    const { logout, currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
    };

    const navItems = [
        { path: '/admin/dashboard/weekly', label: 'Weekly Dashboard', icon: Calendar },
        { path: '/admin/dashboard/monthly', label: 'Monthly Dashboard', icon: TrendingUp },
        { path: '/admin/dashboard/yearly', label: 'Yearly Dashboard', icon: LayoutDashboard },
        { path: '/admin/players', label: 'Player Manager', icon: Users },
        { path: '/admin/events', label: 'Event Manager', icon: CalendarDays },
        { path: '/admin/venues', label: 'Venue Manager', icon: MapPin },
        { path: '/admin/teams', label: 'Teams Manager', icon: Trophy },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <span className="text-xl font-bold text-white">B</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">BookNSmash Admin</h1>
                            <p className="text-sm text-gray-500">Dashboard & Analytics</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white min-h-screen shadow-sm border-r border-gray-200">
                    <nav className="p-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
