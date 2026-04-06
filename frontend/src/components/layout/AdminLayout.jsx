import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, LogOut, Calendar, TrendingUp,
    Users, CalendarDays, MapPin, Trophy, Menu, X, ChevronRight, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

/**
 * AdminLayout — Kleon-inspired layout with collapsible sidebar + dark/light toggle
 */
export default function AdminLayout() {
    const { logout, currentUser } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-[#f8f9fc]'}`}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className={`fixed inset-0 backdrop-blur-sm z-40 lg:hidden ${isDark ? 'bg-black/60' : 'bg-black/40'}`}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-full w-[260px] border-r transition-all duration-300 ease-in-out
                ${isDark ? 'bg-gray-800 border-gray-700 shadow-xl' : 'bg-white border-gray-200/80 shadow-xl lg:shadow-sm'}
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Logo + Theme Toggle */}
                <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-lg font-extrabold text-white">B</span>
                        </div>
                        <div>
                            <h1 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>BookNSmash</h1>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Admin Panel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                        </button>
                        <button
                            className={`lg:hidden p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        </button>
                    </div>
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
                                        : isDark
                                            ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <Icon className={`w-[18px] h-[18px] ${active ? 'text-white' : isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                <span className="flex-1">{item.label}</span>
                                {active && <ChevronRight className="w-4 h-4 text-white/60" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Admin profile footer */}
                <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className={`flex items-center gap-3 px-3 py-3 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50/80'}`}>
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow">
                            {currentUser?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentUser?.name || 'Admin'}</p>
                            <p className="text-[10px] font-medium text-gray-400">Administrator</p>
                        </div>
                        <button
                            onClick={logout}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-red-400 hover:bg-gray-800' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
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
                <header className={`sticky top-0 z-30 backdrop-blur-xl border-b lg:hidden ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200/60'}`}>
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                        >
                            <Menu className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold text-white">B</span>
                            </div>
                            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>BookNSmash</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleTheme}
                                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                                {currentUser?.name?.charAt(0) || 'A'}
                            </div>
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
