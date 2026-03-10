import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, LogOut, Calendar, TrendingUp,
    Users, CalendarDays, MapPin, Trophy, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminLayout — Kleon-inspired layout with collapsible sidebar
 */
export default function AdminLayout() {
    const { logout, currentUser } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/admin/dashboard/weekly', label: 'Weekly Stats', icon: Calendar },
        { path: '/admin/dashboard/monthly', label: 'Monthly Stats', icon: TrendingUp },
        { path: '/admin/dashboard/yearly', label: 'Yearly Stats', icon: LayoutDashboard },
        { path: '/admin/players', label: 'Players', icon: Users },
        { path: '/admin/events', label: 'Events', icon: CalendarDays },
        { path: '/admin/venues', label: 'Venues', icon: MapPin },
        { path: '/admin/teams', label: 'Teams', icon: Trophy },
    ];

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-full w-[260px] bg-white border-r border-gray-200/80
                shadow-xl lg:shadow-sm transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-lg font-extrabold text-white">B</span>
                        </div>
                        <div>
                            <h1 className="text-base font-extrabold text-gray-900 tracking-tight">BookNSmash</h1>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Admin Panel</p>
                        </div>
                    </div>
                    <button
                        className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">Navigation</p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    active
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <Icon className={`w-[18px] h-[18px] ${active ? 'text-white' : 'text-gray-400'}`} />
                                <span className="flex-1">{item.label}</span>
                                {active && <ChevronRight className="w-4 h-4 text-white/60" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Admin profile footer */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50/80">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow">
                            {currentUser?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name || 'Admin'}</p>
                            <p className="text-[10px] font-medium text-gray-400">Administrator</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="lg:ml-[260px] min-h-screen">
                {/* Top bar (mobile) */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 lg:hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <Menu className="w-5 h-5 text-gray-700" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold text-white">B</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">BookNSmash</span>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                            {currentUser?.name?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
