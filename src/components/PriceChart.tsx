'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface PriceChartProps {
  cryptoId: string;
  days?: number;
}

interface ChartPoint {
  time: number;
  price: number;
}

const compact = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);

export default function PriceChart({ cryptoId, days = 7 }: PriceChartProps) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    axios
      .get('/api/crypto/history', { params: { id: cryptoId, days } })
      .then((response) => {
        if (cancelled) return;
        const prices: [number, number][] = Array.isArray(response.data?.prices) ? response.data.prices : [];
        setData(prices.map(([time, price]) => ({ time, price })));
      })
      .catch((err) => {
        if (cancelled) return;
        const message = axios.isAxiosError(err) ? err.response?.data?.error : null;
        setError(typeof message === 'string' ? message : 'Failed to load price history');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cryptoId, days]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-slate-800/60" aria-label="Loading chart" />;
  }
  if (error) {
    return <div className="flex h-64 items-center justify-center text-sm text-rose-300">{error}</div>;
  }
  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-slate-400">No price history available</div>;
  }

  const rising = data[data.length - 1].price >= data[0].price;
  const color = rising ? '#34d399' : '#fb7185';

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 8, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            minTickGap={40}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            width={64}
            domain={['auto', 'auto']}
            tickFormatter={(value: number) => compact(value)}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem' }}
            labelStyle={{ color: '#94a3b8' }}
            labelFormatter={(t: number) => new Date(t).toLocaleString()}
            formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 'Price']}
          />
          <Line type="monotone" dataKey="price" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 5, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
