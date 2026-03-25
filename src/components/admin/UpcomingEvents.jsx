import { CalendarDays } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * UpcomingEvents — Lists upcoming events with registration progress bars using DataContext
 * @param {{ events: Array }} props
 */
export default function UpcomingEvents({ events = [] }) {
    const { isDark } = useTheme();

    // Filter for upcoming/ongoing events, limit to 5
    const upcomingEvents = events
        .filter(e => e.status === 'UPCOMING' || e.status === 'ONGOING')
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 5);

    const progressColors = [
        'from-indigo-500 to-blue-500',
        'from-emerald-500 to-teal-500',
        'from-amber-500 to-orange-500',
        'from-pink-500 to-rose-500',
        'from-violet-500 to-purple-500',
    ];

    return (
        <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100/80'}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Upcoming Events</h3>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Events with highest priority</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}>
                    {upcomingEvents.length} active
                </span>
            </div>

            {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                    {upcomingEvents.map((event, index) => {
                        const maxP = event.maxParticipants || 1;
                        const currentP = event.registrations || 0;
                        const fillPct = Math.min(Math.round((currentP / maxP) * 100), 100);
                        const colorClass = progressColors[index % progressColors.length];

                        return (
                            <div key={event.id} className={`group p-4 rounded-xl transition-colors ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50/70 hover:bg-gray-50'}`}>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <CalendarDays className="w-3 h-3" />
                                                {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="text-xs font-bold text-indigo-500 uppercase">{event.sport}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        event.status === 'ONGOING'
                                            ? isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700'
                                            : isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {event.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                        <div
                                            className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500`}
                                            style={{ width: `${fillPct}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-bold whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{fillPct}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className={`flex flex-col items-center justify-center py-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <CalendarDays className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">No upcoming events</p>
                    <p className="text-xs mt-1">Create a new event to get started</p>
                </div>
            )}
        </div>
    );
}
