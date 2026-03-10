import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

/**
 * RegistrationsChart — Recharts area chart showing daily registrations
 * @param {{ data: Array<{day: string, registrations: number}>, title?: string }} props
 */
export default function RegistrationsChart({ data = [], title = 'Registrations Overview' }) {
    const hasData = data.some(d => d.registrations > 0);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Daily registration activity</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
            </div>

            {hasData ? (
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{
                                background: '#1e293b',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '10px 14px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            }}
                            labelStyle={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}
                            itemStyle={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="registrations"
                            stroke="#6366f1"
                            strokeWidth={2.5}
                            fill="url(#regGradient)"
                            dot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-[260px] text-gray-400">
                    <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">No registration data yet</p>
                    <p className="text-xs mt-1">Data will appear as users register for events</p>
                </div>
            )}
        </div>
    );
}
