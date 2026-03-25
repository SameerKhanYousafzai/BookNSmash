import { Trophy } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const BAR_COLORS = [
    'from-indigo-500 to-blue-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-violet-500 to-purple-500',
];

/**
 * TopSportsCard — Shows top sports for the week with progress bars
 * @param {{ data: Array<{name: string, count: number, percentage: number}> }} props
 */
export default function TopSportsCard({ data = [] }) {
    const { isDark } = useTheme();
    const hasData = data.length > 0 && data.some(d => d.count > 0);
    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100/80'}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Top Sports This Week</h3>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Most popular activities</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
                    {data.length} sports
                </span>
            </div>

            {hasData ? (
                <div className="space-y-4">
                    {data.map((sport, index) => {
                        const fillPct = Math.round((sport.count / maxCount) * 100);
                        const barColor = BAR_COLORS[index % BAR_COLORS.length];
                        return (
                            <div key={sport.name} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{sport.name}</span>
                                    <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{sport.count} events</span>
                                </div>
                                <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <div
                                        className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-700`}
                                        style={{ width: `${fillPct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className={`flex flex-col items-center justify-center py-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Trophy className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">No sport data yet</p>
                    <p className="text-xs mt-1">Data appears when events are created</p>
                </div>
            )}
        </div>
    );
}
