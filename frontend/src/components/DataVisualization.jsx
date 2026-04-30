import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function DataVisualization({ data }) {
    if (!data || data.length === 0) return null;

    const keys = Object.keys(data[0]);
    let xKey = keys.find(k => typeof data[0][k] === 'string') || keys[0];
    let yKey = keys.find(k => typeof data[0][k] === 'number') || keys[1];

    if (!xKey || !yKey) return null;

    return (
        <div className="h-48 md:h-64 w-full mt-3 glass-card p-3 md:p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-3.5 w-3.5 text-gray-400" />
                <h4 className="text-xs text-gray-400 uppercase font-medium">Auto-Generated Chart</h4>
            </div>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey={xKey} stroke="#6b7280" tick={{fill: '#9CA3AF', fontSize: 11}} />
                    <YAxis stroke="#6b7280" tick={{fill: '#9CA3AF', fontSize: 11}} />
                    <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: 12}} />
                    <Bar dataKey={yKey} fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
