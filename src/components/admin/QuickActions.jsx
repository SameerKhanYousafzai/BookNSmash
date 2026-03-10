import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Users, MapPin, Trophy, BarChart3, ShoppingBag } from 'lucide-react';

const actions = [
    { label: 'Create Event', icon: CalendarPlus, path: '/admin/events', gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Manage Players', icon: Users, path: '/admin/players', gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Manage Venues', icon: MapPin, path: '/admin/venues', gradient: 'from-amber-500 to-orange-600' },
    { label: 'Manage Teams', icon: Trophy, path: '/admin/teams', gradient: 'from-violet-500 to-purple-600' },
    { label: 'Weekly Analytics', icon: BarChart3, path: '/admin/dashboard/weekly', gradient: 'from-pink-500 to-rose-600' },
    { label: 'Monthly Analytics', icon: BarChart3, path: '/admin/dashboard/monthly', gradient: 'from-cyan-500 to-blue-600' },
];

/**
 * QuickActions — Modern shortcut grid with gradient icon buttons
 */
export default function QuickActions() {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className="group flex flex-col items-center gap-2.5 p-4 rounded-xl bg-gray-50/70 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200/80 transition-all duration-200"
                        >
                            <div className={`w-11 h-11 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{action.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
