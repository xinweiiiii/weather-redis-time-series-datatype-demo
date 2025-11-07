import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { WeatherPoint } from '../lib/types';


export function WeatherChart({ data }: { data: WeatherPoint[] }) {
    const formatTime = (ms: number) => new Date(ms).toLocaleTimeString()
    return (
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ts"
              type="number"
              domain={['auto', 'auto']}
              tickFormatter={formatTime}
            />
            <YAxis dataKey="tempC" allowDecimals={false} width={48} />
            <Tooltip
              labelFormatter={(v) => new Date(v as number).toLocaleString()}
              formatter={(value, name) => [
                value as number,
                name === 'tempC' ? 'Temp (°C)' : name,
              ]}
            />
            <Line type="monotone" dataKey="tempC" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
} 