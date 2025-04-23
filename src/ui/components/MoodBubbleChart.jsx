import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './css/MoodBubbleChart.css';
import { formatShortDate, formatLongDate } from '../utils/date';

const MoodBubbleChart = ({ data }) => {
  // Ordre vertical : 2 = matin, 1 = soir
  const yLabels = {
    1: 'Matin',
    2: 'Soir'
  };

  // Personnalisation du tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <strong>{formatLongDate(item.date)}</strong>
          <br />
          {item.time} : {item.emoji} {item.mood}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bubble-chart-wrapper chart-card">
      <h2 className="chart-title">📈 Évolution des émotions</h2>
      <ResponsiveContainer width="90%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            type="category"
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(tick) => formatShortDate(tick)}
            angle={-30}
            textAnchor="end"
            height={60}
            reversed={false}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, 3]}
            tickFormatter={(value) => yLabels[value] || ''}
            tick={{ fontSize: 14 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            data={data}
            fill="#7e57c2"
            shape={({ cx, cy, payload }) => (
              <text x={cx} y={cy} dy={6} textAnchor="middle" fontSize={22}>
                {payload.emoji}
              </text>
            )}
          />

        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodBubbleChart;
