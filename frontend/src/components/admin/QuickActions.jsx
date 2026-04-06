import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Users, MapPin, Trophy, BarChart3 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const actions = [
    { label: 'Create Event', icon: CalendarPlus, path: '/admin/events', gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Manage Players', icon: Users, path: '/admin/players', gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Manage Venues', icon: MapPin, path: '/admin/venues', gradient: 'from-amber-500 to-orange-600' },
    { label: 'Manage Teams', icon: Trophy, path: '/admin/teams', gradient: 'from-violet-500 to-purple-600' },
    { label: 'Analytics Dashboard', icon: BarChart3, path: '/admin/dashboard', gradient: 'from-pink-500 to-rose-600' },
];

/**
 * QuickActions — Modern shortcut grid with gradient icon buttons
 */
export default function QuickActions() {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    return (
        <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100/80'}`}>
            <h3 className={`text-lg font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className={`group flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-200 ${
                                isDark
                                    ? 'bg-gray-700/50 hover:bg-gray-700 border-transparent hover:border-gray-600'
                                    : 'bg-gray-50/70 hover:bg-white hover:shadow-md border-transparent hover:border-gray-200/80'
                            }`}
                        >
                            <div className={`w-11 h-11 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className={`text-xs font-semibold text-center leading-tight ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{action.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
