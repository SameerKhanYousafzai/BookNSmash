import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * MetricsCard — Kleon-style stat card with gradient icon and trend badge
 * @param {{ label: string, value: string|number, trend: string, icon: React.ComponentType, color: string }} props
 */
export default function MetricsCard({ label, value, trend = '+0%', icon: Icon, color = 'blue' }) {
    const { isDark } = useTheme();
    const isPositive = trend.startsWith('+') && trend !== '+0%';
    const isNeutral = trend === '+0%' || trend === '0%';

    const gradients = {
        blue: 'from-blue-500 to-indigo-600',
        green: 'from-emerald-500 to-teal-600',
        purple: 'from-violet-500 to-purple-600',
        orange: 'from-amber-500 to-orange-600',
        pink: 'from-pink-500 to-rose-600',
    };

    const gradient = gradients[color] || gradients.blue;

    return (
        <div className={`group relative rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100/80'
        }`}>
            {/* Subtle background accent */}
            <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${gradient} rounded-full opacity-[0.07] group-hover:opacity-[0.12] transition-opacity`} />

            <div className="relative flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {!isNeutral && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isPositive
                            ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                            : isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                    }`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {trend}
                    </div>
                )}
            </div>

            <div className="relative">
                <div className={`text-3xl font-extrabold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {value}
                </div>
                <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
            </div>
        </div>
    );
}
