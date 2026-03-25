import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Target } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

/**
 * SportDistributionChart — Recharts donut chart showing sport breakdown
 * @param {{ data: Array<{name: string, count: number, percentage: number}> }} props
 */
export default function SportDistributionChart({ data = [] }) {
    const { isDark } = useTheme();
    const hasData = data.length > 0 && data.some(d => d.count > 0);

    return (
        <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100/80'}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Sport Distribution</h3>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Activity breakdown by sport</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Target className="w-5 h-5 text-white" />
                </div>
            </div>

            {hasData ? (
                <div className="flex items-center gap-6">
                    <div className="w-40 h-40 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={3}
                                    dataKey="count"
                                    strokeWidth={0}
                                >
                                    {data.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: isDark ? '#111827' : '#1e293b',
                                        border: isDark ? '1px solid #374151' : 'none',
                                        borderRadius: '12px',
                                        padding: '8px 12px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                    }}
                                    itemStyle={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3">
                        {data.map((sport, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <div className="flex-1 flex items-center justify-between">
                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{sport.name}</span>
                                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{sport.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className={`flex flex-col items-center justify-center h-[200px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Target className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">No sport activity yet</p>
                    <p className="text-xs mt-1">Data appears when matches and events are created</p>
                </div>
            )}
        </div>
    );
}
